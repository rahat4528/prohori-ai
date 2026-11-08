"""
FastAPI Routes for AI SOC Analyst
Exposes autonomous triage, 'Ask the Analyst', and incident correlation.
"""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from ..database import get_db
from ..db_models import EventRecord
from ..models import Event, EventSource, EventSeverity
from ..connection_mgr import ws_manager

from analyst.agents.triage import triage_agent
from analyst.agents.correlation import correlation_agent
from analyst.agents.advisor import response_advisor
from analyst.ask import analyst_assistant

router = APIRouter(prefix="/analyst", tags=["AI SOC Analyst"])


class AskRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500, description="Free-text operator question")
    language: Optional[str] = Field(None, description="'en' for English, 'bn' for Bangla")


class AskResponse(BaseModel):
    question: str
    answer: str
    language: str
    citations: List[str]
    referenced_event_ids: List[str]
    provider: str


@router.post("/triage/{event_id}", response_model=Event, summary="Trigger autonomous AI triage on an event")
async def trigger_triage(event_id: UUID, db: AsyncSession = Depends(get_db)):
    """Analyze a specific event using RAG grounding over MITRE ATT&CK & CVEs.

    Writes bilingual incident narrative and recommendations back to the event.
    """
    stmt = select(EventRecord).where(EventRecord.id == event_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    event_dict = {
        "id": str(record.id),
        "ts": record.ts.isoformat() if record.ts else "",
        "source": record.source,
        "severity": record.severity,
        "type": record.type,
        "details": record.details or {},
        "analyst": record.analyst
    }

    # Execute autonomous triage
    triage_result = await triage_agent.triage_event(event_dict)

    # Attach response recommendations
    recommendations = response_advisor.recommend_actions(event_dict)
    triage_result["recommendations"] = recommendations

    # Persist enrichment back into event record
    record.analyst = triage_result
    # Reconcile severity if analyst upgraded it
    if triage_result.get("severity"):
        record.severity = triage_result["severity"]

    await db.commit()
    await db.refresh(record)

    event_out = Event(
        id=record.id,
        ts=record.ts,
        source=EventSource(record.source),
        severity=EventSeverity(record.severity),
        type=record.type,
        details=record.details or {},
        analyst=record.analyst
    )

    # Broadcast updated enrichment to active WebSocket consoles
    await ws_manager.broadcast({
        "type": "event_enriched",
        "event": event_out.model_dump(mode="json")
    })

    return event_out


@router.post("/ask", response_model=AskResponse, summary="Ask the AI SOC Analyst a natural-language question")
async def ask_analyst(payload: AskRequest, db: AsyncSession = Depends(get_db)):
    """Answer natural language security questions grounded in recent telemetry and MITRE ATT&CK.

    Supports English and Bangla.
    """
    # Fetch 10 most recent events for context
    stmt = select(EventRecord).order_by(desc(EventRecord.ts)).limit(10)
    result = await db.execute(stmt)
    records = result.scalars().all()

    recent_events = [
        {
            "id": str(r.id),
            "ts": r.ts.isoformat() if r.ts else "",
            "source": r.source,
            "severity": r.severity,
            "type": r.type,
            "details": r.details or {}
        }
        for r in records
    ]

    answer_dict = await analyst_assistant.answer_question(
        question=payload.query,
        recent_events=recent_events,
        language_override=payload.language
    )

    return AskResponse(**answer_dict)


@router.get("/incidents", summary="Get correlated multi-stage attack incidents")
async def list_incidents(
    limit: int = Query(100, ge=10, le=500),
    db: AsyncSession = Depends(get_db)
):
    """Correlate recent events into attack campaign chains with bilingual summaries."""
    stmt = select(EventRecord).order_by(desc(EventRecord.ts)).limit(limit)
    result = await db.execute(stmt)
    records = result.scalars().all()

    events = [
        {
            "id": str(r.id),
            "ts": r.ts.isoformat() if r.ts else "",
            "source": r.source,
            "severity": r.severity,
            "type": r.type,
            "details": r.details or {},
            "analyst": r.analyst
        }
        for r in records
    ]

    incidents = correlation_agent.correlate_events(events)
    return {
        "total_incidents": len(incidents),
        "incidents": incidents
    }

