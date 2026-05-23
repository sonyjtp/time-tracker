# Development Guide

This guide covers development setup, code quality standards, and testing practices.

## Quick Setup

### Using Make (Recommended)

```bash
make install        # Install all dependencies
make setup-pre-commit # Set up pre-commit hooks
make test          # Run all tests
make coverage      # Generate coverage reports
```

### Manual Setup

```bash
# Backend
cd backend
pip install -r requirements.txt
pip install pre-commit

# Frontend
cd frontend
npm install

# Set up pre-commit
pre-commit install
```

## Code Quality Standards

### Python Code Style

- **Formatter**: Black
- **Linting**: Flake8
- **Import Sorting**: isort
- **Line Length**: 100 characters
- **Target Version**: Python 3.11+

### JavaScript/React Code Style

- **Linter**: ESLint
- **Config**: eslint-config-react-app
- **Line Length**: 100 characters (enforced in comments)

### Standards Compliance

All code must meet these standards:
- ✅ Passes linting checks
- ✅ Formatted consistently
- ✅ 80%+ test coverage
- ✅ No security warnings
- ✅ Clear, descriptive commits

## Pre-commit Hooks

Pre-commit hooks automatically run checks before commits. They ensure code quality without manual intervention.

### Installed Hooks

- **black**: Code formatting
- **isort**: Import sorting
- **flake8**: Python linting
- **bandit**: Security checks
- **trailing-whitespace**: Remove trailing whitespace
- **end-of-file-fixer**: Fix file endings
- **check-yaml**: Validate YAML
- **check-json**: Validate JSON
- **check-large-files**: Prevent large file commits

### Setup

```bash
pip install pre-commit
pre-commit install

# To run checks manually
pre-commit run --all-files
```

## Testing

### Backend Tests

```bash
# Run all tests
cd backend && pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest test_activities.py

# Run tests matching pattern
pytest -k "test_create"

# Run with verbose output
pytest -v
```

**Coverage Targets**:
- Minimum: 80% line coverage
- Critical paths: 95%+

### Frontend Tests

```bash
# Run all tests
cd frontend && npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Watch mode (auto-rerun on changes)
npm test -- --watch
```

**Coverage Targets**:
- Lines: 80%+
- Functions: 80%+
- Branches: 75%+
- Statements: 80%+

### Full Quality Check

```bash
# Run linting + tests + coverage
make check

# Or manually:
make lint
make test
make coverage
```

## Code Formatting

### Auto-format Code

```bash
# Format Python code
cd backend
black .
isort .

# Or use make
make lint-fix
```

### Check Code Style (No Changes)

```bash
# Check Python code
cd backend
black --check .
flake8 .
isort --check-only .

# Or use make
make lint
```

## Commit Best Practices

### Conventional Commits

Use clear, descriptive commit messages:

```
feat: add daily activity filtering
fix: correct time calculation for overnight shifts
docs: update installation instructions
test: add test cases for settings API
chore: update dependencies
refactor: simplify filtering logic
```

### Pre-commit Workflow

1. Make changes to code
2. Stage changes: `git add .`
3. Pre-commit hooks run automatically
4. If checks fail:
   - Fix issues (formatter auto-fixes some)
   - Stage again: `git add .`
   - Commit again
5. If all checks pass: commit succeeds

## Testing Guidelines

### Test Structure

```python
def test_feature_behavior():
    # Arrange: Set up test data
    data = {...}
    
    # Act: Execute the feature
    result = function(data)
    
    # Assert: Verify results
    assert result == expected
```

### Test Naming

- `test_<function>_<scenario>` - Descriptive names
- `test_create_activity` - Good
- `test_create_activity_with_valid_data` - Better
- `test_create` - Too vague

### Test Coverage

Aim for:
- **Happy path**: All normal operations
- **Edge cases**: Boundary conditions
- **Error cases**: Invalid inputs
- **Data validation**: Type/format checking

### Adding New Tests

1. Create test function in appropriate test file
2. Use fixtures for common setup
3. Keep tests focused (one scenario per test)
4. Use descriptive assertions
5. Verify coverage after adding tests

```bash
pytest --cov=. --cov-report=term-missing
```

## Running the Application

### Development Mode

```bash
# Terminal 1: Start database
docker-compose up

# Terminal 2: Start backend
cd backend && python main.py

# Terminal 3: Start frontend
cd frontend && npm run dev
```

### With Make

```bash
make docker-up    # Start database
make dev-backend  # Start backend
make dev-frontend # Start frontend
```

## Environment Variables

Create `.env` file in backend (if needed):

```
DATABASE_URL=postgresql://timetracker:timetracker_password@localhost:5433/timetracker_db
DEBUG=False
```

## Debugging

### Backend Debugging

```python
# Add breakpoint in code
breakpoint()  # or pdb.set_trace()

# Run with pdb
python -m pdb backend/main.py

# Use IDE debugger (VS Code, PyCharm)
```

### Frontend Debugging

```javascript
// Add console logs
console.log('Debug:', variable)

// Use debugger statement
debugger

// Browser DevTools (F12)
```

## IDE Setup

### VS Code

Extensions:
- Python
- Pylance
- ESLint
- Prettier

Settings (`.vscode/settings.json`):
```json
{
  "[python]": {
    "editor.defaultFormatter": "ms-python.python",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": true
    }
  },
  "[javascript]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint",
    "editor.formatOnSave": true
  }
}
```

### PyCharm

Settings:
- Enable Black integration
- Enable isort integration
- Set Python interpreter to venv
- Enable pytest integration

## Continuous Integration

GitHub Actions automatically runs:
- Backend tests (Python 3.11, 3.12)
- Frontend tests (Node 18, 20)
- Coverage checks
- Linting checks

View status: GitHub Actions tab in repository

## Performance Testing

Check query performance:
```bash
cd backend
pytest --durations=10  # Show slowest 10 tests
```

## Troubleshooting

### Import Errors

```bash
cd backend
pip install -r requirements.txt --force-reinstall
```

### Tests Failing Locally but Pass on CI

- Check Python/Node versions match CI
- Clear cache: `make clean`
- Reinstall dependencies
- Check database connection

### Pre-commit Hooks Not Running

```bash
pre-commit install
pre-commit install --install-hooks
pre-commit run --all-files
```

### Coverage Not Meeting Target

1. Run coverage report: `make coverage`
2. Open HTML report: `backend/htmlcov/index.html`
3. Add tests for uncovered lines
4. Re-run coverage check

## Resources

- [Testing Guide](TESTING.md)
- [Test Summary](TEST_SUMMARY.md)
- [Black Formatter](https://black.readthedocs.io/)
- [Flake8 Docs](https://flake8.pycqa.org/)
- [Pytest Docs](https://docs.pytest.org/)
- [Vitest Docs](https://vitest.dev/)
