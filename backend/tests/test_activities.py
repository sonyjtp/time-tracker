from datetime import date, time

import pytest

from app.models import Activity, Task


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
    db.refresh(task)
    return task


def test_create_activity(client, sample_task):
    response = client.post(
        "/api/activities",
        json={
            "task_id": sample_task.id,
            "date": "2026-05-23",
            "start_time": "09:00:00",
            "end_time": "10:30:00",
            "comments": "Test activity",
            "links": "https://example.com",
        },
    )
    assert response.status_code == 200
    assert response.json()["task_id"] == sample_task.id


def test_get_activities_by_date(client, sample_task):
    # Create activity
    client.post(
        "/api/activities",
        json={
            "task_id": sample_task.id,
            "date": "2026-05-23",
            "start_time": "09:00:00",
            "end_time": "10:30:00",
        },
    )

    # Get activities
    response = client.get("/api/activities?target_date=2026-05-23")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_get_activities_filter_by_task(client, sample_task):
    # Create activity
    client.post(
        "/api/activities",
        json={
            "task_id": sample_task.id,
            "date": "2026-05-23",
            "start_time": "09:00:00",
            "end_time": "10:30:00",
        },
    )

    # Filter by task
    response = client.get(f"/api/activities?target_date=2026-05-23&task_id={sample_task.id}")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_get_activity_by_id(client, sample_task, db):
    """Test retrieving a single activity by ID"""
    activity = Activity(
        task_id=sample_task.id, date=date(2026, 5, 23), start_time=time(9, 0), end_time=time(10, 30)
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    response = client.get(f"/api/activities/{activity.id}")
    assert response.status_code == 200
    assert response.json()["id"] == activity.id
    assert response.json()["task_id"] == sample_task.id


def test_get_nonexistent_activity(client):
    """Test retrieving activity that doesn't exist"""
    response = client.get("/api/activities/99999")
    assert response.status_code == 404


def test_update_activity(client, sample_task, db):
    # Create activity
    activity = Activity(
        task_id=sample_task.id, date=date(2026, 5, 23), start_time=time(9, 0), end_time=time(10, 30)
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    # Update activity
    response = client.put(
        f"/api/activities/{activity.id}",
        json={
            "task_id": sample_task.id,
            "date": "2026-05-23",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
            "comments": "Updated",
        },
    )
    assert response.status_code == 200
    assert response.json()["comments"] == "Updated"


def test_update_activity_nonexistent(client):
    """Test updating activity that doesn't exist"""
    response = client.put(
        "/api/activities/99999",
        json={
            "task_id": 1,
            "date": "2026-05-23",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
        },
    )
    assert response.status_code == 404


def test_update_activity_invalid_task(client, sample_task, db):
    """Test updating activity with invalid task ID"""
    activity = Activity(
        task_id=sample_task.id, date=date(2026, 5, 23), start_time=time(9, 0), end_time=time(10, 30)
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    response = client.put(
        f"/api/activities/{activity.id}",
        json={
            "task_id": 99999,
            "date": "2026-05-23",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
        },
    )
    # Should return 404 (Task not found)
    assert response.status_code == 404


def test_delete_activity(client, sample_task, db):
    # Create activity
    activity = Activity(
        task_id=sample_task.id, date=date(2026, 5, 23), start_time=time(9, 0), end_time=time(10, 30)
    )
    db.add(activity)
    db.commit()

    # Delete activity
    response = client.delete(f"/api/activities/{activity.id}")
    assert response.status_code == 200

    # Verify deletion
    response = client.get("/api/activities?target_date=2026-05-23")
    assert len(response.json()) == 0


def test_delete_nonexistent_activity(client):
    """Test deleting activity that doesn't exist"""
    response = client.delete("/api/activities/99999")
    assert response.status_code == 404


def test_activity_missing_required_fields(client, sample_task):
    response = client.post(
        "/api/activities", json={"task_id": sample_task.id, "date": "2026-05-23"}
    )
    assert response.status_code == 422


def test_activity_with_invalid_task_id(client):
    response = client.post(
        "/api/activities",
        json={
            "task_id": 99999,
            "date": "2026-05-23",
            "start_time": "09:00:00",
            "end_time": "10:30:00",
        },
    )
    assert response.status_code != 200


def test_activity_no_task_filter(client, sample_task, db):
    """Test getting activities without task filter"""
    # Create a second task for testing
    task2 = Task(name="Task 2 No Filter", type="QA")
    db.add(task2)
    db.commit()
    task2_id = task2.id  # Store the ID

    # Create activities for both tasks
    client.post(
        "/api/activities",
        json={
            "task_id": sample_task.id,
            "date": "2026-05-23",
            "start_time": "09:00:00",
            "end_time": "10:30:00",
        },
    )
    client.post(
        "/api/activities",
        json={
            "task_id": task2_id,
            "date": "2026-05-23",
            "start_time": "14:00:00",
            "end_time": "15:00:00",
        },
    )

    # Get all activities for date (no task filter)
    response = client.get("/api/activities?target_date=2026-05-23")
    assert response.status_code == 200
    assert len(response.json()) == 2
