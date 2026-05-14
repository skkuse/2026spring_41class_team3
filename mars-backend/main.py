from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
import schemas
from database import engine, SessionLocal


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MARS API Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with explicit frontend domains in production
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "MARS API 서버 정상 작동"}

# 1. Project API

# Create project
@app.post("/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    # Map request payload to DB model
    db_project = models.Project(
        name=project.name,
        description=project.description,
        project_type=project.project_type,
        deadline=project.deadline
    )
    # Persist record
    db.add(db_project)
    db.commit()
    db.refresh(db_project)  # Reload generated fields
    
    # Return created record
    return db_project

# List projects
@app.get("/projects", response_model=list[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    # Fetch all records from Project table
    projects = db.query(models.Project).all()
    return projects



# 2. User API


# Create user in a project
@app.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Validate target project
    target_project = db.query(models.Project).filter(models.Project.id == user.project_id).first()
    if not target_project:
        # Return 404 when project does not exist
        raise HTTPException(status_code=404, detail="해당 프로젝트를 찾을 수 없습니다.")

    # Create and persist user
    db_user = models.User(
        project_id=user.project_id,
        name=user.name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user



# 3. Action Item API


# Create action item
@app.post("/action-items", response_model=schemas.ActionItemResponse)
def create_action_item(item: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    # Validate assignee user
    target_user = db.query(models.User).filter(models.User.id == item.assignee_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="해당 유저(담당자)를 찾을 수 없습니다.")

    # Create and persist action item
    db_item = models.ActionItem(
        assignee_id=item.assignee_id,
        meeting_id=item.meeting_id,
        description=item.description,
        status=item.status
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# List action items
@app.get("/action-items", response_model=list[schemas.ActionItemResponse])
def get_action_items(assignee_id: str = None, db: Session = Depends(get_db)):
    # Filter by assignee_id when provided
    if assignee_id:
        items = db.query(models.ActionItem).filter(models.ActionItem.assignee_id == assignee_id).all()
    else:
        # Otherwise return all records
        items = db.query(models.ActionItem).all()
    return items

# Update action item status
@app.patch("/action-items/{item_id}", response_model=schemas.ActionItemResponse)
def update_action_item_status(item_id: str, item_update: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    # Find target action item
    target_item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not target_item:
        raise HTTPException(status_code=404, detail="해당 할 일을 찾을 수 없습니다.")

    # Apply new status
    target_item.status = item_update.status
    
    # Persist update
    db.commit()
    db.refresh(target_item)
    return target_item


# 4. Meeting and AI output API

# Create meeting with raw text
@app.post("/meetings", response_model=schemas.MeetingResponse)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    db_meeting = models.Meeting(**meeting.dict())
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

# Save AI summary
@app.post("/meeting-summaries")
def create_summary(summary: schemas.MeetingSummaryCreate, db: Session = Depends(get_db)):
    db_summary = models.MeetingSummary(**summary.dict())
    db.add(db_summary)
    db.commit()
    return {"message": "AI 회의 요약이 저장되었습니다"}

# Save AI productivity result
@app.post("/meeting-productivity")
def create_productivity(prod: schemas.MeetingProductivityCreate, db: Session = Depends(get_db)):
    db_prod = models.MeetingProductivity(**prod.dict())
    db.add(db_prod)
    db.commit()
    return {"message": "AI 생산성 평가 점수가 저장되었습니다"}

# Save next-meeting agendas
@app.post("/agendas")
def create_agenda(agenda: schemas.AgendaCreate, db: Session = Depends(get_db)):
    db_agenda = models.Agenda(**agenda.dict())
    db.add(db_agenda)
    db.commit()
    return {"message": "다음 회의 안건이 저장되었습니다"}