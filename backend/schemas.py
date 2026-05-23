from datetime import date, time
from typing import Optional

from pydantic import BaseModel


class TaskCreate(BaseModel):
    name: str
    type: Optional[str] = ""
    sub_type: Optional[str] = ""
    source: Optional[str] = ""
    links: Optional[str] = None


class TaskUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = ""
    sub_type: Optional[str] = ""
    source: Optional[str] = ""
    links: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    name: str
    type: Optional[str] = ""
    sub_type: Optional[str] = ""
    source: Optional[str] = ""
    links: Optional[str]
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    class Config:
        from_attributes = True


class ActivityCreate(BaseModel):
    task_id: int
    date: date
    start_time: time
    end_time: Optional[time] = None
    comments: Optional[str] = None
    links: Optional[str] = None


class ActivityUpdate(BaseModel):
    task_id: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    comments: Optional[str] = None
    links: Optional[str] = None


class ActivityResponse(BaseModel):
    id: int
    task_id: int
    date: date
    start_time: time
    end_time: Optional[time]
    comments: Optional[str]
    links: Optional[str]
    task: TaskResponse

    class Config:
        from_attributes = True


class TimeSpentByTask(BaseModel):
    task_id: int
    task_name: str
    total_hours: float


class TimeSpentByDay(BaseModel):
    date: str  # Store as string for JSON serialization
    task_id: int
    task_name: str
    hours: float
