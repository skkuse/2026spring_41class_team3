from sqlalchemy.orm import Session
from app.models import ActionItem, User, Meeting
from app.schemas import ActionItemCreate, ActionItemUpdate, ActionItemAssigneeUpdate
from fastapi import HTTPException
from typing import Optional
import uuid

def create_action_item(db: Session, item: ActionItemCreate) -> ActionItem:
    target_user = db.query(User).filter(User.id == item.assignee_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="해당 유저(담당자)를 찾을 수 없습니다.")
    db_item = ActionItem(
        assignee_id=item.assignee_id,
        meeting_id=item.meeting_id,
        description=item.description,
        status=item.status,
        priority=item.priority,
        importance=item.importance,
        urgency=item.urgency,
        deadline=item.deadline
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_action_items(db: Session, assignee_id: uuid.UUID = None):
    if assignee_id:
        return db.query(ActionItem).filter(ActionItem.assignee_id == assignee_id).all()
    return db.query(ActionItem).all()

def get_action_items_by_project(
    db: Session,
    project_id: uuid.UUID,
    status: Optional[str] = None,
    assignee_id: Optional[uuid.UUID] = None,
    sort: Optional[str] = None
) -> list:
    query = (
        db.query(ActionItem)
        .join(Meeting, ActionItem.meeting_id == Meeting.id)
        .filter(Meeting.project_id == project_id)
    )
    if status:
        query = query.filter(ActionItem.status == status)
    if assignee_id:
        query = query.filter(ActionItem.assignee_id == assignee_id)
    if sort == "deadline_asc":
        query = query.order_by(ActionItem.deadline.asc())
    elif sort == "deadline_desc":
        query = query.order_by(ActionItem.deadline.desc())
    elif sort == "created_at_desc":
        query = query.order_by(ActionItem.created_at.desc())
    return query.all()

def update_action_item_status(db: Session, item_id: uuid.UUID, item_update: ActionItemUpdate) -> ActionItem:
    target_item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not target_item:
        raise HTTPException(status_code=404, detail="해당 할 일을 찾을 수 없습니다.")
    target_item.status = item_update.status
    db.commit()
    db.refresh(target_item)
    return target_item

def update_action_item_assignee(db: Session, item_id: uuid.UUID, item_update: ActionItemAssigneeUpdate) -> ActionItem:
    target_item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not target_item:
        raise HTTPException(status_code=404, detail="해당 할 일을 찾을 수 없습니다.")

    target_user = db.query(User).filter(User.id == item_update.assignee_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="해당 유저(담당자)를 찾을 수 없습니다.")

    target_item.assignee_id = item_update.assignee_id
    db.commit()
    db.refresh(target_item)
    return target_item

def delete_action_item(db: Session, item_id: uuid.UUID):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다.")
    db.delete(item)
    db.commit()
    return {"message": "할 일이 삭제되었습니다."}
