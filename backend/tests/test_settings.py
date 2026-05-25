def test_get_reference_date_default(client, db):
    response = client.get("/api/settings/reference_date")
    assert response.status_code == 200
    data = response.json()
    assert "value" in data
    # Should return today's date or default date
    assert data["value"] is not None


def test_set_reference_date(client):
    response = client.put("/api/settings/reference_date", json={"value": "2026-01-01"})
    assert response.status_code == 200


def test_set_and_get_reference_date(client):
    # Set reference date
    client.put("/api/settings/reference_date", json={"value": "2026-03-15"})

    # Get reference date
    response = client.get("/api/settings/reference_date")
    assert response.status_code == 200
    assert response.json()["value"] == "2026-03-15"


def test_update_reference_date(client):
    # Set initial date
    client.put("/api/settings/reference_date", json={"value": "2026-01-01"})

    # Update to different date
    response = client.put("/api/settings/reference_date", json={"value": "2026-06-15"})
    assert response.status_code == 200

    # Verify update
    response = client.get("/api/settings/reference_date")
    assert response.json()["value"] == "2026-06-15"


def test_reference_date_format(client):
    response = client.put("/api/settings/reference_date", json={"value": "2026-12-31"})
    assert response.status_code == 200

    response = client.get("/api/settings/reference_date")
    value = response.json()["value"]
    # Verify it's in valid date format (YYYY-MM-DD)
    assert len(value) == 10
    assert value[4] == "-" and value[7] == "-"


def test_set_reference_date_future(client):
    response = client.put("/api/settings/reference_date", json={"value": "2027-12-31"})
    assert response.status_code == 200


def test_set_reference_date_past(client):
    response = client.put("/api/settings/reference_date", json={"value": "2020-01-01"})
    assert response.status_code == 200


def test_invalid_date_format(client):
    # API doesn't validate date format strictly, just stores the string
    response = client.put("/api/settings/reference_date", json={"value": "invalid-date"})
    # API accepts and stores whatever string is provided
    assert response.status_code == 200


def test_missing_value_field(client):
    response = client.put("/api/settings/reference_date", json={})
    assert response.status_code == 422


def test_get_all_settings(client):
    """Test retrieving all settings"""
    # Set a few settings
    client.put("/api/settings/reference_date", json={"value": "2026-05-24"})
    client.put("/api/settings/custom_setting", json={"value": "custom_value"})

    # Get all settings
    response = client.get("/api/settings/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    # Verify settings are in correct format
    for setting in data:
        assert "key" in setting
        assert "value" in setting


def test_get_all_settings_empty(client, db):
    """Test retrieving all settings when none exist"""
    response = client.get("/api/settings/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_nonexistent_setting(client):
    """Test retrieving a setting that doesn't exist (and isn't reference_date)"""
    response = client.get("/api/settings/nonexistent_key")
    assert response.status_code == 404


def test_update_custom_setting(client):
    """Test updating a custom setting (not reference_date)"""
    response = client.put("/api/settings/theme", json={"value": "dark"})
    assert response.status_code == 200
    data = response.json()
    assert data["key"] == "theme"
    assert data["value"] == "dark"


def test_update_custom_setting_twice(client):
    """Test updating same custom setting multiple times"""
    client.put("/api/settings/theme", json={"value": "dark"})
    response = client.put("/api/settings/theme", json={"value": "light"})
    assert response.status_code == 200

    # Verify it was updated
    response = client.get("/api/settings/theme")
    assert response.json()["value"] == "light"


def test_setting_response_contains_key(client):
    """Test that setting response includes the key"""
    client.put("/api/settings/test_key", json={"value": "test_value"})
    response = client.get("/api/settings/test_key")
    assert response.status_code == 200
    data = response.json()
    assert data["key"] == "test_key"
    assert data["value"] == "test_value"


def test_empty_setting_value(client):
    """Test setting a setting with empty string value"""
    response = client.put("/api/settings/empty_key", json={"value": ""})
    assert response.status_code == 200

    # Retrieve and verify it's empty
    response = client.get("/api/settings/empty_key")
    assert response.json()["value"] == ""


def test_long_setting_value(client):
    """Test setting a setting with very long value"""
    long_value = "x" * 1000
    response = client.put("/api/settings/long_key", json={"value": long_value})
    assert response.status_code == 200

    response = client.get("/api/settings/long_key")
    assert response.json()["value"] == long_value


def test_special_characters_in_setting_value(client):
    """Test setting a setting with special characters"""
    special_value = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`"
    response = client.put("/api/settings/special_key", json={"value": special_value})
    assert response.status_code == 200

    response = client.get("/api/settings/special_key")
    assert response.json()["value"] == special_value
