import datetime
import uuid
from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    name: str
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    username: str
    name: str
    role: Optional[str] = None
    joined_at: datetime.datetime
    created_at: datetime.datetime

    class Config:
        from_attributes = True
