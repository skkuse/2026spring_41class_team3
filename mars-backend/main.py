from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app import models
from app.api import project_router, user_router, action_item_router, meeting_router, root as root_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MARS API Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    #allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Include routers from app/api

app.include_router(root_router.router)
app.include_router(project_router)
app.include_router(user_router)
app.include_router(action_item_router)
app.include_router(meeting_router)