from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Activity, Task, TimeSpentCache
from app.schemas import ActivityCreate, ActivityResponse, ActivityUpdate

router = APIRouter(prefix="/api/activities", tags=["activities"])


def invalidate_time_spent_cache(db: Session, activity_date: date):
    """Invalidate cache for ranges that include the activity date"""
    db.query(TimeSpentCache).filter(
        and_(TimeSpentCache.start_date <= activity_date, TimeSpentCache.end_date >= activity_date)
    ).delete()
    db.commit()


@router.get("", response_model=List[ActivityResponse])
def get_activities(
    target_date: date = Query(...), task_id: int = Query(None), db: Session = Depends(get_db)
):
    query = db.query(Activity).filter(Activity.date == target_date)
    if task_id:
        query = query.filter(Activity.task_id == task_id)
    return query.all()


@router.post("", response_model=ActivityResponse)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == activity.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_activity = Activity(**activity.model_dump())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)

    # Invalidate cache for this date
    invalidate_time_spent_cache(db, db_activity.date)

    return db_activity


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(activity_id: int, activity: ActivityUpdate, db: Session = Depends(get_db)):
    db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # If task_id is being updated, validate it exists
    update_data = activity.model_dump(exclude_unset=True)
    if "task_id" in update_data and update_data["task_id"]:
        task = db.query(Task).filter(Task.id == update_data["task_id"]).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

    # Store original date for cache invalidation
    original_date = db_activity.date

    for key, value in update_data.items():
        setattr(db_activity, key, value)

    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)

    # Invalidate cache for both old and new dates
    invalidate_time_spent_cache(db, original_date)
    if db_activity.date != original_date:
        invalidate_time_spent_cache(db, db_activity.date)

    return db_activity


@router.delete("/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Store date before deletion for cache invalidation
    activity_date = activity.date

    db.delete(activity)
    db.commit()

    # Invalidate cache for this date
    invalidate_time_spent_cache(db, activity_date)

    return {"ok": True}
