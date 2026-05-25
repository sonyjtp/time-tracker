from datetime import date, time

import pytest

from app.models import Activity, Task


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
        task_id=task1.id, date=date(2026, 5, 20), start_time=time(9, 0), end_time=time(11, 0)
    )
    activity2 = Activity(
        task_id=task1.id, date=date(2026, 5, 21), start_time=time(9, 0), end_time=time(12, 0)
    )
    activity3 = Activity(
        task_id=task2.id, date=date(2026, 5, 20), start_time=time(14, 0), end_time=time(16, 30)
    )
    activity4 = Activity(
        task_id=task3.id, date=date(2026, 5, 21), start_time=time(10, 0), end_time=time(13, 0)
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
    task1_summary = next(
        (item for item in data if item["task_id"] == sample_data["task1"].id), None
    )
    assert task1_summary is not None
    assert task1_summary["total_hours"] == 5.0  # 2 hours + 3 hours


def test_time_spent_summary_with_date_range(client, sample_data):
    response = client.get(
        "/api/reports/time-spent-summary?start_date=2026-05-20&end_date=2026-05-20"
    )
    assert response.status_code == 200
    data = response.json()

    # On 2026-05-20, only task1 (2h) and task2 (2.5h) have activities
    task1_summary = next(
        (item for item in data if item["task_id"] == sample_data["task1"].id), None
    )
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
    response = client.get(
        "/api/reports/time-spent-summary?start_date=2026-06-01&end_date=2026-06-30"
    )
    assert response.status_code == 200
    data = response.json()
    # Should return empty list for date range with no activities
    assert len(data) == 0


def test_single_day_summary(client, sample_data):
    response = client.get(
        "/api/reports/time-spent-summary?start_date=2026-05-21&end_date=2026-05-21"
    )
    assert response.status_code == 200
    data = response.json()

    # On 2026-05-21, task1 has 3 hours and task3 has 3 hours
    assert len(data) == 2


def test_time_spent_hours_calculation(client, sample_data):
    response = client.get(
        "/api/reports/time-spent-summary?start_date=2026-05-20&end_date=2026-05-20"
    )
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


def test_time_spent_summary_response_format(client, sample_data):
    """Test that time spent summary response has correct format"""
    response = client.get("/api/reports/time-spent-summary")
    assert response.status_code == 200
    data = response.json()

    for item in data:
        assert "task_id" in item
        assert "task_name" in item
        assert "total_hours" in item
        assert isinstance(item["task_id"], int)
        assert isinstance(item["task_name"], str)
        assert isinstance(item["total_hours"], (int, float))


def test_time_spent_daily_response_format(client, sample_data):
    """Test that time spent daily response has correct format"""
    response = client.get("/api/reports/time-spent-daily")
    assert response.status_code == 200
    data = response.json()

    for item in data:
        assert "date" in item
        assert "task_id" in item
        assert "task_name" in item
        assert "hours" in item


def test_time_to_hours_with_partial_hour(client, sample_data):
    """Test time calculations with partial hours (e.g., 30 minutes = 0.5 hours)"""
    # task2 activity3: 14:00 to 16:30 = 2.5 hours
    response = client.get(
        "/api/reports/time-spent-summary?start_date=2026-05-20&end_date=2026-05-20"
    )
    assert response.status_code == 200
    data = response.json()

    task2_summary = next(
        (item for item in data if item["task_id"] == sample_data["task2"].id), None
    )
    assert task2_summary is not None
    assert task2_summary["total_hours"] == 2.5


def test_time_spent_summary_with_reversed_dates(client, sample_data):
    """Test behavior when start_date > end_date"""
    response = client.get(
        "/api/reports/time-spent-summary?start_date=2026-05-25&end_date=2026-05-20"
    )
    assert response.status_code == 200
    # Should return empty or swap dates
    data = response.json()
    assert isinstance(data, list)


def test_time_spent_daily_with_date_range_multiple_days(client, sample_data):
    """Test daily breakdown across multiple days"""
    response = client.get("/api/reports/time-spent-daily?start_date=2026-05-20&end_date=2026-05-21")
    assert response.status_code == 200
    data = response.json()

    # Should have activities from both dates
    dates_in_response = set(item["date"] for item in data)
    assert "2026-05-20" in dates_in_response
    assert "2026-05-21" in dates_in_response


def test_cache_invalidation_on_activity_create(client, sample_data, db):
    """Test that cache is properly invalidated when creating activity"""
    # Get summary (should cache)
    response1 = client.get("/api/reports/time-spent-summary")
    assert response1.status_code == 200
    data1 = response1.json()
    original_count = len(data1)

    # Create new task and activity
    task = Task(name="Cache Invalidation Task", type="Test")
    db.add(task)
    db.commit()
    db.refresh(task)

    client.post(
        "/api/activities",
        json={
            "task_id": task.id,
            "date": "2026-05-20",
            "start_time": "16:30:00",
            "end_time": "17:00:00",
        },
    )

    # Get summary again (cache should be invalidated)
    response2 = client.get("/api/reports/time-spent-summary")
    assert response2.status_code == 200
    data2 = response2.json()

    # Should have new entry
    assert len(data2) == original_count + 1


def test_time_spent_with_exact_hour_duration(client, db):
    """Test with activities that are exact hour durations"""
    task = Task(name="Exact Hour Task", type="Test")
    db.add(task)
    db.commit()
    db.refresh(task)

    # 09:00 to 13:00 = exactly 4 hours
    activity = Activity(
        task_id=task.id,
        date=date(2026, 5, 25),
        start_time=time(9, 0),
        end_time=time(13, 0),
    )
    db.add(activity)
    db.commit()

    response = client.get("/api/reports/time-spent-summary")
    assert response.status_code == 200
    data = response.json()

    task_summary = next((item for item in data if item["task_id"] == task.id), None)
    assert task_summary is not None
    assert task_summary["total_hours"] == 4.0


def test_time_spent_with_fifteen_minute_intervals(client, db):
    """Test with activities in 15-minute intervals"""
    task = Task(name="Interval Task", type="Test")
    db.add(task)
    db.commit()
    db.refresh(task)

    # 09:00 to 09:15 = 0.25 hours (15 minutes)
    activity = Activity(
        task_id=task.id,
        date=date(2026, 5, 25),
        start_time=time(9, 0),
        end_time=time(9, 15),
    )
    db.add(activity)
    db.commit()

    response = client.get("/api/reports/time-spent-summary")
    assert response.status_code == 200
    data = response.json()

    task_summary = next((item for item in data if item["task_id"] == task.id), None)
    assert task_summary is not None
    assert task_summary["total_hours"] == 0.25
