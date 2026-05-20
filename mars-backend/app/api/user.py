from fastapi import APIRouter, Depends, HTTPException, Query
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
        raise HTTPException(status_code=409, detail="이미 사용 중인 username입니다")  
    return create_user(db, user)

@router.get("/users/availability", summary="username 중복확인")
def check_username_availability( username: str, db: Session = Depends(get_db) ):
    existing_user = get_user_by_username(db, username)
    if existing_user:
        return {"available": False}
    return {"available": True}

@router.post("/users/login", summary="로그인 (username)")
def login_user(username: str, db: Session = Depends(get_db)):
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="존재하지 않는 username입니다")
    return {
        "message": "로그인 성공",
        "user_id": user.id,
        "username": user.username,
        "name": user.name
    }



@router.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    db_user = get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user



@router.delete("/users/{user_id}", summary="유저 삭제")
def delete_user_api(user_id: uuid.UUID, db: Session = Depends(get_db)):
    from app.crud import delete_user
    return delete_user(db, user_id)



