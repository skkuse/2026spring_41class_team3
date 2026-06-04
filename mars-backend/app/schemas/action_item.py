import datetime
import uuid
from pydantic import BaseModel
from typing import Optional


class ActionItemCreate(BaseModel):
    assignee_id: uuid.UUID
    meeting_id: uuid.UUID
    description: str
    status: str = "TODO"
    priority: Optional[int] = None
    importance: Optional[int] = None
    urgency: Optional[int] = None
    deadline: Optional[datetime.datetime] = None


class ActionItemUpdate(BaseModel):
    status: str


class ActionItemAssigneeUpdate(BaseModel):
    assignee_id: uuid.UUID


class ActionItemPriorityUpdate(BaseModel):
    priority: int


class ActionItemResponse(BaseModel):
    id: uuid.UUID
    assignee_id: uuid.UUID
    meeting_id: uuid.UUID
    description: str
    status: str
    priority: Optional[int] = None
    importance: Optional[int] = None
    urgency: Optional[int] = None
    deadline: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
