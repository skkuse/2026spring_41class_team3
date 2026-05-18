from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import ActionItemCreate, ActionItemUpdate, ActionItemResponse
from app.crud.action_item import create_action_item, get_action_items, get_action_items_by_project, update_action_item_status
from app.db.database import SessionLocal
from typing import Optional
import uuid

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/action-items", response_model=ActionItemResponse, summary="액션아이템 생성")
def create_new_action_item(item: ActionItemCreate, db: Session = Depends(get_db)):
    return create_action_item(db, item)

@router.get("/action-items", response_model=list[ActionItemResponse], summary="액션아이템 전체 조회")
def list_action_items(assignee_id: Optional[uuid.UUID] = None, db: Session = Depends(get_db)):
    return get_action_items(db, assignee_id)

@router.get("/projects/{project_id}/action-items", response_model=list[ActionItemResponse], summary="특정 프로젝트의 액션아이템 조회")
def list_project_action_items(
    project_id: uuid.UUID,
    status: Optional[str] = None,
    assignee_id: Optional[uuid.UUID] = None,
    sort: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_action_items_by_project(db, project_id, status, assignee_id, sort)

@router.patch("/action-items/{item_id}/status", response_model=ActionItemResponse, summary="액션아이템 상태 업데이트")
def patch_action_item(item_id: uuid.UUID, item_update: ActionItemUpdate, db: Session = Depends(get_db)):
    return update_action_item_status(db, item_id, item_update)

# 액션아이템 삭제 API
@router.delete("/action-items/{item_id}", summary="액션아이템 삭제")
def delete_action_item_api(item_id: uuid.UUID, db: Session = Depends(get_db)):
    from app.crud.action_item import delete_action_item
    return delete_action_item(db, item_id)
