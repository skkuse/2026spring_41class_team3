import datetime
import uuid
from pydantic import BaseModel
from typing import Optional, Dict, List, Any


class MeetingCreate(BaseModel):
    title: str
    purpose: Optional[str] = None
    raw_text: Optional[str] = None


class MeetingResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    purpose: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class MeetingSummaryCreate(BaseModel):
    #meeting_id: uuid.UUID
    summary: str
    qualitative_feedback: Optional[str] = None


class MeetingProductivityCreate(BaseModel):
    #meeting_id: uuid.UUID
    score: float
    metrics: Dict[str, Any]


class AgendaCreate(BaseModel):
    #project_id: uuid.UUID
    proposed_agendas: List[str]


class MeetingDetailResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    purpose: Optional[str] = None
    raw_text: Optional[str] = None
    summary: Optional[str] = None
    qualitative_feedback: Optional[str] = None 
    productivity_score: Optional[float] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AgendaResponse(BaseModel):
    id: uuid.UUID
    meeting_id: uuid.UUID
    proposed_agendas: list
    is_adopted: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True