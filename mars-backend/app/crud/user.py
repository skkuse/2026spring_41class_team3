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

def delete_user(db: Session, user_id: uuid.UUID):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")
    db.delete(user)
    db.commit()
    return {"message": "유저가 삭제되었습니다."}