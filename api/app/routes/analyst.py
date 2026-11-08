"""
FastAPI Routes for AI SOC Analyst
Exposes autonomous triage, 'Ask the Analyst', and incident correlation.
"""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import json
import asyncio


from ..database import get_db
from ..db_models import EventRecord, IncidentRecord
from ..models import Event, EventSource, EventSeverity
from ..connection_mgr import ws_manager
from ..audit import record_audit_entry
from knowledge.retriever import kb_retriever

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


class IncidentStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(ACTIVE|CONTAINED|RESOLVED)$", description="New incident status")
    operator_id: str = Field(default="SECURITY_OPERATOR", description="Identity of operator making update")
    notes: Optional[str] = Field(None, description="Operational notes regarding status change")



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


@router.post("/ask/stream", summary="Stream natural-language response from AI SOC Analyst via SSE")
async def ask_analyst_stream(payload: AskRequest, db: AsyncSession = Depends(get_db)):
    """Answer natural language security questions with Server-Sent Events (SSE) streaming."""
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

    full_answer = answer_dict.get("answer", "")
    citations = answer_dict.get("citations", [])
    ref_events = answer_dict.get("referenced_event_ids", [])
    provider = answer_dict.get("provider", "offline")
    lang = answer_dict.get("language", "en")

    async def event_generator():
        tokens = full_answer.split(" ")
        for i, token in enumerate(tokens):
            chunk = token + (" " if i < len(tokens) - 1 else "")
            payload_data = {"chunk": chunk, "done": False}
            yield f"data: {json.dumps(payload_data)}\n\n"
            await asyncio.sleep(0.015)

        final_data = {
            "chunk": "",
            "done": True,
            "question": payload.query,
            "answer": full_answer,
            "citations": citations,
            "referenced_event_ids": ref_events,
            "provider": provider,
            "language": lang
        }
        yield f"data: {json.dumps(final_data)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("/knowledge/{doc_id}", summary="Retrieve full MITRE ATT&CK technique or CVE document")
async def get_knowledge_doc(doc_id: str):
    """Retrieve full grounding document by technique or vulnerability ID (e.g., T1110.001, CVE-2023-38606)."""
    doc = kb_retriever.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Knowledge document '{doc_id}' not found"
        )
    return doc


@router.get("/incidents", summary="Get correlated multi-stage attack incidents")
async def list_incidents(
    limit: int = Query(100, ge=10, le=500),
    db: AsyncSession = Depends(get_db)
):
    """Correlate recent events into attack campaign chains with persistent lifecycle status."""
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

    correlated = correlation_agent.correlate_events(events)

    output_incidents = []
    for inc_data in correlated:
        inc_id = inc_data["incident_id"]
        ip = inc_data["source_ip"]

        rec_stmt = select(IncidentRecord).where(
            (IncidentRecord.incident_id == inc_id) | (IncidentRecord.source_ip == ip)
        )
        rec_result = await db.execute(rec_stmt)
        record = rec_result.scalar_one_or_none()

        if not record:
            record = IncidentRecord(
                incident_id=inc_id,
                source_ip=ip,
                severity=inc_data["severity"],
                status="ACTIVE",
                event_count=inc_data["event_count"],
                summary_en=inc_data["summary_en"],
                summary_bn=inc_data["summary_bn"],
                event_ids=[str(e.get("id")) for e in inc_data.get("events", [])]
            )
            db.add(record)
            await db.commit()
            await db.refresh(record)
        else:
            record.event_count = inc_data["event_count"]
            record.severity = inc_data["severity"]
            record.summary_en = inc_data["summary_en"]
            record.summary_bn = inc_data["summary_bn"]
            record.event_ids = [str(e.get("id")) for e in inc_data.get("events", [])]
            await db.commit()
            await db.refresh(record)

        inc_dict = dict(inc_data)
        inc_dict["incident_id"] = record.incident_id
        inc_dict["status"] = record.status
        output_incidents.append(inc_dict)

    return {
        "total_incidents": len(output_incidents),
        "incidents": output_incidents
    }


@router.patch("/incidents/{incident_id}/status", summary="Update incident lifecycle status (ACTIVE, CONTAINED, RESOLVED)")
async def update_incident_status(
    incident_id: str,
    payload: IncidentStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update incident containment/resolution status and log to audit trail."""
    stmt = select(IncidentRecord).where(IncidentRecord.incident_id == incident_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' not found"
        )

    old_status = record.status
    record.status = payload.status
    await db.commit()
    await db.refresh(record)

    # Log to immutable audit record
    await record_audit_entry(
        session=db,
        action_type="INCIDENT_STATUS_CHANGE",
        actor=payload.operator_id,
        model_used="HUMAN_OPERATOR",
        citations=[],
        verdict={
            "incident_id": incident_id,
            "old_status": old_status,
            "new_status": payload.status,
            "source_ip": record.source_ip,
            "notes": payload.notes or "Status updated via SOC console"
        },
        human_approved=True,
        operator_id=payload.operator_id
    )

    # Broadcast status change to consoles
    await ws_manager.broadcast({
        "type": "incident_status_changed",
        "incident_id": record.incident_id,
        "status": record.status,
        "operator_id": payload.operator_id
    })

    return {
        "incident_id": record.incident_id,
        "status": record.status,
        "source_ip": record.source_ip,
        "updated_at": record.updated_at.isoformat() if record.updated_at else ""
    }


