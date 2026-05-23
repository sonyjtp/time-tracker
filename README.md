# Time Tracker Application

A web-based time tracking application built with FastAPI (backend), React (frontend), and PostgreSQL (database). Track daily activities, manage tasks, and view detailed time spent reports.

## Features

### 🎯 Daily Activity Tracking
- **Date Navigation**: Use Previous/Next buttons, date picker, or "Today" button to navigate between days
- **Task-Based Activities**: Create activities linked to specific tasks with customizable start and end times
- **Smart Defaults**: Start time automatically defaults to current time when adding new activities
- **Intelligent Filtering**: Filter activities by task (shows only tasks with activities recorded for the selected day)
- **Time Calculations**: Automatic duration calculation in hours and minutes format (HH:MM)
- **Activity Management**: Add, edit, or delete activities with instant updates
- **Time Summary**: View total time spent on filtered tasks
- **Activity Details**: Record comments and links for each activity

### 📋 Task Management
- **Comprehensive Task Data**: Define tasks with name, type, sub-type, source, and resource links
- **Date Tracking**: Automatic start date and last worked date tracking
- **Date Range Filtering**: Filter tasks by date range to find relevant tasks
- **Advanced Sorting**: Sort by all columns (Task Name, Type, Sub-type, Source, Start Date, Last Worked)
- **Full CRUD Operations**: Create, read, update, and delete tasks
- **Scrollable Table**: View up to 15 rows with scrolling capability
- **Wide Layout**: Optimized table layout to minimize horizontal scrolling

### 📊 Time Spent Reports
Multiple customizable views for analyzing time spent:

- **Summary by Task**: Total hours spent on each task
  - Sortable by task name and total hours
  - Filterable by task, type, and sub-type
  - Date range selection

- **Summary by Type**: Aggregate time spent by task type
  - Shows cumulative hours for each type
  - Sortable columns
  - Works with date range filters

- **Summary by Sub-Type**: Organize time by task sub-type
  - Displays total hours per sub-type
  - Full sorting capabilities
  - Respects date range selection

- **Daily Breakdown**: Detailed daily view of time per task
  - Shows hours recorded for each day
  - Cascading filters (Type → Sub-type → Task)
  - Only displays tasks with actual activities in the date range
  - Organized by task sections

### ⚙️ Settings
- **Reference Date Configuration**: Set the default start date for reports (default: January 1st of current year)
- **Date Range Control**: Define date ranges for all reports and filtering

### 🚀 Performance & Data Management
- **Intelligent Data Loading**: One-time loading of Excel data on first run (automatic detection prevents duplicate loads)
- **Query Caching**: Historical date ranges are cached for faster report generation
- **Data Persistence**: All data persists across application restarts via Docker volumes
- **Multi-Year Support**: Load and manage activities from multiple years (2022-2026+)

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React 18 + Vite
- **Database**: PostgreSQL (Docker)
- **Styling**: CSS3
- **API Communication**: Axios

## Prerequisites

- Docker and Docker Compose (for PostgreSQL)
- Python 3.11+ (for backend)
- Node.js 18+ (for frontend)
- Virtual environment for Python

## Setup Instructions

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will start PostgreSQL in a Docker container with data persistence.

### 2. Install Backend Dependencies

```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Start Backend Server

```bash
cd backend
python main.py
```

The backend API will start on `http://localhost:8000`

**API Documentation**: Visit `http://localhost:8000/docs` for interactive API docs

### 4. Install Frontend Dependencies

In a new terminal:

```bash
cd frontend
npm install
```

### 5. Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

### 6. Access the Application

Open your browser and navigate to `http://localhost:3000`

## File Structure

```
timetracker/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # SQLAlchemy configuration
│   ├── models.py               # Database models (Task, Activity)
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── init_db.py              # Database initialization script
│   ├── routes/
│   │   ├── activities.py       # Activity CRUD endpoints with cache invalidation
│   │   ├── tasks.py            # Task CRUD endpoints with date tracking
│   │   ├── reports.py          # Time spent report endpoints with caching
│   │   └── settings.py         # Settings management endpoints
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DailyActivity.jsx    # Daily activity tracking page with date navigation
│   │   │   ├── Tasks.jsx            # Task management with date range filtering & sorting
│   │   │   ├── TimeSpent.jsx        # Multi-view time spent reporting (Task/Type/Sub-type + Daily)
│   │   │   └── Settings.jsx         # Reference date configuration
│   │   ├── components/
│   │   │   ├── ActivityForm.jsx     # Activity add/edit modal with smart defaults
│   │   │   └── TaskForm.jsx         # Task add/edit modal
│   │   ├── styles/                  # CSS files
│   │   ├── api.js                   # API client utilities
│   │   ├── App.jsx                  # Main app component with routing
│   │   └── main.jsx                 # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml          # PostgreSQL configuration
├── CLAUDE.md                   # Claude Code guidance
└── README.md                   # This file
```

