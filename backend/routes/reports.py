import json
from datetime import date, time
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Activity, Task, TimeSpentCache
from schemas import TimeSpentByDay, TimeSpentByTask

router = APIRouter(prefix="/api/reports", tags=["reports"])


def time_to_hours(t: time) -> float:
    if t is None:
        return 0
    return t.hour + t.minute / 60 + t.second / 3600


def calculate_duration_hours(start: time, end: time) -> float:
    if start is None or end is None:
        return 0
    start_hours = time_to_hours(start)
    end_hours = time_to_hours(end)
    if end_hours < start_hours:
        end_hours += 24
    return end_hours - start_hours


def get_cache_key(start_date, end_date):
    """Generate a cache key for a date range"""
    start_str = start_date.isoformat() if start_date else "none"
    end_str = end_date.isoformat() if end_date else "none"
    return f"time_spent_{start_str}_{end_str}"


def is_cache_valid(start_date, end_date):
    """Check if we should use cache (both dates are in the past)"""
    today = date.today()
    # Don't cache if range includes today or future dates
    if end_date and end_date >= today:
        return False
    return True


def invalidate_cache(db: Session, start_date=None, end_date=None):
    """Invalidate cache for a date range or all cache if no dates specified"""
    if start_date is None and end_date is None:
        # Clear all cache
        db.query(TimeSpentCache).delete()
    else:
        # Clear cache for ranges that overlap with the modified date range
        if start_date:
            db.query(TimeSpentCache).filter(TimeSpentCache.end_date >= start_date).delete()
        if end_date:
            db.query(TimeSpentCache).filter(TimeSpentCache.start_date <= end_date).delete()
    db.commit()


@router.get("/time-spent-summary", response_model=List[TimeSpentByTask])
def get_time_spent_summary(
    start_date: date = Query(None), end_date: date = Query(None), db: Session = Depends(get_db)
):
    query = db.query(Activity)
    if start_date:
        query = query.filter(Activity.date >= start_date)
    if end_date:
        query = query.filter(Activity.date <= end_date)

    activities = query.all()
    tasks = db.query(Task).all()

    result = {}
    for activity in activities:
        if activity.task_id not in result:
            task = next((t for t in tasks if t.id == activity.task_id), None)
            result[activity.task_id] = {
                "task_id": activity.task_id,
                "task_name": task.name if task else "Unknown",
                "total_hours": 0,
            }
        duration = calculate_duration_hours(activity.start_time, activity.end_time)
        result[activity.task_id]["total_hours"] += duration

    return [TimeSpentByTask(**v) for v in result.values()]


@router.get("/time-spent-daily", response_model=List[TimeSpentByDay])
def get_time_spent_daily(
    start_date: date = Query(None), end_date: date = Query(None), db: Session = Depends(get_db)
):
    # Check if we can use cache
    cache_key = get_cache_key(start_date, end_date)

    if is_cache_valid(start_date, end_date):
        cached = db.query(TimeSpentCache).filter(TimeSpentCache.cache_key == cache_key).first()
        if cached:
            print(f"Cache hit for {cache_key}")
            return json.loads(cached.data)

    # Calculate data
    query = db.query(Activity)
    if start_date:
        query = query.filter(Activity.date >= start_date)
    if end_date:
        query = query.filter(Activity.date <= end_date)

    activities = query.all()
    tasks = db.query(Task).all()

    result = []
    for activity in activities:
        task = next((t for t in tasks if t.id == activity.task_id), None)
        duration = calculate_duration_hours(activity.start_time, activity.end_time)
        result.append(
            TimeSpentByDay(
                date=activity.date.isoformat() if activity.date else "",
                task_id=activity.task_id,
                task_name=task.name if task else "Unknown",
                hours=duration,
            )
        )

    result = sorted(result, key=lambda x: (x.date, x.task_name))

    # Cache the result if dates are in the past
    if is_cache_valid(start_date, end_date):
        cache_entry = TimeSpentCache(
            cache_key=cache_key,
            start_date=start_date,
            end_date=end_date,
            data=json.dumps([r.model_dump() for r in result]),
        )
        db.add(cache_entry)
        db.commit()
        print(f"Cached result for {cache_key}")

    return result
