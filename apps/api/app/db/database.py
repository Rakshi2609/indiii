import logging
import os
from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.db.base import Base

# Import all models here so that Base.metadata knows about them for create_all
import app.models.user  # noqa: F401
import app.models.document  # noqa: F401
import app.models.record  # noqa: F401
import app.models.validation  # noqa: F401
import app.models.audit  # noqa: F401
import app.models.parcel  # noqa: F401

logger = logging.getLogger(__name__)


def build_engine():
    """Build resilient SQLAlchemy engine with PostgreSQL or automatic SQLite fallback."""
    if settings.DATABASE_URL and not settings.DATABASE_URL.startswith("sqlite"):
        try:
            pg_eng = create_engine(
                settings.DATABASE_URL,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 3},
                echo=False
            )
            with pg_eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected to primary PostgreSQL database.")
            return pg_eng
        except Exception as e:
            logger.warning(f"PostgreSQL connection unavailable ({e}). Falling back to embedded SQLite database.")

    # Resilient SQLite database
    data_dir = Path("./data")
    data_dir.mkdir(parents=True, exist_ok=True)
    sqlite_url = "sqlite:///./data/land_ai.db"
    return create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False
    )


engine = build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(target_engine=None) -> None:
    """Initialize database tables on application startup."""
    target = target_engine or engine
    try:
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=target)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning(f"Database table initialization warning: {e}")
