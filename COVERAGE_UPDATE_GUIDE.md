# Coverage Update Guide

This guide explains how coverage reports are automatically generated and badges are updated as part of the pre-commit process.

## Overview

Coverage updating is now integrated into pre-commit hooks:

1. **Coverage Update** - Generates fresh reports and updates README badges
2. **Coverage Check** - Verifies 85%+ coverage threshold
3. **Commit Proceeds** - If all checks pass, commit is accepted

## How It Works

### Pre-commit Workflow with Coverage Updates

```
git commit
  │
  ├─ Backend Coverage Update
  │  ├─ Run pytest with coverage
  │  ├─ Generate HTML report (backend/htmlcov/)
  │  ├─ Generate JSON report (.coverage.json)
  │  └─ Update README.md badge
  │
  ├─ Frontend Coverage Update
  │  ├─ Run vitest with coverage
  │  ├─ Generate HTML report (frontend/coverage/)
  │  ├─ Generate JSON report (coverage.json)
  │  └─ Update README.md badge
  │
  ├─ Backend Coverage Check (verify 85%+)
  │
  ├─ Frontend Coverage Check (verify 85%+)
  │
  ├─ Code Quality Checks
  │  ├─ Black formatting
  │  ├─ isort import sorting
  │  ├─ Flake8 linting
  │  └─ Bandit security
  │
  └─ File Checks
     ├─ Trailing whitespace
     ├─ File endings
     └─ YAML/JSON validation
```

## Coverage Update Scripts

### Backend: `backend/update_coverage.py`

**What it does**:
1. Runs pytest with coverage collection
2. Generates:
   - HTML report: `backend/htmlcov/index.html`
   - JSON report: `.coverage.json`
   - Terminal output with summary
3. Extracts coverage percentage
4. Updates `README.md` coverage badge

**Run manually**:
```bash
cd backend
python update_coverage.py
```

### Frontend: `frontend/update-coverage.js`

**What it does**:
1. Runs vitest with coverage collection
2. Generates:
   - HTML report: `frontend/coverage/index.html`
   - JSON report: `frontend/coverage/coverage-final.json`
   - Terminal output with summary
3. Extracts coverage percentage
4. Updates `README.md` coverage badge

**Run manually**:
```bash
cd frontend
node update-coverage.js
```

## Badge Updates

### Automatic Badge Updates

When coverage changes, README.md badges are automatically updated:

**Before**:
```markdown
[![Coverage](https://img.shields.io/badge/Coverage-82%25-success.svg)](TESTING.md)
```

**After** (if coverage rises to 87%):
```markdown
[![Coverage](https://img.shields.io/badge/Coverage-87%25-success.svg)](TESTING.md)
```

### Manual Badge Update

If you want to update badges without committing:

```bash
cd backend && python update_coverage.py
cd ../frontend && node update-coverage.js
```

Then commit the updated README:
```bash
git add README.md
git commit -m "docs: update coverage badges"
```

## Workflow Examples

### Example 1: Normal Commit (Coverage Meets Threshold)

```bash
$ git commit -m "feat: add new feature"

📊 Generating backend coverage report...
✅ Coverage: 86.5% (≥ 85% required)
✅ Updated README.md coverage badge to 86.5%

📊 Generating frontend coverage report...
✅ Coverage: 87.2% (≥ 85% required)
✅ Updated README.md coverage badge to 87.2%

✅ All checks passed
[main 1a2b3c4] feat: add new feature
 1 file changed, 2 insertions(+)
```

### Example 2: Coverage Below Threshold

```bash
$ git commit -m "feat: add new feature"

📊 Generating backend coverage report...
❌ Coverage: 78.3% (≥ 85% required)

❌ Coverage check failed!
   Coverage must be at least 85%

# Fix: Add tests to improve coverage
$ pytest --cov=. --cov-report=html
$ # Add tests...
$ pytest --cov=. --cov-fail-under=85
✅ Coverage: 85.1%

$ git add .
$ git commit -m "test: improve coverage to 85.1%"
✅ Commit successful
```

### Example 3: Coverage Improves

