import pytest
from sqlalchemy.orm import Session
from models import Settings
from database import Base, engine, SessionLocal
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_get_reference_date_default(db):
    response = client.get("/api/settings/reference_date")
    assert response.status_code == 200
    data = response.json()
    assert "value" in data
    # Should return today's date or default date
    assert data["value"] is not None

def test_set_reference_date():
    response = client.put("/api/settings/reference_date", json={
        "value": "2026-01-01"
    })
    assert response.status_code == 200

def test_set_and_get_reference_date():
    # Set reference date
    client.put("/api/settings/reference_date", json={
        "value": "2026-03-15"
    })

    # Get reference date
    response = client.get("/api/settings/reference_date")
    assert response.status_code == 200
    assert response.json()["value"] == "2026-03-15"

def test_update_reference_date():
    # Set initial date
    client.put("/api/settings/reference_date", json={
        "value": "2026-01-01"
    })

    # Update to different date
    response = client.put("/api/settings/reference_date", json={
        "value": "2026-06-15"
    })
    assert response.status_code == 200

    # Verify update
    response = client.get("/api/settings/reference_date")
    assert response.json()["value"] == "2026-06-15"

def test_reference_date_format():
    response = client.put("/api/settings/reference_date", json={
        "value": "2026-12-31"
    })
    assert response.status_code == 200

    response = client.get("/api/settings/reference_date")
    value = response.json()["value"]
    # Verify it's in valid date format (YYYY-MM-DD)
    assert len(value) == 10
    assert value[4] == "-" and value[7] == "-"

def test_set_reference_date_future():
    response = client.put("/api/settings/reference_date", json={
        "value": "2027-12-31"
    })
    assert response.status_code == 200

def test_set_reference_date_past():
    response = client.put("/api/settings/reference_date", json={
        "value": "2020-01-01"
    })
    assert response.status_code == 200

def test_invalid_date_format():
    response = client.put("/api/settings/reference_date", json={
        "value": "13/01/2026"
    })
    # Should fail or handle gracefully
    assert response.status_code != 200 or response.status_code == 422

def test_missing_value_field():
    response = client.put("/api/settings/reference_date", json={})
    assert response.status_code == 422
