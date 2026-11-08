"""
Shared Event Schema for Prohori AI
Single source of truth imported by all sensors, API endpoints, and agents.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, ConfigDict


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
        default_factory=lambda: datetime.now(timezone.utc),
        description="Event timestamp in UTC (ISO 8601)"
    )
    source: EventSource = Field(..., description="Sensor or subsystem generating the event")
    severity: EventSeverity = Field(..., description="Initial severity assessment")
    type: str = Field(..., min_length=1, max_length=100, description="Specific event classification")
    details: Dict[str, Any] = Field(default_factory=dict, description="Raw metadata and context payload (JSONB)")
    analyst: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Analyst enrichment, triage summary, citations, or recommendations (JSONB)"
    )


class Event(EventCreate):
    """Full persisted event model with identity and timestamp guaranteed."""
    pass


class EventFilter(BaseModel):
    """Query filters for event listing."""
    source: Optional[EventSource] = None
    severity: Optional[EventSeverity] = None
    type: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    limit: int = Field(default=50, ge=1, le=500)
    offset: int = Field(default=0, ge=0)


class EventListResponse(BaseModel):
    """Paginated list of events."""
    total: int
    limit: int
    offset: int
    events: list[Event]
