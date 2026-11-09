"""
SQLAlchemy ORM models for Prohori AI
Supports Postgres JSONB and SQLite JSON fallback seamlessly.
"""

import uuid
from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, Index, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.types import CHAR, JSON, TypeDecorator

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
    ts = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC), index=True)
    source = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    type = Column(String(100), nullable=False, index=True)
    details = Column(CompatibleJSON(), nullable=False, default=dict)
    analyst = Column(CompatibleJSON(), nullable=True)

    __table_args__ = (
        Index("ix_events_source_severity", "source", "severity"),
        Index("ix_events_ts_severity", "ts", "severity"),
    )


class IncidentRecord(Base):
    """Correlated attack campaigns with lifecycle states (ACTIVE, CONTAINED, RESOLVED)."""
    __tablename__ = "incidents"

    id = Column(GUID(), primary_key=True, default=uuid4)
    incident_id = Column(String(50), nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC), index=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
    source_ip = Column(String(100), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="ACTIVE", index=True)
    event_count = Column(Integer, nullable=False, default=0)
    summary_en = Column(String(1000), nullable=True)
    summary_bn = Column(String(1000), nullable=True)
    first_seen = Column(DateTime(timezone=True), nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    event_ids = Column(CompatibleJSON(), nullable=False, default=list)
    metadata_json = Column(CompatibleJSON(), nullable=True, default=dict)

    __table_args__ = (
        Index("ix_incidents_ip_status", "source_ip", "status"),
        Index("ix_incidents_severity_status", "severity", "status"),
    )


