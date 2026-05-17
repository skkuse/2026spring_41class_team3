from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.models.project import Project
from app.schemas.user import UserCreate
import uuid

def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(
        username=user.username,
        name=user.name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: uuid.UUID) -> User:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()