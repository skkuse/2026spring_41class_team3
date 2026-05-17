from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_root():
    return {"message": "MARS API 서버 정상 작동"}
