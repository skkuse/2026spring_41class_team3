import uuid
import random
import string
import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base

def _generate_invite_code() -> str:
    return ''.join(random.choices(string.digits, k=10))

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(String, nullable=True)
    deadline = Column(DateTime, nullable=True)
    owner_id = Column(UUID(as_uuid=True), nullable=False)
    project_code = Column(String(10), unique=True, nullable=False, default=_generate_invite_code)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships (1:N)
    users = relationship("User", back_populates="project", cascade="all, delete")
    meetings = relationship("Meeting", back_populates="project", cascade="all, delete")
    agendas = relationship("Agenda", back_populates="project", cascade="all, delete")
