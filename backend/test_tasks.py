from models import Task


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


def test_update_nonexistent_task(client):
    response = client.put("/api/tasks/99999", json={"name": "Updated"})
    assert response.status_code == 404


def test_delete_nonexistent_task(client):
    response = client.delete("/api/tasks/99999")
    assert response.status_code == 404
