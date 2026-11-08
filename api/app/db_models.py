"""
SQLAlchemy ORM models for Prohori AI
Supports Postgres JSONB and SQLite JSON fallback seamlessly.
"""

from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import Column, String, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.types import JSON, TypeDecorator, CHAR
import uuid

from .database import Base


class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(36).
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(str(value)))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(str(value))
            return value


class CompatibleJSON(TypeDecorator):
    """Platform-independent JSON type.
    Uses PostgreSQL's JSONB, otherwise uses JSON.
    """
    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB())
        else:
            return dialect.type_descriptor(JSON())


class EventRecord(Base):
    __tablename__ = "events"

    id = Column(GUID(), primary_key=True, default=uuid4)
    ts = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    source = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    type = Column(String(100), nullable=False, index=True)
    details = Column(CompatibleJSON(), nullable=False, default=dict)
    analyst = Column(CompatibleJSON(), nullable=True)

    __table_args__ = (
        Index("ix_events_source_severity", "source", "severity"),
        Index("ix_events_ts_severity", "ts", "severity"),
    )

