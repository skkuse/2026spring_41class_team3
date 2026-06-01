import os
import json
import requests
from openai import OpenAI, OpenAIError
from sqlalchemy.orm import Session
import uuid
from typing import Dict, Any

from app.exceptions import (
    MeetingNotFoundException,
    GPTCallException,
    GPTResponseParseException,
    AnalysisQualityError,
    HFSpaceConnectionException,
    DatabaseSaveException,
)
from app.crud.meeting import get_meeting_analysis_input, save_analysis_result
from app.schemas.meeting import MeetingAnalyzeResponse

_SYSTEM_PROMPT = """
### System Role
You are a professional Meeting Manager. Your task is to analyze meeting transcripts and convert them into actionable data. You specialize in identifying key tasks, evaluating meeting efficiency, and maintaining project continuity by referencing previous contexts.

### Input Data
1. Current Meeting Transcript: {meeting_script}
2. Meeting Metadata: 
   - Purpose: {meeting_purpose}
   - Participants: {participants}
3. Retrieved Context (Previous Meetings):
   - Unfinished Action Items: {prev_action_items}
   - Previous Productivity Score & Feedback: {prev_feedback}

### Tasks
1. Executive Summary: Summarize the core discussion and decisions made in 2-3 concise sentences.
2. Action Items Extraction: Identify all tasks, and assignments
   - Assign Priority: 1 (High), 2 (Medium), 3 (Low) based on the context of urgency and importance.
3. Qualitative Productivity Feedback: Provide a brief evaluation of the meeting's efficiency in 2-3 concise sentences. Identify what went well (e.g., clear decisions) and what could be improved (e.g., lack of focus, redundant discussion).
4. Next Agenda Items: Suggest 2-3 specific topics for the next meeting based on current decisions and unfinished items from the previous context.

### Constraint & Output Format (Strict JSON)
- Return ONLY a valid JSON object.
- Return ONLY in Korean.
- Do not include any pre-text, post-text, or markdown code blocks (unless specified in API call).
- Ensure all keys exist even if the values are empty lists.

{{
  "summary": "...",
  "action_items": [
    {{
      "task": "...",
      "priority": 1
    }}
  ],
  "qualitative_feedback": "...",
  "next_agenda": ["...", "..."]
}}
"""

_HF_SPACE_URL = "https://jeongwoojang-MARS-evaluateBERT.hf.space/evaluate"

def _call_gpt(input_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        prompt = _SYSTEM_PROMPT.format(
            meeting_script=input_data["meeting_script"],
            meeting_purpose=input_data["meeting_purpose"],
            participants=input_data["participants"],
            prev_action_items=input_data.get("prev_action_items", "N/A"),
            prev_feedback=input_data.get("prev_feedback", "N/A"),
        )
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": "Please analyze the meeting based on the instructions."},
            ],
            response_format={"type": "json_object"},
        )
    except OpenAIError as e:
        raise GPTCallException(detail=f"OpenAI API 호출 실패: {e}")

    try:
        return json.loads(response.choices[0].message.content)
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        raise GPTResponseParseException(detail=f"GPT 응답 파싱 실패: {e}")


def _evaluate_bert(raw_text: str, generated_text: Dict[str, Any]) -> Dict[str, float]:
    payload = {"raw_text": raw_text, "generated_text": generated_text}
    try:
        resp = requests.post(_HF_SPACE_URL, json=payload, timeout=60)
        if resp.status_code == 503:
            raise HFSpaceConnectionException(
                detail="Hugging Face Space가 Cold Start 중입니다. 잠시 후 다시 시도해주세요."
            )
        resp.raise_for_status()
        return resp.json()
    except HFSpaceConnectionException:
        raise
    except requests.exceptions.Timeout:
        raise HFSpaceConnectionException(detail="HF Space 응답 시간 초과.")
    except requests.exceptions.ConnectionError:
        raise HFSpaceConnectionException(detail="HF Space 네트워크 연결 실패.")
    except requests.exceptions.RequestException as e:
        raise HFSpaceConnectionException(detail=f"HF Space 통신 오류: {e}")


def analyze_meeting(db: Session, meeting_id: uuid.UUID) -> MeetingAnalyzeResponse:
    input_data = get_meeting_analysis_input(db, meeting_id)
    if input_data is None:
        raise MeetingNotFoundException(meeting_id)

    meeting_script = input_data["meeting_script"]

    gpt_response = _call_gpt(input_data)

    bert_metrics = _evaluate_bert(meeting_script, gpt_response)

    recall = bert_metrics.get("recall", 0.0)
    if recall < 0.4:
        raise AnalysisQualityError(recall=recall)

    from app.models import Meeting as MeetingModel
    meeting_row = db.query(MeetingModel).filter(MeetingModel.id == meeting_id).first()
    project_id = meeting_row.project_id if meeting_row else None

    try:
        save_analysis_result(db, meeting_id, project_id, gpt_response, bert_metrics)
    except Exception as e:
        raise DatabaseSaveException(detail=f"DB 저장 실패: {e}")

    return MeetingAnalyzeResponse(
        meeting_id=meeting_id,
        summary=gpt_response.get("summary", ""),
        action_items=gpt_response.get("action_items", []),
        qualitative_feedback=gpt_response.get("qualitative_feedback", ""),
        next_agenda=gpt_response.get("next_agenda", []),
    )
