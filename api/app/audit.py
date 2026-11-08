"""
Prohori AI - Append-Only Immutable Security Audit Log
Records every AI Analyst reasoning step, RAG retrieval citation, and Human-in-the-Loop decision.
Essential for regulatory compliance, data sovereignty, and responsible AI auditability.
"""

from datetime import datetime, timezone
import logging
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4

from sqlalchemy import Column, String, DateTime, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.sql import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from .database import Base
from .db_models import GUID, CompatibleJSON

logger = logging.getLogger("prohori.audit")


class AuditRecordModel(Base):
    """Immutable, append-only database record of AI and Operator actions."""
    __tablename__ = "audit_logs"

    id = Column(GUID(), primary_key=True, default=uuid4)
    ts = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    action_type = Column(String(50), nullable=False, index=True)
    actor = Column(String(50), nullable=False, default="AI_ANALYST")
    input_event_id = Column(GUID(), nullable=True, index=True)
    model_used = Column(String(100), nullable=False)
    citations = Column(CompatibleJSON(), nullable=True)
    verdict = Column(CompatibleJSON(), nullable=False)
    human_approved = Column(Boolean(), nullable=False, default=False)
    operator_id = Column(String(100), nullable=True)

    __table_args__ = (
        Index("ix_audit_ts_action", "ts", "action_type"),
    )


class AuditEntryCreate(BaseModel):
    action_type: str
    actor: str = "AI_ANALYST"
    input_event_id: Optional[UUID] = None
    model_used: str
    citations: List[str] = Field(default_factory=list)
    verdict: Dict[str, Any]
    human_approved: bool = False
    operator_id: Optional[str] = None


class AuditEntryResponse(BaseModel):
    id: UUID
    ts: datetime
    action_type: str
    actor: str
    input_event_id: Optional[UUID] = None
    model_used: str
    citations: Optional[List[str]] = None
    verdict: Dict[str, Any]
    human_approved: bool
    operator_id: Optional[str] = None


async def record_audit_entry(
    session: AsyncSession,
    action_type: str,
    actor: str,
    model_used: str,
    verdict: Dict[str, Any],
    input_event_id: Optional[UUID] = None,
    citations: Optional[List[str]] = None,
    human_approved: bool = False,
    operator_id: Optional[str] = None
) -> AuditRecordModel:
    """Append a new verified entry to the audit log."""
    entry = AuditRecordModel(
        id=uuid4(),
        ts=datetime.now(timezone.utc),
        action_type=action_type,
        actor=actor,
        input_event_id=input_event_id,
        model_used=model_used,
        citations=citations or [],
        verdict=verdict,
        human_approved=human_approved,
        operator_id=operator_id
    )
    session.add(entry)
    await session.commit()
    await session.refresh(entry)
    logger.info(f"AUDIT LOGGED: [{action_type}] by {actor} (Model: {model_used})")
    return entry
