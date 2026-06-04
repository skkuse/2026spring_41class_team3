import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.db.timezone import kst_now


class MeetingProductivity(Base):
    __tablename__ = "meeting_productivity"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"), unique=True)
    score = Column(Float, nullable=True)
    metrics = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=kst_now)

    meeting = relationship("Meeting", back_populates="productivity")
