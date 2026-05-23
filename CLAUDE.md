# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technology Stack

- **Backend**: FastAPI (Python 3.14)
- **Frontend**: React with Vite
- **Database**: PostgreSQL (via Docker Compose)
- **Formatter**: Black

## Project Structure

```
timetracker/
├── backend/              # FastAPI backend
│   ├── main.py          # FastAPI app entry point
│   ├── database.py      # SQLAlchemy setup
│   ├── models.py        # Database models (Task, Activity)
│   ├── schemas.py       # Pydantic schemas
│   ├── init_db.py       # Load Excel data into DB
│   ├── routes/          # API endpoints
│   │   ├── activities.py
│   │   ├── tasks.py
│   │   └── reports.py
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── styles/      # CSS files
│   │   ├── api.js       # API client
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── docker-compose.yml   # PostgreSQL setup
```

## Setup & Running

### 1. Start PostgreSQL
```bash
docker-compose up -d
```

### 2. Install backend dependencies
```bash
cd backend
source ../.venv/bin/activate
pip install -r requirements.txt
```

### 3. Run backend (from backend/)
```bash
python main.py
```
Backend runs on `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 4. Install frontend dependencies
```bash
cd frontend
npm install
```

### 5. Run frontend (from frontend/)
```bash
npm run dev
```
Frontend runs on `http://localhost:3000`

## Database

- **First run**: `init_db.py` automatically loads data from `DailyActivity_2026.xlsx`
- **Subsequent runs**: Existing data is preserved
- **Data persists** across container restarts via Docker volumes

## Key Features

**Daily Activity Page**
- Date navigation (Previous, Next, Today buttons)
- Filter tasks by name
- Add/edit/delete activities for each day
- Time duration calculation
- Total time spent display

**Tasks Page**
- View all tasks
- Add new tasks (name, type, sub-type, source, links)
- Edit/delete existing tasks

**Time Spent Page**
- Summary view: total hours per task
- Daily breakdown: hours per task per day

## API Endpoints

- `GET /api/activities?target_date=YYYY-MM-DD&task_id=<id>`
- `POST/PUT/DELETE /api/activities/<id>`
- `GET /api/tasks`
- `POST/PUT/DELETE /api/tasks/<id>`
- `GET /api/reports/time-spent-summary`
- `GET /api/reports/time-spent-daily?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
