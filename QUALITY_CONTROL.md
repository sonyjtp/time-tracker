# Quality Control Setup

This document summarizes the complete quality control and testing infrastructure.

## Coverage & Testing

### Backend Test Coverage
- **Framework**: pytest
- **Coverage Tool**: pytest-cov
- **Minimum Coverage**: 80%
- **Test Files**: 4 files with 40+ tests
- **Command**: `pytest --cov=. --cov-report=html`

### Frontend Test Coverage
- **Framework**: Vitest
- **Coverage Tool**: Vitest built-in
- **Minimum Coverage**: 80% (lines), 75% (branches)
- **Test Files**: 3 files with 30+ tests
- **Command**: `npm run test:coverage`

### Coverage Badges
- Tests: ![70+ Tests](https://img.shields.io/badge/Tests-70%2B-brightgreen.svg)
- Coverage: ![80% Coverage](https://img.shields.io/badge/Coverage-80%25-success.svg)
- Quality: ![Code Quality A](https://img.shields.io/badge/Code%20Quality-A-success.svg)

## Code Quality Tools

### Python (Backend)

| Tool | Purpose | Config |
|------|---------|--------|
| **Black** | Code formatting | `pyproject.toml` |
| **Flake8** | Linting | `.flake8` |
| **isort** | Import sorting | `pyproject.toml` |
| **Bandit** | Security checks | `bandit.yaml` |
| **MyPy** | Type checking (optional) | `pyproject.toml` |

### JavaScript/React (Frontend)

| Tool | Purpose | Config |
|------|---------|--------|
| **ESLint** | Linting | `.eslintrc.json` |
| **Prettier** | Code formatting (via ESLint) | `.eslintrc.json` |

### Cross-platform

| Tool | Purpose | Config |
|------|---------|--------|
| **EditorConfig** | Editor consistency | `.editorconfig` |
| **Pre-commit** | Automated checks | `.pre-commit-config.yaml` |

## Pre-commit Hooks

Automatically run on every `git commit`:

### Enabled Hooks

**Coverage (runs full test suite & updates reports)** ⭐
1. **Coverage Update - Backend** - Generate reports, update README badges
2. **Coverage Update - Frontend** - Generate reports, update README badges
3. **Coverage Check - Backend** - Verify 85%+ test coverage
4. **Coverage Check - Frontend** - Verify 85%+ test coverage

**Code Quality**
5. **Black** - Auto-format Python code
6. **isort** - Auto-sort Python imports
7. **Flake8** - Check Python syntax/style
8. **Bandit** - Security vulnerability scan

**File Checks**
9. **Trailing Whitespace** - Remove trailing whitespace
10. **End of File Fixer** - Fix file endings
11. **Check YAML** - Validate YAML syntax
12. **Check JSON** - Validate JSON syntax
13. **Check Large Files** - Prevent large file commits (max 1MB)

### Setup Pre-commit Hooks

```bash
pip install pre-commit
pre-commit install

# Test hooks manually
pre-commit run --all-files
```

## CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/tests.yml`

Runs on every push and pull request:

#### Backend Pipeline
1. Set up Python (3.11, 3.12)
2. Set up PostgreSQL service
3. Install dependencies
4. Run linting checks (Black, Flake8, isort)
5. Run tests with coverage
6. Upload coverage to Codecov

#### Frontend Pipeline
1. Set up Node.js (18.x, 20.x)
2. Install dependencies
3. Run ESLint
4. Run tests with coverage
5. Upload coverage to Codecov

#### Quality Gate
- Checks that all tests passed
- Fails if either backend or frontend tests fail

## Make Commands

Convenient shortcuts for development:

```bash
make help              # Show all available commands
make install           # Install all dependencies
make setup-pre-commit  # Set up pre-commit hooks
make test              # Run all tests
make test-backend      # Run backend tests only
make test-frontend     # Run frontend tests only
make coverage          # Generate coverage reports
make lint              # Check code style
make lint-fix          # Auto-fix code style
make format            # Format all code
make check             # Run lint + test + coverage
make clean             # Clean build artifacts
```

## Configuration Files

### Backend Configurations

**pyproject.toml**
- Pytest settings
- Coverage thresholds
- Black configuration
- isort configuration

**pytest.ini**
- Test discovery patterns
- Test output options

**.flake8**
- Flake8 settings
- Max line length (100)
- Ignored rules

**conftest.py**
- Pytest fixtures
- Database setup/teardown
- Sample data creation

### Frontend Configurations

**vitest.config.js**
- Vitest settings
- Coverage thresholds
- Reporter configuration

**.eslintrc.json**
- ESLint rules
- React-specific settings
- Code style preferences

### Global Configurations

**.pre-commit-config.yaml**
- Pre-commit hooks configuration
- Hook versions
- Global ignore patterns

**.editorconfig**
- Editor-agnostic formatting
- Line endings, indentation
- Charset and final newlines

## Coverage Thresholds

### Backend (Python) - Required for Pre-commit ⭐
```
Lines:       ≥ 85%
Functions:   ≥ 85%
Branches:    ≥ 85%
Statements:  ≥ 85%
```

### Frontend (JavaScript) - Required for Pre-commit ⭐
```
Lines:       ≥ 85%
Functions:   ≥ 85%
Branches:    ≥ 80%
Statements:  ≥ 85%
```

### CI Failure Conditions
- Any test fails
- Coverage drops below threshold
- Linting fails
- Security checks detect issues

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### 2. Make Changes
```bash
# Code changes...
```

### 3. Run Quality Checks
```bash
make check  # Runs lint + test + coverage
```

### 4. Fix Issues
```bash
make lint-fix  # Auto-fix issues
# Manually fix remaining issues
```

### 5. Commit Changes
```bash
git add .
git commit -m "feat: describe changes"
# Pre-commit hooks run automatically
```

### 6. Push and Create PR
```bash
git push origin feature/my-feature
# GitHub Actions runs on PR
```

## Coverage Reports

### Viewing Coverage

**Backend**
```bash
cd backend
pytest --cov=. --cov-report=html
open htmlcov/index.html
```

**Frontend**
```bash
cd frontend
npm run test:coverage
open coverage/index.html
```

### Coverage Upload to Codecov
- Automatically uploaded by GitHub Actions
- View at: codecov.io (repository page)

## Performance Metrics

### Test Execution Time
- Backend: ~3-5 seconds
- Frontend: ~2-4 seconds
- Total: ~7-9 seconds

### Code Quality Metrics
- Average cyclomatic complexity: Low
- Code duplication: <5%
- Security issues: 0 (high/critical)

## Recommended IDE Extensions

### VS Code
- [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
- [Pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

### PyCharm
- Python and JavaScript bundles included
- Built-in support for all configured tools

## Troubleshooting

### Pre-commit Hooks Not Running
```bash
pre-commit install
pre-commit run --all-files
```

### Coverage Not Meeting Target
1. Generate coverage report: `make coverage`
2. Open HTML report
3. Identify uncovered lines
4. Add tests for uncovered code

### CI Pipeline Failing
1. Check GitHub Actions logs
2. Run `make check` locally
3. Fix issues and commit
4. Push again

### Import Errors in Tests
```bash
cd backend
pip install -r requirements.txt --force-reinstall
```

## Best Practices

✅ **Do**
- Run `make check` before committing
- Write tests for new features
- Use descriptive commit messages
- Keep coverage above 80%
- Follow code style guidelines

❌ **Don't**
- Skip pre-commit hooks with `--no-verify`
- Commit code that doesn't pass linting
- Decrease coverage thresholds
- Ignore failing tests
- Mix formatting changes with logic changes

## References

- [Testing Guide](TESTING.md)
- [Development Guide](DEVELOPMENT.md)
- [Test Summary](TEST_SUMMARY.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://codecov.io/support/docs)
