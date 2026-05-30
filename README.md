# Time Tracker

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-orange.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![ESLint](https://img.shields.io/badge/ESLint-Configured-4B3B8A.svg)](#)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-A-success.svg)](#)
[![Pre-commit Checks](https://img.shields.io/badge/Pre%E2%80%90commit-Enabled-blue.svg)](#)
[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A web-based time tracking app built with FastAPI, React, and PostgreSQL.

## Quick Start

```bash
# 1. Start the database
docker-compose up -d

# 2. Start backend (terminal 1)
cd backend && source ../.venv/bin/activate && pip install -r requirements.txt && python main.py

# 3. Start frontend (terminal 2)
cd frontend && npm install && npm run dev

# 4. Open http://localhost:3000
```

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | FastAPI (Python)        |
| Frontend | React 18 + Vite         |
| Database | PostgreSQL via Docker   |
| Styling  | CSS3                    |
| HTTP     | Axios                   |

## Pages

- **Daily Activity** — Date navigation (Previous / Next / Today / + Add), activity CRUD, time totals
- **Tasks** — Task management with type, sub-type, source, links; date range filtering
- **Time Spent** — Summary by Task / Type / Sub-Type / Source; Daily Breakdown and Daily Average (filterable by Type, defaults to Technical)
- **Dashboard** — Weekly/Monthly totals and averages; Days Worked On panel; Type → Sub-Type → Task filters
- **Settings** — Reference start date (defaults to first of current month)

## Project Structure

```
timetracker/
├── backend/
│   ├── main.py           # FastAPI entry point
│   ├── database.py       # SQLAlchemy setup
│   ├── models.py         # Task, Activity, Settings models
│   ├── schemas.py        # Pydantic schemas
│   ├── init_db.py        # Excel → DB import (runs once)
│   └── routes/           # activities, tasks, reports, settings
├── frontend/
│   └── src/
│       ├── pages/        # DailyActivity, Tasks, TimeSpent, Dashboard, Settings
│       ├── components/   # ActivityForm, TaskForm
│       ├── styles/       # Per-page CSS
│       ├── api.js        # API client
│       └── App.jsx       # Routing + sticky navbar
└── docker-compose.yml
```

## API Endpoints

| Method          | Endpoint                                                | Description           |
|-----------------|---------------------------------------------------------|-----------------------|
| GET             | `/api/activities?target_date=&task_id=`                 | Activities for a date |
| POST/PUT/DELETE | `/api/activities/{id}`                                  | Activity CRUD         |
| GET             | `/api/tasks`                                            | All tasks             |
| POST/PUT/DELETE | `/api/tasks/{id}`                                       | Task CRUD             |
| GET             | `/api/reports/time-spent-summary?start_date=&end_date=` | Totals per task       |
| GET             | `/api/reports/time-spent-daily?start_date=&end_date=`   | Daily breakdown       |
| GET/PUT         | `/api/settings/reference_date`                          | Reference start date  |

## Database

- **DB**: `timetracker_db` · **User**: `timetracker` · **Port**: `5433`
- Tables: `tasks`, `activities`, `settings`, `time_spent_cache`
- On first run, `init_db.py` auto-imports `DailyActivity_2026.xlsx` (and other year files)

## Troubleshooting

- **DB connection error** — `docker-compose restart`
- **Backend won't start** — check port 8000 is free; verify `.venv` is active
- **Frontend won't build** — `rm -rf frontend/node_modules && npm install`
