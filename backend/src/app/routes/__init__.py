"""API route modules for Time Tracker API.

This package contains all endpoint definitions organized by feature/resource:

- activities: Activity tracking endpoints for logging work on tasks
- tasks: Task management endpoints for CRUD operations on tasks
- reports: Reporting and analytics endpoints for time tracking insights
- settings: Application settings endpoints for configuration management

Each module defines a FastAPI APIRouter configured with appropriate:
- URL prefix (e.g., /api/activities)
- Tags for documentation grouping
- Request/response models from schemas
- Database session injection

All routers are registered in main.py with app.include_router()
"""

from app.routes import activities, reports, settings, tasks

__all__ = [
    "activities",
    "reports",
    "settings",
    "tasks",
]
