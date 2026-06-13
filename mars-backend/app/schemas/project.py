import datetime
import uuid
from pydantic import BaseModel
from typing import Optional

class ProjectCreate(BaseModel):
    name: str
    owner_user_id: uuid.UUID 
    description: Optional[str] = None
    project_type: Optional[str] = None
    deadline: Optional[datetime.datetime] = None

class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    owner_id: uuid.UUID 
    description: Optional[str] = None
    project_type: Optional[str] = None
    deadline: Optional[datetime.datetime] = None
    project_code: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AddMemberRequest(BaseModel):
    user_id: uuid.UUID    

class JoinProjectRequest(BaseModel):
    project_code: str
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

class UserProjectResponse(BaseModel):
    id: uuid.UUID
    project_code: str
    name: str

    class Config:
        from_attributes = True
