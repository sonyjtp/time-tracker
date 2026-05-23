from datetime import date, time

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import get_db
from main import app
from models import Activity, Base, Task


@pytest.fixture(scope="function")
def db():
    """Create test database session with fresh SQLite in-memory database"""
    # Create in-memory SQLite engine for testing
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Create session factory
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    test_session = TestingSessionLocal()

    # Override the get_db dependency in FastAPI app
    def override_get_db():
        try:
            yield test_session
        finally:
            test_session.close()

    app.dependency_overrides[get_db] = override_get_db

    yield test_session

    # Cleanup
    test_session.close()
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def client(db):
    """Create test client with overridden database"""
    return TestClient(app)


@pytest.fixture
def sample_task(db):
    """Create a sample task for testing"""
    task = Task(
        name="Test Task",
        type="Development",
        sub_type="Backend",
        source="Internal",
        links="https://example.com",
    )
    db.add(task)
    db.commit()
    return task


@pytest.fixture
def sample_activity(db, sample_task):
    """Create a sample activity for testing"""

    activity = Activity(
        task_id=sample_task.id,
        date=date(2026, 5, 23),
        start_time=time(9, 0),
        end_time=time(10, 30),
        comments="Test activity",
    )
    db.add(activity)
    db.commit()
    return activity
