import uuid
from sqlalchemy import Column, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.db.timezone import kst_now


class MeetingSummary(Base):
    __tablename__ = "meeting_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"), unique=True)
    summary = Column(Text, nullable=True)
    qualitative_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=kst_now)

    meeting = relationship("Meeting", back_populates="summary")
