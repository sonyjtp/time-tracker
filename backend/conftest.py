import pytest
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal


@pytest.fixture(scope="session")
def db_engine():
    """Create test database engine"""
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db(db_engine):
    """Create test database session"""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = SessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def sample_task(db):
    """Create a sample task for testing"""
    from models import Task

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
    from datetime import date, time
    from models import Activity

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
