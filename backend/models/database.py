"""
Database session and connection engine for SQLAlchemy paper trading models.
Supports PostgreSQL (production/CloudSQL) and SQLite (local development/testing).
"""
import os
from typing import Generator

try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import declarative_base, sessionmaker

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "sqlite:///./tradeai_paper_trading.db"
    )

    connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

    def get_db() -> Generator:
        """Dependency for obtaining database sessions."""
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

except ImportError:
    # Safe shim when running in environments without SQLAlchemy installed
    class _MockBase:
        metadata = None

        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

    Base = _MockBase  # type: ignore
    SessionLocal = None  # type: ignore
    engine = None  # type: ignore

    def get_db():
        yield None
