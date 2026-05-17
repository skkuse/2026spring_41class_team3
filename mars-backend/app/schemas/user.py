import datetime
import uuid
from pydantic import BaseModel
from typing import Optional

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
