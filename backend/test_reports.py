import pytest
from datetime import date, time
from models import Task, Activity

@pytest.fixture
def sample_data(db):
    # Create tasks
    task1 = Task(name="Task 1", type="Development", sub_type="Backend")
    task2 = Task(name="Task 2", type="Development", sub_type="Frontend")
    task3 = Task(name="Task 3", type="Testing", sub_type="QA")

    db.add_all([task1, task2, task3])
    db.commit()
    db.refresh(task1)
    db.refresh(task2)
    db.refresh(task3)

    # Create activities
    activity1 = Activity(
        task_id=task1.id,
        date=date(2026, 5, 20),
        start_time=time(9, 0),
        end_time=time(11, 0)
    )
    activity2 = Activity(
        task_id=task1.id,
        date=date(2026, 5, 21),
        start_time=time(9, 0),
        end_time=time(12, 0)
    )
    activity3 = Activity(
        task_id=task2.id,
        date=date(2026, 5, 20),
        start_time=time(14, 0),
        end_time=time(16, 30)
    )
    activity4 = Activity(
        task_id=task3.id,
        date=date(2026, 5, 21),
        start_time=time(10, 0),
        end_time=time(13, 0)
    )

    db.add_all([activity1, activity2, activity3, activity4])
    db.commit()

    return {"task1": task1, "task2": task2, "task3": task3}

def test_time_spent_summary(client, sample_data):
    response = client.get("/api/reports/time-spent-summary")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

    # Find task 1 summary
    task1_summary = next((item for item in data if item["task_id"] == sample_data["task1"].id), None)
    assert task1_summary is not None
    assert task1_summary["total_hours"] == 5.0  # 2 hours + 3 hours

def test_time_spent_summary_with_date_range(client, sample_data):
    response = client.get("/api/reports/time-spent-summary?start_date=2026-05-20&end_date=2026-05-20")
    assert response.status_code == 200
    data = response.json()

    # On 2026-05-20, only task1 (2h) and task2 (2.5h) have activities
    task1_summary = next((item for item in data if item["task_id"] == sample_data["task1"].id), None)
    assert task1_summary is not None
    assert task1_summary["total_hours"] == 2.0  # Only on 2026-05-20

def test_time_spent_daily(client, sample_data):
    response = client.get("/api/reports/time-spent-daily")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

    # Check that we have daily breakdown
    dates = set(item["date"] for item in data)
    assert len(dates) > 0

def test_time_spent_daily_with_date_range(client, sample_data):
    response = client.get("/api/reports/time-spent-daily?start_date=2026-05-20&end_date=2026-05-20")
    assert response.status_code == 200
    data = response.json()

    # All items should be from 2026-05-20
    for item in data:
        assert item["date"] == "2026-05-20"

def test_time_spent_daily_date_order(client, sample_data):
    response = client.get("/api/reports/time-spent-daily")
    assert response.status_code == 200
    data = response.json()

    # Results should be sorted by date (as strings in ISO format)
    if len(data) > 1:
        dates = [item["date"] for item in data]
        assert dates == sorted(dates)

def test_empty_date_range(client, sample_data):
    response = client.get("/api/reports/time-spent-summary?start_date=2026-06-01&end_date=2026-06-30")
    assert response.status_code == 200
    data = response.json()
    # Should return empty list for date range with no activities
    assert len(data) == 0

def test_single_day_summary(client, sample_data):
    response = client.get("/api/reports/time-spent-summary?start_date=2026-05-21&end_date=2026-05-21")
    assert response.status_code == 200
    data = response.json()

    # On 2026-05-21, task1 has 3 hours and task3 has 3 hours
    assert len(data) == 2

def test_time_spent_hours_calculation(client, sample_data):
    response = client.get("/api/reports/time-spent-summary?start_date=2026-05-20&end_date=2026-05-20")
    assert response.status_code == 200
    data = response.json()

    # Verify hours are calculated correctly
    for item in data:
        assert isinstance(item["total_hours"], (int, float))
        assert item["total_hours"] > 0

def test_no_activities(client, db):
    response = client.get("/api/reports/time-spent-summary")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0
