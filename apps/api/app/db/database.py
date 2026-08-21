import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings
from app.db.base import Base

# Import all models here so that Base.metadata knows about them for create_all
import app.models.user  # noqa: F401
import app.models.document  # noqa: F401
import app.models.record  # noqa: F401
import app.models.validation  # noqa: F401

logger = logging.getLogger(__name__)

# Create SQLAlchemy engine with connection pooling and pre-ping
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=(settings.ENVIRONMENT == "development")
)

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
        logger.warning(f"Database table initialization warning (may retry when DB is up): {e}")
