from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.models.project import Project
from app.schemas.user import UserCreate
import uuid

def create_user(db: Session, user: UserCreate) -> User:
    target_project = db.query(Project).filter(Project.id == user.project_id).first()
    if not target_project:
        raise HTTPException(status_code=404, detail="해당 프로젝트를 찾을 수 없습니다.")
    db_user = User(
        project_id=user.project_id,
        name=user.name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: uuid.UUID) -> User:
    return db.query(User).filter(User.id == user_id).first()
