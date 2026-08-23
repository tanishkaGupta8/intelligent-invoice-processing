from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config import settings
from app.database import engine, Base, get_db
import app.models  # Register SQLAlchemy models
from app.routers import invoices_router

# Initialize Database Tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database table initialization warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Invoice Processing & Semantic Search API powered by GenAI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(invoices_router)

@app.get("/")
def read_root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs"
    }

from sqlalchemy import text

@app.get("/health")
@app.get("/docs/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unreachable (start docker-compose)"

    return {
        "status": "healthy",
        "services": {
            "database": db_status,
            "qdrant": f"http://{settings.QDRANT_HOST}:{settings.QDRANT_PORT}",
            "azurite": f"http://127.0.0.1:10000"
        }
    }
