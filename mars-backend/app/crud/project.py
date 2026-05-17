from sqlalchemy.orm import Session
from app.models import Project, User
from app.schemas import ProjectCreate
from fastapi import HTTPException
import uuid

def create_project(db: Session, project: ProjectCreate) -> Project:
    db_project = Project(
        name=project.name,
        description=project.description,
        project_type=project.project_type,
        deadline=project.deadline
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_project(db: Session, project_id: uuid.UUID) -> Project:
    return db.query(Project).filter(Project.id == project_id).first()


def add_member(db: Session, project_id: uuid.UUID, user_id: uuid.UUID):

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")

    user.project_id = project_id
    db.commit()
    db.refresh(user)
    return user

def get_members(db: Session, project_id: uuid.UUID):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    
    return db.query(User).filter(User.project_id == project_id).all()