# Quick Start Guide

Get the Time Tracker app running in 5 steps.

## Step 1: Start PostgreSQL Database

```bash
docker-compose up -d
```

## Step 2: Start Backend API (in one terminal)

```bash
cd backend
source ../.venv/bin/activate
python main.py
```

Wait for output: `Uvicorn running on http://0.0.0.0:8000`

✅ Backend is ready at http://localhost:8000
📖 API docs at http://localhost:8000/docs

## Step 3: Start Frontend (in another terminal)

```bash
cd frontend
npm run dev
```

Wait for output: `Local: http://localhost:3000`

✅ Frontend is ready at http://localhost:3000

## Step 4: Open in Browser

Navigate to: **http://localhost:3000**

## Step 5: Start Using!

### Daily Activity Page
- Navigate dates with Previous/Next buttons
- Click "Today" to return to current date
- Click "+ Add" to add new activities
- Filter by task name using the dropdown
- See total time for filtered tasks
- Click Edit/Delete to modify activities

### Tasks Page
- View all task definitions
- Click "+ Add Task" to create new tasks
- Edit/Delete existing tasks

### Time Spent Page
- View Summary tab for total hours per task
- View Daily Breakdown tab for day-by-day hours

## Stopping Services

### Stop Frontend
Press `Ctrl+C` in the frontend terminal

### Stop Backend
Press `Ctrl+C` in the backend terminal

### Stop PostgreSQL
```bash
docker-compose down
```

Data persists in Docker volumes, so restarting with `docker-compose up -d` will restore all data.

## Initial Data

The first time you start the backend, it automatically loads all activities and tasks from `DailyActivity_2026.xlsx` into PostgreSQL.

Subsequent restarts preserve all your changes and additions.

## Troubleshooting

### "Docker daemon not running"
- Start Docker Desktop (Mac/Windows) or start Docker service (Linux)

### "Port 8000/3000 already in use"
- Find and stop the process using that port
- Or modify the port in the respective config files

### "Module not found" errors
- Backend: Run `pip install -r backend/requirements.txt`
- Frontend: Run `npm install` in frontend directory

### "Connection refused" error when starting backend
- PostgreSQL container might not be fully started yet
- Wait a few seconds and try again
- Check: `docker logs timetracker_postgres`

---

**Full documentation**: See [README.md](README.md)
