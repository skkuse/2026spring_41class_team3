import uuid
import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Table, Float, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

# 0. N:M association table for meeting participants
meeting_participants = Table(
    "meeting_participants",
    Base.metadata,
    Column("meeting_id", UUID(as_uuid=True), ForeignKey("meetings.id"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
)

# 1. Project table
class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(String, nullable=True)
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships (1:N)
    users = relationship("User", back_populates="project", cascade="all, delete")
    meetings = relationship("Meeting", back_populates="project", cascade="all, delete")
    agendas = relationship("Agenda", back_populates="project", cascade="all, delete")

# 2. User table
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    name = Column(String, nullable=False)
    role = Column(String, nullable=True)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="users")
    action_items = relationship("ActionItem", back_populates="assignee")

# 3. Meeting table
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
    action_items = relationship("ActionItem", back_populates="meeting")
    
    # 1:1 relationships
    summary = relationship("MeetingSummary", back_populates="meeting", uselist=False, cascade="all, delete")
    productivity = relationship("MeetingProductivity", back_populates="meeting", uselist=False, cascade="all, delete")

# 4. Action item table
class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"))
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    description = Column(Text, nullable=False)
    status = Column(String, default="TODO")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    meeting = relationship("Meeting", back_populates="action_items")
    assignee = relationship("User", back_populates="action_items")


# 5. Meeting Summaries
class MeetingSummary(Base):
    __tablename__ = "meeting_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Enforce one summary per meeting
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"), unique=True) 
    summary = Column(Text, nullable=True)
    qualitative_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    meeting = relationship("Meeting", back_populates="summary")

# 6. Meeting Productivity
class MeetingProductivity(Base):
    __tablename__ = "meeting_productivity"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"), unique=True)
    score = Column(Float, nullable=True)
    metrics = Column(JSON, nullable=True)  # Stores detailed metrics as JSON
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    meeting = relationship("Meeting", back_populates="productivity")

# 7. Agenda table
class Agenda(Base):
    __tablename__ = "agendas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    proposed_agendas = Column(JSON, nullable=True)  # Stores a list of agenda items as JSON
    is_adopted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="agendas")