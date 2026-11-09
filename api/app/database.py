"""
Database Engine & Async Session Management for Prohori AI
Automatically activates pgvector on Postgres and creates tables.
"""

import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text

from .config import settings

logger = logging.getLogger("prohori.db")

Base = declarative_base()

# Configure async engine
engine = create_async_engine(
    settings.async_database_url,
    echo=False,
    future=True,
    pool_pre_ping=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


async def init_db() -> None:
    """Initialize database schemas, extensions, and tables with automatic SQLite fallback."""
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            # If PostgreSQL, enable pgvector extension
            if conn.dialect.name == "postgresql":
                logger.info("Enabling pgvector extension on Postgres...")
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))

            # Create tables
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database schema initialized successfully.")
    except Exception as e:
        err_msg = str(e).lower()
        if "connection" in err_msg or "refused" in err_msg or "connect" in err_msg:
            logger.warning(f"PostgreSQL unreachable at {settings.DATABASE_URL}. Falling back gracefully to local SQLite: sqlite+aiosqlite:///prohori.db")
            engine = create_async_engine(
                "sqlite+aiosqlite:///prohori.db",
                echo=False,
                future=True
            )
            AsyncSessionLocal = async_sessionmaker(
                bind=engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autoflush=False
            )
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("SQLite database initialized successfully at prohori.db.")
        else:
            logger.error(f"Error initializing database: {e}")
            raise e



async def check_db_health() -> bool:
    """Check database connectivity."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")
        return False


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for obtaining async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