```bash
Previous commit: Coverage 82%
Current commit: Coverage 87%

README.md diff:
- ![Coverage](https://img.shields.io/badge/Coverage-82%25-success.svg)
+ ![Coverage](https://img.shields.io/badge/Coverage-87%25-success.svg)

✅ Badge automatically updated in commit
```

## Features

### ✅ Automatic Reports

Coverage reports are generated every commit:
- Fresh HTML reports (human-readable)
- JSON reports (for tooling)
- Coverage percentage extracted and displayed

### ✅ Badge Updates

README.md badges stay current:
- Automatically updated with latest coverage
- Color coding reflects quality
- No manual badge updates needed

### ✅ Threshold Verification

After report generation, coverage is verified:
- Must be ≥ 85%
- Fails commit if below threshold
- Error message shows required vs actual

### ✅ Dual Check System

Two-step verification ensures quality:
1. **Update**: Generate reports, extract metrics, update badges
2. **Check**: Verify coverage meets 85% threshold

## Files Modified by Coverage Update

When coverage is updated, these files may be modified:

```
README.md           # Coverage badge updated
backend/htmlcov/    # HTML report (generated)
backend/.coverage   # Coverage data (generated)
frontend/coverage/  # HTML report (generated)
```

Only README.md is typically committed. Reports are generated but not committed (gitignore).

## Performance

Coverage update adds ~10-15 seconds per commit:
- Backend test suite: ~5-10 seconds
- Frontend test suite: ~5-10 seconds
- Badge update: <1 second

**Total commit time**: ~20-30 seconds (depending on test suite size)

## Troubleshooting

### Badge Not Updating

```bash
# Check if coverage script ran
cd backend && python update_coverage.py

# Verify README.md was modified
git diff README.md

# If not updated, check for errors in output
```

### Coverage Always Shows Same Percentage

```bash
# Force fresh coverage generation
cd backend && rm -f .coverage .coverage.json
cd ../frontend && rm -rf coverage/

# Re-run pre-commit
pre-commit run --all-files
```

### Reports Not Generated

```bash
# Check if pytest/vitest can run
cd backend && pytest --version
cd ../frontend && npm list vitest

# Run coverage manually
cd backend && python update_coverage.py
cd ../frontend && node update-coverage.js
```

## Skipping Coverage Update (Emergency Only)

```bash
# Skip pre-commit hooks (NOT RECOMMENDED)
git commit --no-verify

# This bypasses ALL checks including:
# - Coverage verification
# - Code formatting
# - Linting
# - File checks
```

**Use only for emergency hotfixes, then fix coverage ASAP**

## Best Practices

✅ **Do**:
- Let coverage update run normally
- Keep coverage ≥ 85% consistently
- Review coverage reports regularly
- Add tests when coverage drops

❌ **Don't**:
- Skip coverage updates
- Commit with coverage < 85%
- Ignore coverage report errors
- Use `--no-verify` as routine

## Integration with CI/CD

Coverage updates are local only:
- Pre-commit updates your local README.md
- GitHub Actions also runs coverage (for verification)
- If coverage drops on CI, fix tests before pushing

```
Local (pre-commit)
├─ Generate reports
├─ Update badges
└─ Verify 85%+

Remote (GitHub Actions)
├─ Run tests (Python 3.11, 3.12)
├─ Run tests (Node 18, 20)
├─ Generate coverage reports
└─ Verify 85%+
```

## Configuration

### Update Scripts Location

- Backend: `backend/update_coverage.py`
- Frontend: `frontend/update-coverage.js`

### Badge Format

README badges follow this pattern:
```markdown
[![Coverage](https://img.shields.io/badge/Coverage-{percentage}%25-success.svg)](TESTING.md)
```

### Coverage Extraction

Scripts extract coverage from:
- Backend: `.coverage.json` (Pytest)
- Frontend: `coverage/coverage-final.json` (Vitest)

## Future Enhancements

- [ ] Generate coverage trends over time
- [ ] Create coverage history graph
- [ ] Email coverage reports
- [ ] Slack notifications for coverage drops
- [ ] Per-file coverage minimum enforcement
- [ ] Coverage badge in commit messages

## References

- [Coverage Checks](COVERAGE_CHECKS.md)
- [Testing Guide](TESTING.md)
- [Quality Control](QUALITY_CONTROL.md)
