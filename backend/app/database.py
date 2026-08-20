from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create SQLAlchemy Database Engine
# connect_args={"check_same_thread": False} is only for SQLite, PostgreSQL handles threads natively
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Create SessionLocal class factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy ORM models
Base = declarative_base()

# FastAPI Dependency to yield a database session per HTTP request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
