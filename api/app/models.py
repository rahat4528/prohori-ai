"""
Shared Event Schema for Prohori AI
Single source of truth imported by all sensors, API endpoints, and agents.
"""

from datetime import UTC, datetime
from enum import Enum
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class EventSource(str, Enum):
    SCANNER = "scanner"
    HONEYPOT = "honeypot"
    RATELIMITER = "ratelimiter"
    ANALYST = "analyst"


class EventSeverity(str, Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EventCreate(BaseModel):
    """Payload accepted when creating/ingesting an event."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID = Field(default_factory=uuid4, description="Unique UUID for this event")
    ts: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="Event timestamp in UTC (ISO 8601)"
    )
    source: EventSource = Field(..., description="Sensor or subsystem generating the event")
    severity: EventSeverity = Field(..., description="Initial severity assessment")
    type: str = Field(..., min_length=1, max_length=100, description="Specific event classification")
    details: dict[str, Any] = Field(default_factory=dict, description="Raw metadata and context payload (JSONB)")
    analyst: dict[str, Any] | None = Field(
        default=None,
        description="Analyst enrichment, triage summary, citations, or recommendations (JSONB)"
    )


class Event(EventCreate):
    """Full persisted event model with identity and timestamp guaranteed."""


class EventFilter(BaseModel):
    """Query filters for event listing."""
    source: EventSource | None = None
    severity: EventSeverity | None = None
    type: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    limit: int = Field(default=50, ge=1, le=500)
    offset: int = Field(default=0, ge=0)


class EventListResponse(BaseModel):
    """Paginated list of events."""
    total: int
    limit: int
    offset: int
    events: list[Event]

