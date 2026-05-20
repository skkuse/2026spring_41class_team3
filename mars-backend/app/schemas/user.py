import datetime
import uuid
from pydantic import BaseModel, Field
from typing import Optional

class UserCreate(BaseModel):
    username: str = Field(..., pattern=r"^[a-zA-Z0-9]+$", min_length=3, max_length=20)
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
