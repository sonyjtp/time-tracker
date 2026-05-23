import pytest
from datetime import date, time
from models import Task, Activity


@pytest.fixture
def sample_task(db):
    """Create a sample task for testing"""
    task = Task(
        name="Test Task",
        type="Development",
        sub_type="Backend",
        source="Internal",
        links="https://example.com"
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def test_create_activity(client, sample_task):
    response = client.post("/api/activities", json={
        "task_id": sample_task.id,
        "date": "2026-05-23",
        "start_time": "09:00:00",
        "end_time": "10:30:00",
        "comments": "Test activity",
        "links": "https://example.com"
    })
    assert response.status_code == 200
    assert response.json()["task_id"] == sample_task.id

def test_get_activities_by_date(client, sample_task):
    # Create activity
    client.post("/api/activities", json={
        "task_id": sample_task.id,
        "date": "2026-05-23",
        "start_time": "09:00:00",
        "end_time": "10:30:00"
    })

    # Get activities
    response = client.get("/api/activities?target_date=2026-05-23")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_get_activities_filter_by_task(client, sample_task):
    # Create activity
    client.post("/api/activities", json={
        "task_id": sample_task.id,
        "date": "2026-05-23",
        "start_time": "09:00:00",
        "end_time": "10:30:00"
    })

    # Filter by task
    response = client.get(f"/api/activities?target_date=2026-05-23&task_id={sample_task.id}")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_update_activity(client, sample_task, db):
    # Create activity
    activity = Activity(
        task_id=sample_task.id,
        date=date(2026, 5, 23),
        start_time=time(9, 0),
        end_time=time(10, 30)
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    # Update activity
    response = client.put(f"/api/activities/{activity.id}", json={
        "task_id": sample_task.id,
        "date": "2026-05-23",
        "start_time": "10:00:00",
        "end_time": "11:30:00",
        "comments": "Updated"
    })
    assert response.status_code == 200

def test_delete_activity(client, sample_task, db):
    # Create activity
    activity = Activity(
        task_id=sample_task.id,
        date=date(2026, 5, 23),
        start_time=time(9, 0),
        end_time=time(10, 30)
    )
    db.add(activity)
    db.commit()

    # Delete activity
    response = client.delete(f"/api/activities/{activity.id}")
    assert response.status_code == 200

    # Verify deletion
    response = client.get("/api/activities?target_date=2026-05-23")
    assert len(response.json()) == 0

def test_activity_missing_required_fields(client, sample_task):
    response = client.post("/api/activities", json={
        "task_id": sample_task.id,
        "date": "2026-05-23"
    })
    assert response.status_code == 422

def test_activity_with_invalid_task_id(client):
    response = client.post("/api/activities", json={
        "task_id": 99999,
        "date": "2026-05-23",
        "start_time": "09:00:00",
        "end_time": "10:30:00"
    })
    assert response.status_code != 200
