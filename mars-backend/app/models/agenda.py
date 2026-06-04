import uuid
import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


class Agenda(Base):
    __tablename__ = "agendas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"), nullable=True)
    proposed_agendas = Column(JSON, nullable=True)
    is_adopted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="agendas")
    meeting = relationship("Meeting", back_populates="agendas")
