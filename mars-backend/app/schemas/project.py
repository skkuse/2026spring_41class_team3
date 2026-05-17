import datetime
import uuid
from pydantic import BaseModel
from typing import Optional

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

class AddMemberRequest(BaseModel):
    user_id: uuid.UUID    

class MemberResponse(BaseModel):
    project_id: uuid.UUID
    user_id: uuid.UUID
    joined_at: datetime.datetime

    class Config:
        from_attributes = True

class ProjectMemberResponse(BaseModel):
    id: uuid.UUID
    name: str

    class Config:
        from_attributes = True