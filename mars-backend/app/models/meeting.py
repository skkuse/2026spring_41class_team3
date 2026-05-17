import uuid
import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base

meeting_participants = Table(
    "meeting_participants",
    Base.metadata,
    Column("meeting_id", UUID(as_uuid=True), ForeignKey("meetings.id"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
)

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    title = Column(String, nullable=False)
    purpose = Column(String, nullable=True)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="meetings")
    participants = relationship("User", secondary=meeting_participants)
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete")
    summary = relationship("MeetingSummary", back_populates="meeting", uselist=False, cascade="all, delete")
    productivity = relationship("MeetingProductivity", back_populates="meeting", uselist=False, cascade="all, delete")
