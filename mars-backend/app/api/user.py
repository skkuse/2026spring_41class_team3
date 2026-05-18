from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserResponse
from app.crud import create_user, get_user, get_user_by_username
from app.db.database import SessionLocal
import uuid

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/users/", response_model=UserResponse)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_username(db, user.username) 
    if existing:
        raise HTTPException(status_code=400, detail="이미 사용 중인 username입니다")  
    return create_user(db, user)

@router.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    db_user = get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# 유저 삭제 API
@router.delete("/users/{user_id}", summary="유저 삭제")
def delete_user_api(user_id: uuid.UUID, db: Session = Depends(get_db)):
    from app.crud import delete_user
    return delete_user(db, user_id)


    