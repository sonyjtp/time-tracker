from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool

DATABASE_URL = "postgresql+psycopg://timetracker:timetracker_password@localhost:5433/timetracker_db"

Base = declarative_base()

engine = None
SessionLocal = None


def get_engine():
    global engine
    if engine is None:
        engine = create_engine(DATABASE_URL, poolclass=NullPool, echo=False)
    return engine


def get_session():
    global SessionLocal
    if SessionLocal is None:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return SessionLocal()


def get_db():
    db = get_session()
    try:
        yield db
    finally:
        db.close()