## API Endpoints

### Activities
- `GET /api/activities?target_date=YYYY-MM-DD&task_id=<id>` - Get activities for a specific date (optional task filter)
- `POST /api/activities` - Create new activity
- `PUT /api/activities/{id}` - Update activity
- `DELETE /api/activities/{id}` - Delete activity

### Tasks
- `GET /api/tasks` - Get all tasks with metadata (start_date, end_date)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Reports
- `GET /api/reports/time-spent-summary?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Get total hours per task (respects date range)
- `GET /api/reports/time-spent-daily?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Get daily breakdown by task and date

### Settings
- `GET /api/settings/reference_date` - Get the configured reference date
- `PUT /api/settings/reference_date` - Set the reference date for reports

## Database

The application uses PostgreSQL with Docker for data persistence.

- **Database**: `timetracker_db`
- **User**: `timetracker`
- **Password**: `timetracker_password`
- **Host Port**: `5433` (container port 5432)
- **Note**: Port 5433 is used to avoid conflicts with existing PostgreSQL on port 5432

### Tables

**tasks** - Task definitions
- id, name, type, sub_type, source, links
- start_date (earliest activity date), end_date (latest activity date)
- created_at, updated_at

**activities** - Daily activity records
- id, task_id (foreign key), date, start_time, end_time
- comments, links
- created_at, updated_at

**settings** - Application configuration
- key, value (stores reference_date and other settings)

**time_spent_cache** - Performance optimization
- cache_key, start_date, end_date, data (JSON)
- Caches time spent calculations for historical date ranges

### Data Loading
On first run, `init_db.py` automatically loads all data from Excel files (`DailyActivity_2026.xlsx` and other year files) into the PostgreSQL database. The application uses intelligent detection to load data only once, preventing duplicate loads on subsequent runs. All Excel data is imported into the activities table with associated task records.

## User Interface Features

### Filtering and Sorting
- **Cascading Filters**: In Time Spent reports, selecting a Type automatically filters Sub-types, and selecting Type/Sub-type filters Tasks
- **Smart Task Lists**: Task filter dropdowns only show tasks with actual data for the current context
- **Column Sorting**: Click any sortable column header to toggle ascending/descending order
- **Visual Indicators**: Sort direction indicators (↑/↓) show current sort state

### Time Display Format
- All times display in **HH:MM** format (24-hour, no seconds)
- Duration shown as **Xh Ym** format (hours and minutes)
- Total time shown in **decimal hours** (e.g., 2.50 hours for 2 hours 30 minutes)

### Date Selection
- **Date Picker**: Click to select any specific date
- **Navigation Buttons**: Previous/Next/Today buttons for quick navigation
- **Date Range**: Select start and end dates for reports

## Development

### Adding New Features

1. **Backend**: Add models to `models.py`, schemas to `schemas.py`, and routes to `routes/`
2. **Frontend**: Add new pages to `src/pages/` or components to `src/components/`
3. **API**: All frontend-backend communication goes through the API layer (`src/api.js`)

### Code Formatting

Format Python code with Black:
```bash
black backend/
```

### Running Tests

Once tests are added, run them with:
```bash
pytest backend/
```

## Troubleshooting

### PostgreSQL Connection Error
- Ensure Docker daemon is running: `docker ps`
- Check container status: `docker ps -a`
- Restart containers: `docker-compose restart`

### Backend Won't Start
- Ensure port 8000 is not in use
- Check database connection in `backend/database.py`
- Verify environment and dependencies are installed

### Frontend Won't Build
- Clear node_modules: `rm -rf frontend/node_modules && npm install`
- Ensure Node.js version is 18+: `node --version`

### API Calls Failing
- Check backend is running and accessible: `curl http://localhost:8000/api/health`
- Verify CORS is configured correctly in `backend/main.py`
- Check browser console for detailed error messages

## Production Deployment

For production deployment:
1. Build the React frontend: `npm run build`
2. Serve static files from a web server
3. Deploy FastAPI backend with a production server (e.g., Gunicorn)
4. Use a managed PostgreSQL service instead of Docker
5. Set environment variables for sensitive configuration

## License

This project is provided as-is for educational and personal use.
