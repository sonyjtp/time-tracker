from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Activity, Task
from schemas import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def enrich_task_with_dates(task: Task, db: Session) -> TaskResponse:
    """Add start_date and end_date to a task based on its activities"""
    min_max = (
        db.query(
            func.min(Activity.date).label("start_date"), func.max(Activity.date).label("end_date")
        )
        .filter(Activity.task_id == task.id)
        .first()
    )

    start_date = min_max.start_date if min_max and min_max.start_date else None
    end_date = min_max.end_date if min_max and min_max.end_date else None

    print(f"Task {task.id} ({task.name}): start={start_date}, end={end_date}")

    return TaskResponse(
        id=task.id,
        name=task.name,
        type=task.type,
        sub_type=task.sub_type,
        source=task.source,
        links=task.links,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return [enrich_task_with_dates(task, db) for task in tasks]


@router.post("", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    existing = db.query(Task).filter(Task.name == task.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Task name already exists")

    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return enrich_task_with_dates(task, db)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"ok": True}
