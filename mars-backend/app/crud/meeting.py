from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import Meeting, MeetingSummary, MeetingProductivity, Agenda, ActionItem, User
from app.schemas import MeetingCreate, MeetingSummaryCreate, MeetingProductivityCreate, AgendaCreate
import uuid
from typing import List, Dict, Any, Optional

def create_meeting(db: Session, meeting: MeetingCreate, project_id: uuid.UUID)-> Meeting:
    db_meeting = Meeting(project_id=project_id, **meeting.model_dump())
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

def create_summary(db: Session, summary: MeetingSummaryCreate, meeting_id: uuid.UUID):
    db_summary = MeetingSummary(meeting_id=meeting_id, **summary.model_dump())
    db.add(db_summary)
    db.commit()
    return db_summary

def create_productivity(db: Session, prod: MeetingProductivityCreate, meeting_id: uuid.UUID):
    db_prod = MeetingProductivity(meeting_id=meeting_id, **prod.model_dump())
    db.add(db_prod)
    db.commit()
    return db_prod

def create_agenda(db: Session, agenda: AgendaCreate, project_id: uuid.UUID):
    db_agenda = Agenda(project_id=project_id,  **agenda.model_dump())
    db.add(db_agenda)
    db.commit()
    return db_agenda

def get_meeting(db: Session, meeting_id: uuid.UUID):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        return None
    
    result = {
        "id": meeting.id,
        "project_id": meeting.project_id,
        "title": meeting.title,
        "purpose": meeting.purpose,
        "raw_text": meeting.raw_text,
        "summary": meeting.summary.summary if meeting.summary else None,
        "qualitative_feedback": meeting.summary.qualitative_feedback if meeting.summary else None,
        "productivity_score": meeting.productivity.score if meeting.productivity else None,
        "created_at": meeting.created_at
    }
    return result

def get_proposed_agendas(db: Session, project_id: uuid.UUID):
    return db.query(Agenda).filter(Agenda.project_id == project_id).all()

def delete_meeting(db: Session, meeting_id: uuid.UUID):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="미팅을 찾을 수 없습니다.")
    db.delete(meeting)
    db.commit()
    return {"message": "미팅이 삭제되었습니다."}

def delete_agenda(db: Session, agenda_id: uuid.UUID):
    agenda = db.query(Agenda).filter(Agenda.id == agenda_id).first()
    if not agenda:
        raise HTTPException(status_code=404, detail="아젠다를 찾을 수 없습니다.")
    db.delete(agenda)
    db.commit()
    return {"message": "아젠다가 삭제되었습니다."}


def get_meeting_analysis_input(db: Session, meeting_id: uuid.UUID) -> Optional[Dict[str, Any]]:
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        return None

    participants = ", ".join(u.name for u in meeting.participants) if meeting.participants else "없음"

    prev_action_items_text = "없음"
    if meeting.project_id:
        incomplete_items = (
            db.query(ActionItem)
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .filter(
                Meeting.project_id == meeting.project_id,
                Meeting.id != meeting_id,
                ActionItem.status == "TODO",
            )
            .all()
        )
        if incomplete_items:
            prev_action_items_text = "\n".join(
                f"- {item.description}" for item in incomplete_items
            )

    prev_feedback_text = "없음"
    if meeting.project_id:
        prev_meeting = (
            db.query(Meeting)
            .filter(
                Meeting.project_id == meeting.project_id,
                Meeting.id != meeting_id,
            )
            .order_by(desc(Meeting.created_at))
            .first()
        )
        if prev_meeting and prev_meeting.summary and prev_meeting.summary.qualitative_feedback:
            prev_feedback_text = prev_meeting.summary.qualitative_feedback

    return {
        "meeting_script": meeting.raw_text or "",
        "meeting_purpose": meeting.purpose or "",
        "participants": participants,
        "prev_action_items": prev_action_items_text,
        "prev_feedback": prev_feedback_text,
    }


def save_analysis_result(
    db: Session,
    meeting_id: uuid.UUID,
    project_id: uuid.UUID,
    gpt_response: Dict[str, Any],
    bert_metrics: Dict[str, float],
) -> None:
    existing_summary = db.query(MeetingSummary).filter(MeetingSummary.meeting_id == meeting_id).first()
    if existing_summary:
        existing_summary.summary = gpt_response.get("summary", "")
        existing_summary.qualitative_feedback = gpt_response.get("qualitative_feedback", "")
    else:
        db_summary = MeetingSummary(
            meeting_id=meeting_id,
            summary=gpt_response.get("summary", ""),
            qualitative_feedback=gpt_response.get("qualitative_feedback", ""),
        )
        db.add(db_summary)

    existing_prod = db.query(MeetingProductivity).filter(MeetingProductivity.meeting_id == meeting_id).first()
    if existing_prod:
        existing_prod.score = bert_metrics.get("f1", 0.0)
        existing_prod.metrics = bert_metrics
    else:
        db_prod = MeetingProductivity(
            meeting_id=meeting_id,
            score=bert_metrics.get("f1", 0.0),
            metrics=bert_metrics,
        )
        db.add(db_prod)

    for item in gpt_response.get("action_items", []):
        db_item = ActionItem(
            meeting_id=meeting_id,
            description=item.get("task", ""),
            priority=item.get("priority"),
            status="TODO",
        )
        db.add(db_item)

    next_agendas = gpt_response.get("next_agenda", [])
    if next_agendas and project_id:
        db_agenda = Agenda(
            project_id=project_id,
            meeting_id=meeting_id,
            proposed_agendas=next_agendas,
            is_adopted=False,
        )
        db.add(db_agenda)

    db.commit()
