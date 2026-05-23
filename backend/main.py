from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, get_engine
from routes import activities, reports, settings, tasks

app = FastAPI(title="Time Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=get_engine())

app.include_router(activities.router)
app.include_router(tasks.router)
app.include_router(reports.router)
app.include_router(settings.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
