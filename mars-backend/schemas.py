# Schema definitions for request and response payloads
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import datetime
import uuid

# 1. Project schemas
# Request payload for project creation
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    project_type: Optional[str] = None
    deadline: Optional[datetime.datetime] = None

# Response payload for project reads
class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    project_type: Optional[str] = None
    deadline: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True 

# 2. User schemas
# Request payload for adding a user to a project
class UserCreate(BaseModel):
    project_id: uuid.UUID
    name: str
    role: Optional[str] = None

# Response payload for user reads
class UserResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    role: Optional[str] = None
    joined_at: datetime.datetime
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# 3. Action item schemas
# Request payload for action item creation
class ActionItemCreate(BaseModel):
    assignee_id: uuid.UUID  # Assignee user ID
    meeting_id: Optional[uuid.UUID] = None  # Source meeting ID (optional)
    description: str  # Task description
    status: str = "TODO"  # Default status
    priority: Optional[int] = None  # Priority
    importance: Optional[int] = None  # Importance
    urgency: Optional[int] = None  # Urgency
    deadline: Optional[datetime.datetime] = None  # Due date

# Request payload for status updates
class ActionItemUpdate(BaseModel):
    status: str 

# Response payload for action item reads
class ActionItemResponse(BaseModel):
    id: uuid.UUID
    assignee_id: uuid.UUID
    meeting_id: Optional[uuid.UUID] = None
    description: str
    status: str
    priority: Optional[int] = None
    importance: Optional[int] = None
    urgency: Optional[int] = None
    deadline: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# 4. Meeting schemas
class MeetingCreate(BaseModel):
    project_id: uuid.UUID
    title: str
    purpose: Optional[str] = None
    raw_text: Optional[str] = None

class MeetingResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    purpose: Optional[str] = None
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# 5. AI output schemas (summary, productivity, agenda)
class MeetingSummaryCreate(BaseModel):
    meeting_id: uuid.UUID
    summary: str
    qualitative_feedback: Optional[str] = None

class MeetingProductivityCreate(BaseModel):
    meeting_id: uuid.UUID
    score: float
    metrics: Dict[str, Any]  # JSON object

class AgendaCreate(BaseModel):
    project_id: uuid.UUID
    proposed_agendas: List[str]  # JSON list