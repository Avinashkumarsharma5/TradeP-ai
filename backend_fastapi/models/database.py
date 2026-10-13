"""
Database engine configuration and base declarative mapping.
Designed for PostgreSQL deployment with SQLAlchemy, with safe development fallbacks.
"""
from typing import Generator
import os

try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker, declarative_base

    DATABASE_URL = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./tradeai_dev.db"  # Default SQLite for local zero-dependency testing
    )

    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

except ImportError:
    # If SQLAlchemy is not installed in the current environment
    Base = object
    SessionLocal = None
    engine = None

    def get_db():
        yield None
