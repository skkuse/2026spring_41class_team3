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
   - Do not summarize general discussion topics, opinions, or current status as tasks (e.g., do not extract "Discussing ways to improve..." or "Expressing thoughts on...").
   - Extract only explicit to-dos where a task is assigned or clearly planned for the future.
   - Assign Priority: 1 (High), 2 (Medium), 3 (Low) based on urgency and importance.
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

### Example
- Input Transcript: 
  정우: "다들 한 주 동안 고생 많으셨습니다. 오늘 회의는 MARS 프로젝트의 AI 파트 연동, 백엔드 API 설계, 그리고 프론트엔드 대시보드 시각화 기능에 대한 구체적인 역할 분담과 다음 마일스톤을 확정하기 위해 모였습니다. 다들 파트별로 진행할 내용 공유해 주실까요?"
  도현: "네, 저는 백엔드 쪽을 맡았는데, 일단 프론트엔드 팀에서 작업하실 수 있도록 Swagger나 Notion을 활용해 초기 API 명세서를 작성하는 게 급선무인 것 같습니다. 그리고 데이터베이스 스키마 설계도 다음 회의 전까지 완성해서 피드백을 받겠습니다."
  아정: "프론트엔드 쪽은 대시보드 시각화가 핵심이라서, 피그마 시안을 기반으로 UI 컴포넌트 마크업을 먼저 구현해야 합니다. 특히 이번에 들어가는 우선순위 매트릭스 뷰 시각화 작업을 이번 주에 끝내 놓겠습니다."
  정우: "좋습니다. AI 파트인 저는 GPT-4o API 호출부 모듈이랑 BERTScore 평가 엔진을 연결하는 파이썬 코드를 작성하겠습니다. 혹시 AI와 백엔드 간 서버 통신 연동 테스트도 이번 주에 같이 해볼 수 있을까요?"
  도현: "연동 테스트는 스키마랑 API 규격이 나온 직후에 하는 게 좋아서, 이번 주는 각자 로컬 개발 환경 세팅을 완벽히 마치는 데 집중하고 다음 주 회의에서 바로 연동을 맞춰보는 걸로 하죠."
  정우: "좋은 생각입니다. 그럼 채연님은 이번 주에 어떤 작업을 담당해 주실까요?"
  채연: "저는 이번 프로젝트 일정 관리랑 지난주 피드백 수정을 반영해서 회의록 데이터 업로드용 데이터셋 전처리를 맡겠습니다."
  정우: "알겠습니다. 그럼 정리하자면, 정우는 GPT-4o 및 BERT 연결을 구현하고, 도현이는 백엔드 API 규격서 작성과 DB 스키마 설계를 완료합니다. 아정이는 대시보드 UI 컴포넌트 및 우선순위 시각화를 구현하고, 지원이는 데이터셋 전처리를 완료해 주시면 됩니다. 또한 전원 공통으로 다음 주 회의 전까지 로컬 개발 환경 세팅을 마치는 걸로 하죠. 오늘 회의는 여기서 마치겠습니다."
- Output JSON:
{{
  "summary": "MARS 프로젝트 AI 연동 모듈 개발, 백엔드 API 명세서 및 DB 스키마 설계, 프론트엔드 대시보드 우선순위 매트릭스 컴포넌트 구현을 분담하였으며, 데이터 전처리 일정과 공통 로컬 개발 환경 세팅 일정을 합의했습니다.",
  "action_items": [
    {{
      "task": "GPT-4o 및 BERT 연결 구현",
      "priority": 1
    }},
    {{
      "task": "백엔드 API 규격서 작성 및 DB 스키마 설계",
      "priority": 1
    }},
    {{
      "task": "프론트엔드 대시보드 UI 컴포넌트 및 우선순위 시각화 매트릭스 구현",
      "priority": 1
    }},
    {{
      "task": "회의록 업로드용 데이터셋 전처리 및 일정 관리",
      "priority": 2
    }},
    {{
      "task": "다음 회의 전까지 각 파트별 로컬 개발 환경 세팅 완료",
      "priority": 2
    }}
  ],
  "qualitative_feedback": "파트별 역할 분배가 균형 있게 완료되었고 구체적인 마일스톤이 수립되었습니다. 연동 테스트 타이밍 조율과 로컬 세팅 기한 합의 등 전반적인 의사결정 속도가 매우 만족스러운 회의였습니다.",
  "next_agenda": [
    "각 파트별 로컬 개발 환경 세팅 결과 공유 및 확인",
    "API 규격서 초안 검토 및 서버 통신 연동 테스트 계획 논의"
  ]
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
            model="gpt-4o-mini",
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

    f1 = bert_metrics.get("f1", 0.0)
    if f1 < 0.48:
        raise AnalysisQualityError(f1=f1)

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
