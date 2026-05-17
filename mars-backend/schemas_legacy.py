# [구버전] 기존 Pydantic 스키마 파일 (이전 구조)

from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import datetime
import uuid

# 1. Project schemas
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    project_type: Optional[str] = None
    deadline: Optional[datetime.datetime] = None

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
class UserCreate(BaseModel):
    project_id: uuid.UUID
    name: str
    role: Optional[str] = None

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
class ActionItemCreate(BaseModel):
    assignee_id: uuid.UUID
    meeting_id: Optional[uuid.UUID] = None
    description: str
    status: str = "TODO"
    priority: Optional[int] = None
    importance: Optional[int] = None
    urgency: Optional[int] = None
    deadline: Optional[datetime.datetime] = None

class ActionItemUpdate(BaseModel):
    status: str
