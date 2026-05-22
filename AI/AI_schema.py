from pydantic import BaseModel, Field
from typing import List, Optional

# backend에서 AI 분석 결과를 표현하기 위한 Pydantic 스키마 정의 (예시)

# ==========================================
# 1. Core Data Models 

class ActionItemSchema(BaseModel):
    task: str = Field(..., description="추출된 할 일/태스크 설명", example="GPT-4o와 BERT 연결 구현")
    priority: int = Field(..., description="우선순위 (1: 높음, 2: 중간, 3: 낮음)", example=1)

class BertScoreSchema(BaseModel):
    # treshold: recall >= 0.7 
    precision: float = Field(..., description="BERTScore 정밀도")
    recall: float = Field(..., description="BERTScore 재현율 (품질 검증 기준 필터)")
    f1: float = Field(..., description="BERTScore F1 지표")


# ==========================================
# 2. AI analysis request schema (Router -> Service)

class MeetingAnalyzeRequest(BaseModel): 
    # DB retrieval 
    meeting_script: str = Field(..., description="현재 회의 대화 스크립트 전문")
    meeting_purpose: str = Field(..., description="현재 회의 목적/주제")
    participants: str = Field(..., description="회의 참여자 명단 (쉼표 구분)")
    prev_action_items: Optional[str] = Field("없음", description="이전 회의 미완료 Action Items")
    prev_feedback: Optional[str] = Field("없음", description="지난 회의 생산성 피드백")


# ==========================================
# 3. AI analysis response schema 

class MeetingAnalyzeResponse(BaseModel):
    meeting_id: int = Field(..., description="분석된 회의의 고유 ID", example=42)
    summary: str = Field(..., description="회의 핵심 내용 요약 (2-3문장)")
    action_items: List[ActionItemSchema] = Field(..., description="추출된 할 일 목록 및 우선순위")
    qualitative_feedback: str = Field(..., description="회의 효율성 및 생산성 정성 평가")
    next_agenda: List[str] = Field(..., description="차기 회의 추천 안건 리스트")

    class Config:
        from_attributes = True