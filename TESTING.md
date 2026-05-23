# Testing Guide

This document describes the testing strategy and how to run tests for the Time Tracker application.

## Overview

The application includes comprehensive test coverage for both backend and frontend:

- **Backend**: 40+ tests covering API endpoints, data validation, and business logic
- **Frontend**: 30+ tests covering utility functions, filtering logic, and UI calculations

## Backend Testing

### Setup

Install testing dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### Running Tests

**Run all tests**:
```bash
pytest
```

**Run specific test file**:
```bash
pytest test_activities.py
pytest test_tasks.py
pytest test_reports.py
pytest test_settings.py
```

**Run with verbose output**:
```bash
pytest -v
```

**Run with coverage report**:
```bash
pip install pytest-cov
pytest --cov=. --cov-report=html
```

### Test Files

#### test_activities.py (12 tests)
Tests for activity CRUD operations:
- ✅ Create activity with valid data
- ✅ Get activities by date
- ✅ Filter activities by task
- ✅ Update activity
- ✅ Delete activity
- ✅ Validate required fields
- ✅ Handle invalid task IDs

#### test_tasks.py (10 tests)
Tests for task management:
- ✅ Create task with minimal and full data
- ✅ Get all tasks
- ✅ Update task
- ✅ Delete task
- ✅ Validate required fields
- ✅ Handle non-existent tasks

#### test_reports.py (10 tests)
Tests for time spent reports:
- ✅ Get summary without date range
- ✅ Get summary with date range filtering
- ✅ Get daily breakdown
- ✅ Verify date range filtering on daily breakdown
- ✅ Verify sorted results
- ✅ Handle empty date ranges
- ✅ Calculate hours correctly

#### test_settings.py (8 tests)
Tests for settings management:
- ✅ Get reference date (default)
- ✅ Set reference date
- ✅ Update reference date
- ✅ Verify date format
- ✅ Handle past and future dates
- ✅ Validate date format
- ✅ Handle missing fields

### Test Patterns

All backend tests follow a consistent pattern:

```python
@pytest.fixture
def sample_data(db):
    # Setup test data
    task = Task(name="Test")
    db.add(task)
    db.commit()
    return task

def test_operation(sample_data):
    # Act
    response = client.get("/api/endpoint")
    
    # Assert
    assert response.status_code == 200
    assert response.json()["field"] == "expected_value"
```

## Frontend Testing

### Setup

Install testing dependencies:

```bash
cd frontend
npm install
npm install --save-dev vitest @vitest/ui jsdom
```

### Running Tests

**Run all tests**:
```bash
npm test
```

**Run tests with UI**:
```bash
npm run test:ui
```

**Watch mode** (auto-rerun on changes):
```bash
npm test -- --watch
```

**Run specific test file**:
```bash
npm test -- api.test.js
npm test -- pages.test.js
npm test -- utils.test.js
```

### Test Files

#### api.test.js (5 tests)
Tests for API client functionality:
- ✅ Date formatting in API calls
- ✅ Task filtering in activities API
- ✅ All CRUD methods defined
- ✅ Date range support in reports

#### utils.test.js (8 tests)
Tests for utility functions:
- ✅ Time formatting (HH:MM)
- ✅ Duration calculation
- ✅ Date formatting (YYYY-MM-DD)
- ✅ Handle null/undefined values

#### pages.test.js (24 tests)
Tests for page logic:

**Daily Activity Page**:
- ✅ Show only tasks with activities for day
- ✅ Previous day navigation
- ✅ Next day navigation
- ✅ Set today
- ✅ Calculate total time

**Tasks Page**:
- ✅ Date range filtering
- ✅ Exclude tasks outside range
- ✅ Sort ascending (default)
- ✅ Sort descending
- ✅ Multi-column sorting

**Time Spent Page**:
- ✅ Aggregate hours by type
- ✅ Aggregate hours by sub-type
- ✅ Filter subtypes by type
- ✅ Cascading filter logic
- ✅ Show only tasks with activities

**Settings Page**:
- ✅ Default to Jan 1st of current year
- ✅ Accept valid date format
- ✅ Persist across sessions

## Test Coverage Goals

### Backend
- **Line Coverage**: 85%+
- **Branch Coverage**: 80%+
- Focus areas: API endpoints, data validation, business logic

### Frontend
- **Logic Coverage**: 90%+
- Focus areas: Filtering, sorting, calculations

## Continuous Integration

When committed to GitHub, tests should run automatically. To test locally before pushing:

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

## Writing New Tests

### Backend (pytest)

```python
def test_new_feature():
    # Arrange
    data = {...}
    
    # Act
    response = client.post("/api/endpoint", json=data)
    
    # Assert
    assert response.status_code == 200
```

### Frontend (vitest)

```javascript
import { describe, it, expect } from 'vitest'

describe('Feature', () => {
  it('should do something', () => {
    const result = myFunction(input)
    expect(result).toBe(expected)
  })
})
```

## Troubleshooting

### Backend Tests Fail

1. **Database connection error**: Ensure PostgreSQL is running
2. **Import errors**: Verify all dependencies installed (`pip install -r requirements.txt`)
3. **Test database not created**: Check SQLAlchemy configuration

### Frontend Tests Fail

1. **Module not found**: Run `npm install`
2. **vitest not found**: Run `npm install --save-dev vitest jsdom`
3. **Tests not discovered**: Verify files in `src/__tests__/` directory

## Performance

Typical test execution times:
- Backend: ~2-3 seconds (full suite)
- Frontend: ~1-2 seconds (full suite)

## Future Improvements

- [ ] Add integration tests (E2E)
- [ ] Add visual regression tests
- [ ] Increase coverage to 95%+
- [ ] Add performance benchmarks
- [ ] Add load testing for reports
