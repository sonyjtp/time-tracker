from datetime import date

from app.models import Activity, Task


def test_create_task(client):
    response = client.post(
        "/api/tasks",
        json={
            "name": "New Task",
            "type": "Development",
            "sub_type": "Backend",
            "source": "Internal",
            "links": "https://example.com",
        },
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New Task"
    assert response.json()["type"] == "Development"


def test_get_all_tasks(client):
    # Create multiple tasks
    for i in range(3):
        client.post(
            "/api/tasks", json={"name": f"Task {i}", "type": "Development", "sub_type": "Backend"}
        )

    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert len(response.json()) >= 3


def test_get_task_by_id(client):
    """Test retrieving a single task by ID"""
    # Create a task
    response = client.post(
        "/api/tasks",
        json={
            "name": "Single Task",
            "type": "Development",
            "sub_type": "Backend",
        },
    )
    task_id = response.json()["id"]

    # Get the task
    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Single Task"
    assert response.json()["id"] == task_id


def test_get_nonexistent_task(client):
    """Test retrieving task that doesn't exist"""
    response = client.get("/api/tasks/99999")
    assert response.status_code == 404


def test_update_task(client, db):
    # Create task
    task = Task(name="Original", type="Dev")
    db.add(task)
    db.commit()

    response = client.put(
        f"/api/tasks/{task.id}", json={"name": "Updated", "type": "QA", "sub_type": "Testing"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated"
    assert response.json()["type"] == "QA"


def test_update_nonexistent_task(client):
    """Test updating task that doesn't exist"""
    response = client.put("/api/tasks/99999", json={"name": "Updated"})
    assert response.status_code == 404


def test_delete_task(client, db):
    # Create task
    task = Task(name="To Delete", type="Dev")
    db.add(task)
    db.commit()

    # Delete task
    response = client.delete(f"/api/tasks/{task.id}")
    assert response.status_code == 200

    # Verify deletion
    response = client.get("/api/tasks")
    task_names = [t["name"] for t in response.json()]
    assert "To Delete" not in task_names


def test_delete_nonexistent_task(client):
    """Test deleting task that doesn't exist"""
    response = client.delete("/api/tasks/99999")
    assert response.status_code == 404


def test_task_name_required(client):
    response = client.post("/api/tasks", json={"type": "Development"})
    assert response.status_code == 422


def test_task_with_all_fields(client):
    response = client.post(
        "/api/tasks",
        json={
            "name": "Complete Task",
            "type": "Development",
            "sub_type": "Full Stack",
            "source": "GitHub",
            "links": "https://github.com/example/repo",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Complete Task"
    assert data["type"] == "Development"
    assert data["sub_type"] == "Full Stack"
    assert data["source"] == "GitHub"
    assert data["links"] == "https://github.com/example/repo"


def test_task_with_minimal_fields(client):
    response = client.post("/api/tasks", json={"name": "Minimal Task"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Minimal Task"
    assert data["type"] == ""
    assert data["sub_type"] == ""


def test_task_last_worked_date_calculated_from_activities(client, db):
    """Test that last_worked_date is calculated from the most recent activity"""
    from datetime import time

    # Create a task
    task = Task(name="Time Tracker", type="Development")
    db.add(task)
    db.commit()

    # Add activities on different dates
    activity1 = Activity(
        task_id=task.id,
        date=date(2026, 5, 20),
        start_time=time(9, 0),
        end_time=time(10, 0),
    )
    activity2 = Activity(
        task_id=task.id,
        date=date(2026, 5, 22),
        start_time=time(14, 0),
        end_time=time(15, 0),
    )
    activity3 = Activity(
        task_id=task.id,
        date=date(2026, 5, 23),
        start_time=time(10, 0),
        end_time=time(11, 0),
    )
    db.add_all([activity1, activity2, activity3])
    db.commit()

    # Get the task and verify last_worked_date is the most recent activity date
    response = client.get(f"/api/tasks/{task.id}")
    assert response.status_code == 200
    data = response.json()

    # Last worked date should be May 23, 2026 (the most recent activity)
    assert data["last_worked_date"] == "2026-05-23"
    assert data["start_date"] == "2026-05-20"
    # end_date should be null since we didn't set it
    assert data["end_date"] is None


def test_task_with_no_activities_has_null_last_worked_date(client, db):
    """Test that a task with no activities has null last_worked_date"""
    # Create a task with no activities
    task = Task(name="New Task No Activities", type="Development")
    db.add(task)
    db.commit()

    response = client.get(f"/api/tasks/{task.id}")
    assert response.status_code == 200
    data = response.json()

    # Both last_worked_date and start_date should be null
    assert data["last_worked_date"] is None
    assert data["start_date"] is None
    assert data["end_date"] is None


def test_task_end_date_manually_set(client, db):
    """Test that end_date can be manually set independently of activities"""
    task = Task(name="Task With End Date", type="Development", end_date=date(2026, 5, 25))
    db.add(task)
    db.commit()

    response = client.get(f"/api/tasks/{task.id}")
    assert response.status_code == 200
    data = response.json()

    # end_date should be set, even with no activities
    assert data["end_date"] == "2026-05-25"
    assert data["last_worked_date"] is None


def test_update_task_partial_fields(client, db):
    """Test updating only some fields of a task"""
    task = Task(name="Original", type="Dev", sub_type="Backend", source="Internal")
    db.add(task)
    db.commit()

    # Update only name and type
    response = client.put(f"/api/tasks/{task.id}", json={"name": "Updated Name", "type": "QA"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["type"] == "QA"


def test_update_task_end_date(client, db):
    """Test updating task end_date"""
    task = Task(name="Task", type="Dev")
    db.add(task)
    db.commit()

    response = client.put(
        f"/api/tasks/{task.id}", json={"name": "Task", "type": "Dev", "end_date": "2026-06-01"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["end_date"] == "2026-06-01"


def test_task_with_links(client):
    """Test creating a task with multiple links"""
    response = client.post(
        "/api/tasks",
        json={
            "name": "Task With Links",
            "type": "Development",
            "links": "https://github.com/example https://jira.example.com/PROJ-123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "github" in data["links"].lower()
    assert "jira" in data["links"].lower()
