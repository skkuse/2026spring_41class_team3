import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.db.timezone import kst_now


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"), nullable=False)
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    description = Column(Text, nullable=False)
    status = Column(String, default="TODO")
    created_at = Column(DateTime, default=kst_now)

    priority = Column(Integer, nullable=True)
    importance = Column(Integer, nullable=True)
    urgency = Column(Integer, nullable=True)
    deadline = Column(DateTime, nullable=True)

    meeting = relationship("Meeting", back_populates="action_items")
    assignee = relationship("User", back_populates="action_items")
