from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import MeetingCreate, MeetingResponse, MeetingSummaryCreate, MeetingProductivityCreate, AgendaCreate, MeetingDetailResponse, AgendaResponse
from app.crud.meeting import create_meeting, create_summary, create_productivity, create_agenda, get_meeting, get_proposed_agendas
from app.db.database import SessionLocal
import uuid
from typing import List


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/projects/{project_id}/meetings", status_code=201, summary = "미팅 생성")
def create_new_meeting(project_id: uuid.UUID, meeting: MeetingCreate, db: Session = Depends(get_db)):
    return create_meeting(db, meeting, project_id)

@router.post("/projects/{project_id}/meetings/{meeting_id}/summary", summary = "AI 회의 요약 생성")
def post_meeting_summary(project_id: uuid.UUID, meeting_id: uuid.UUID, summary: MeetingSummaryCreate, db: Session = Depends(get_db)):
    create_summary(db, summary, meeting_id)
    return {"message": "AI 회의 요약이 저장되었습니다"}

@router.post("/projects/{project_id}/meetings/{meeting_id}/productivity", summary = "AI 생산성 평가 생성")
def post_meeting_productivity(project_id: uuid.UUID, meeting_id: uuid.UUID, prod: MeetingProductivityCreate, db: Session = Depends(get_db)):
    create_productivity(db, prod, meeting_id)
    return {"message": "AI 생산성 평가 점수가 저장되었습니다"}

@router.post("/projects/{project_id}/agendas", summary = "다음 회의 agenda 생성")
def post_agenda(project_id: uuid.UUID, agenda: AgendaCreate, db: Session = Depends(get_db)):
    create_agenda(db, agenda, project_id)
    return {"message": "다음 회의 안건이 저장되었습니다"}

@router.get("/projects/{project_id}/meetings/{meeting_id}", response_model=MeetingDetailResponse, summary = "미팅 정보 조회")
def read_meeting(project_id: uuid.UUID, meeting_id: uuid.UUID, db: Session = Depends(get_db)):
    meeting = get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="회의를 찾을 수 없습니다.")
    return meeting

@router.get("/projects/{project_id}/agendas/proposed", response_model=List[AgendaResponse], summary="AI 제안 다음 안건 조회")
def read_proposed_agendas(project_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_proposed_agendas(db, project_id)