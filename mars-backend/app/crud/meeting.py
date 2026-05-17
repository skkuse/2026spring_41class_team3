from sqlalchemy.orm import Session
from app.models import Meeting, MeetingSummary, MeetingProductivity, Agenda
from app.schemas import MeetingCreate, MeetingSummaryCreate, MeetingProductivityCreate, AgendaCreate
import uuid

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