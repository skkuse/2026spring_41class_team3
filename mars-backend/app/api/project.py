from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import ProjectCreate, ProjectResponse, AddMemberRequest, MemberResponse, ProjectMemberResponse
from app.crud import create_project, get_project, add_member, get_members
from app.db.database import SessionLocal
import uuid
from typing import List 


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/projects/", response_model=ProjectResponse, summary="프로젝트 생성(owneruser id 필요)")
def create_new_project(project: ProjectCreate, db: Session = Depends(get_db)):
    return create_project(db, project)

@router.get("/projects/{project_id}", response_model=ProjectResponse, summary="프로젝트 ID로 프로젝트 조회")
def read_project(project_id: uuid.UUID, db: Session = Depends(get_db)):
    db_project = get_project(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="해당 프로젝트 없음")
    return db_project

@router.post("/projects/{project_id}/members", response_model=MemberResponse, status_code=201, summary="프로젝트에 멤버 추가")
def add_project_member(project_id: uuid.UUID, body: AddMemberRequest, db: Session = Depends(get_db)):
    return add_member(db, project_id, body.user_id)

@router.get("/projects/{project_id}/members", response_model=List[ProjectMemberResponse], summary="프로젝트 내의 멤버 조회")
def get_project_member(project_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_members(db, project_id)


@router.delete("/projects/{project_id}", summary="프로젝트 삭제")
def delete_project_api(project_id: uuid.UUID, db: Session = Depends(get_db)):
    from app.crud import delete_project
    return delete_project(db, project_id)