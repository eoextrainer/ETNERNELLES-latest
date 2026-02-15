"""
Database configuration and initialization
"""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[3]
load_dotenv(dotenv_path=ROOT_DIR / ".env", override=True)

# Get database URL from environment or use SQLite as default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kcd.db")

if DATABASE_URL.startswith("sqlite:///./"):
    relative_path = DATABASE_URL.replace("sqlite:///./", "")
    DATABASE_URL = f"sqlite:///{(ROOT_DIR / relative_path).as_posix()}"

# Create engine with fallback to SQLite
try:
    # Try the configured database first
    if "sqlite" in DATABASE_URL:
        # SQLite configuration
        connect_args = {"check_same_thread": False}
        if DATABASE_URL.endswith(":memory:"):
            engine = create_engine(
                DATABASE_URL,
                connect_args=connect_args,
                poolclass=StaticPool,
            )
        else:
            engine = create_engine(
                DATABASE_URL,
                connect_args=connect_args,
            )
    else:
        # PostgreSQL or other database configuration
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            pass  # Just testing the connection
except (OperationalError, Exception) as e:
    # Fall back to SQLite if connection fails
    print(f"Warning: Could not connect to {DATABASE_URL}")
    print(f"Error: {e}")
    print("Falling back to SQLite...")
    DATABASE_URL = "sqlite:///./kcd.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    from app.models.user import Base
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
