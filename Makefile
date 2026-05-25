.PHONY: help install test lint format coverage clean setup-pre-commit

help:
	@echo "Time Tracker - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install          Install all dependencies (backend + frontend)"
	@echo "  make setup-pre-commit  Set up pre-commit hooks"
	@echo ""
	@echo "Development:"
	@echo "  make dev              Start both backend and frontend"
	@echo "  make dev-backend      Start backend only"
	@echo "  make dev-frontend     Start frontend only"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test             Run all tests"
	@echo "  make test-backend     Run backend tests"
	@echo "  make test-frontend    Run frontend tests"
	@echo "  make coverage         Generate coverage reports"
	@echo "  make lint             Run linting checks"
	@echo "  make lint-fix         Auto-fix linting issues"
	@echo "  make format           Format code with black and prettier"
	@echo "  make check            Run all checks (lint + test + coverage)"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up        Start PostgreSQL container"
	@echo "  make docker-down      Stop PostgreSQL container"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean            Remove build artifacts and cache"

# Installation
install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✓ Installation complete"

setup-pre-commit:
	@echo "Setting up pre-commit hooks..."
	pip install pre-commit
	pre-commit install
	@echo "✓ Pre-commit hooks installed"

# Development
dev-backend:
	cd backend && python main.py

dev-frontend:
	cd frontend && npm run dev

dev:
	@echo "Starting Docker database container..."
	docker-compose up -d
	@echo "Start backend in one terminal:"
	@echo "  make dev-backend"
	@echo "Start frontend in another terminal:"
	@echo "  make dev-frontend"
	@echo "Frontend will be available at http://localhost:3000"

# Testing
test: test-backend test-frontend
	@echo "✓ All tests passed"

test-backend:
	@echo "Running backend tests..."
	cd backend && pytest
	@echo "✓ Backend tests passed"

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm test
	@echo "✓ Frontend tests passed"

# Coverage
coverage:
	@echo "Generating backend coverage report (min 85%)..."
	cd backend && python -m scripts.update_coverage
	@echo ""
	@echo "Generating frontend coverage report (min 85%)..."
	cd frontend && node update-coverage.js
	@echo ""
	@echo "✓ Coverage reports generated"
	@echo "Backend:  backend/htmlcov/index.html"
	@echo "Frontend: frontend/coverage/index.html"
	@echo ""
	@echo "Note: Coverage minimum is 85% for pre-commit checks"
	@echo "      README.md badges automatically updated"

# Linting
lint:
	@echo "Running backend linting..."
	cd backend && flake8 . && black --check . && isort --check-only .
	@echo "✓ Backend lint passed"
	@echo ""
	@echo "Running frontend linting..."
	cd frontend && npm run lint
	@echo "✓ Frontend lint passed"

lint-fix:
	@echo "Fixing backend code..."
	cd backend && black . && isort .
	@echo "✓ Backend code formatted"
	@echo ""
	@echo "Fixing frontend code..."
	cd frontend && npm run lint:fix
	@echo "✓ Frontend code formatted"

format: lint-fix
	@echo "✓ All code formatted"

# Quality checks
check: lint test coverage
	@echo "✓ All quality checks passed"

# Docker
docker-up:
	docker-compose up -d
	@echo "✓ PostgreSQL is running"

docker-down:
	docker-compose down
	@echo "✓ PostgreSQL stopped"

# Cleanup
clean:
	@echo "Cleaning up..."
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name htmlcov -exec rm -rf {} +
	find . -type d -name coverage -exec rm -rf {} +
	find . -type f -name .coverage -delete
	find . -type f -name "*.pyc" -delete
	cd frontend && rm -rf node_modules .eslintcache dist
	@echo "✓ Cleanup complete"

.DEFAULT_GOAL := help
