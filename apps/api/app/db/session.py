# Alias for backwards compatibility
from app.db.database import engine, SessionLocal, get_db, init_db

__all__ = ["engine", "SessionLocal", "get_db", "init_db"]
