# Coverage Checks in Pre-commit Hooks

This document explains how coverage checking is integrated into pre-commit hooks and enforced at 85%.

## Overview

Coverage checks are **now part of pre-commit hooks**, running automatically before every commit to ensure code quality is maintained.

- **Backend**: Minimum 85% coverage (all metrics)
- **Frontend**: Minimum 85% coverage (lines, functions, statements); 80% branches
- **When**: Runs on every `git commit`
- **What happens**: Full test suite executes to verify coverage

## How It Works

### Backend Coverage Update & Check

**Files**: 
- `backend/update_coverage.py` - Generates reports and updates badges
- `backend/check_coverage.py` - Verifies 85%+ coverage

**Runs automatically on commit**:
1. Generate coverage reports (HTML, JSON)
2. Update README.md badges
3. Verify coverage ≥ 85%

```bash
# Step 1: Update coverage reports
python backend/update_coverage.py

# Step 2: Check coverage threshold
pytest --cov=. --cov-report=term-missing --cov-fail-under=85 -q
```

**If coverage < 85%**:
- ❌ Commit is blocked
- Error message shows coverage percentage
- You must add/improve tests before committing

**If coverage ≥ 85%**:
- ✅ Reports generated and badges updated
- ✅ Check passes
- Commit proceeds to other checks

### Frontend Coverage Update & Check

**Files**:
- `frontend/update-coverage.js` - Generates reports and updates badges
- `frontend/check-coverage.js` - Verifies 85%+ coverage

**Runs automatically on commit**:
1. Generate coverage reports (HTML, JSON)
2. Update README.md badges
3. Verify coverage thresholds

Verifies:
- Lines ≥ 85%
- Functions ≥ 85%
- Statements ≥ 85%
- Branches ≥ 80%

## Configuration

### Pre-commit Configuration

**.pre-commit-config.yaml**:
```yaml
- repo: local
  hooks:
    - id: coverage-backend
      name: Backend Coverage Check
      entry: python backend/check_coverage.py
      language: system
      pass_filenames: false
      stages: [commit]

    - id: coverage-frontend
      name: Frontend Coverage Check
      entry: node frontend/check-coverage.js
      language: system
      pass_filenames: false
      stages: [commit]
```

### Test Configuration

**backend/pyproject.toml**:
```toml
[tool.pytest.ini_options]
addopts = "--cov-fail-under=85"
```

**frontend/vitest.config.js**:
```javascript
lines: 85,
functions: 85,
branches: 80,
statements: 85,
```

## Workflow

### Standard Git Workflow

```bash
# 1. Make code changes and write tests
# 2. Stage changes
git add .

# 3. Commit (pre-commit hooks run)
git commit -m "feat: add new feature"

# Pre-commit runs in this order:
# ├─ Coverage Check - Backend (⏱️ ~5-10s)
# ├─ Coverage Check - Frontend (⏱️ ~5-10s)  
# ├─ Black formatting
# ├─ isort import sorting
# ├─ Flake8 linting
# ├─ Bandit security checks
# └─ File checks (whitespace, sizes, etc.)
```

### If Coverage Check Fails

```
❌ Coverage check failed!
   Coverage must be at least 85%
   
   Coverage: 78% (Lines) < 85% required
```

**What to do**:

```bash
# 1. View coverage report
cd backend && pytest --cov=. --cov-report=html
open htmlcov/index.html

# 2. Identify uncovered lines
# 3. Write tests for uncovered code
# 4. Re-run coverage check locally
pytest --cov=. --cov-fail-under=85

# 5. Stage and commit again
git add .
git commit -m "test: improve coverage to 85%"
```

## Running Checks Locally

### Before Committing

```bash
# Run coverage check manually
cd backend && python check_coverage.py
cd frontend && node check-coverage.js

# Or use make
make coverage
```

### Full Quality Check

```bash
# Run all pre-commit checks
pre-commit run --all-files

# Or use make
make check
```

## Why Coverage in Pre-commit?

✅ **Prevents bad code from being committed**
- Coverage must stay at 85%+ 
- Encourages writing tests with code

✅ **Catches regressions early**
- New features must have tests
- Refactoring must maintain coverage

✅ **Maintains code quality**
- Consistent standard across team
- No accidental coverage drops

✅ **Automatic enforcement**
- No manual checks needed
- CI/CD verification backed up

## Performance Impact

Pre-commit with coverage checks takes approximately:
- Backend tests: ~5-10 seconds
- Frontend tests: ~5-10 seconds
- **Total**: ~15-20 seconds per commit

### Optimization Tips

```bash
# Skip pre-commit (not recommended)
git commit --no-verify

# Run specific hooks only
pre-commit run black --all-files
pre-commit run coverage-backend --all-files

# Use make for partial checks
make lint-fix    # Quick fixes only
make test        # Tests without full checks
```

## Exemptions & Edge Cases

### When Coverage Check Is Skipped

Coverage checks are skipped in:
- Merge commits: `git merge --no-verify`
- Rebase operations
- Initial commits (if configured)

**Use sparingly**: Commit message should explain why

## Integration with CI/CD

### GitHub Actions

Coverage checks also run on:
- Pull requests
- Push to main/develop
- Can be viewed in GitHub Actions logs

**Difference**: CI/CD tests multiple Python/Node versions

### Local vs CI

| Aspect | Local (Pre-commit) | CI/CD |
|--------|------------------|------|
| Trigger | `git commit` | Push/PR |
| Speed | 15-20 seconds | 1-2 minutes |
| Versions | Single | Multiple |
| Detail | Quick pass/fail | Full reports |

## Troubleshooting

### Coverage Check Hangs

```bash
# Kill the hung process
pkill -f pytest
pkill -f vitest

# Check for infinite loops in tests
# Remove `import pdb; pdb.set_trace()` calls
```

### Pre-commit Not Running Coverage

```bash
# Reinstall pre-commit hooks
pre-commit install --install-hooks

# Verify configuration
pre-commit validate-config

# Run manually to debug
pre-commit run --all-files --verbose
```

### False Coverage Failures

If coverage shows 85% but still fails:
- Check exact metrics (lines, branches, functions)
- Some might be below threshold
- Check against pyproject.toml and vitest.config.js

## Future Enhancements

- [ ] Cache test results for faster checks
- [ ] Parallel test execution for speed
- [ ] Coverage diff reporting (only new code)
- [ ] Per-file coverage minimums
- [ ] Integration with Codecov badges

## FAQ

**Q: Can I commit code with <85% coverage?**
A: No, pre-commit hook will block it. Add tests first.

**Q: Why 85% and not 80%?**
A: 85% is a high standard that ensures good test quality and catches regressions.

**Q: Does pre-commit run tests on all commits?**
A: Yes, every commit runs the full test suite. Use `--no-verify` only for emergency hotfixes.

**Q: Can I reduce coverage threshold?**
A: Not recommended. Contact team lead if you need to adjust it.

**Q: What if I'm in a hotfix branch?**
A: Still must maintain 85% coverage. Speed is not a valid reason to skip tests.

**Q: How do I check coverage without committing?**
A: Use `make coverage` or `pytest --cov=. --cov-fail-under=85`

## References

- [Check Coverage Scripts](backend/check_coverage.py)
- [Pre-commit Configuration](.pre-commit-config.yaml)
- [Test Documentation](TESTING.md)
- [Development Guide](DEVELOPMENT.md)
