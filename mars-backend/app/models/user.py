import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.db.timezone import kst_now

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    username = Column(String, nullable=False, unique=True, index=True) 
    name = Column(String, nullable=False)
    role = Column(String, nullable=True)
    joined_at = Column(DateTime, default=kst_now)
    created_at = Column(DateTime, default=kst_now)

    # Relationships
    project = relationship("Project", back_populates="users")
    action_items = relationship("ActionItem", back_populates="assignee")
