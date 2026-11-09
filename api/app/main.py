"""
Prohori AI - Event Ingestion & Streaming API
Defensive Security Operations Center Event Bus
"""

import logging
import sys
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path
from uuid import UUID

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

# Ensure project root is available for sensor imports
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from analyst.agents.advisor import response_advisor
from analyst.agents.triage import triage_agent
from knowledge.retriever import kb_retriever

from .audit import record_audit_entry
from .config import settings
from .connection_mgr import ws_manager
from .database import AsyncSessionLocal, check_db_health, get_db, init_db
from .db_models import EventRecord
from .models import (
    Event,
    EventCreate,
    EventListResponse,
    EventSeverity,
    EventSource,
)
from .routes.analyst import router as analyst_router
from .routes.docs import router as docs_router
from .routes.sovereignty import router as sovereignty_router

try:
    from sensors.ratelimiter.limiter import default_limiter
    from sensors.ratelimiter.middleware import RateLimitMiddleware
    HAS_RATE_LIMITER = True
except ImportError:
    HAS_RATE_LIMITER = False



logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("prohori.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager to initialize DB on startup."""
    logger.info("Initializing Prohori Event API...")
    try:
        await init_db()
    except Exception as e:
        logger.warning(f"Initial DB connection could not be established: {e}. Will retry on requests.")
    yield
    logger.info("Shutting down Prohori Event API...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Defensive AI-native Security Operations Center Event Bus",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def on_rate_limit_block(event_data: dict):
    """Direct persistence and broadcast when RateLimitMiddleware triggers on API."""
    try:
        async with AsyncSessionLocal() as session:
            record = EventRecord(
                source=event_data["source"],
                severity=event_data["severity"],
                type=event_data["type"],
                details=event_data["details"],
                analyst=None
            )
            session.add(record)
            await session.commit()
            await session.refresh(record)

            event_out = Event(
                id=record.id,
                ts=record.ts,
                source=EventSource(record.source),
                severity=EventSeverity(record.severity),
                type=record.type,
                details=record.details or {},
                analyst=None
            )
            await ws_manager.broadcast({
                "type": "new_event",
                "event": event_out.model_dump(mode="json")
            })
            logger.info(f"API RateLimiter blocked request from {event_data['details'].get('source_ip')} and broadcasted event.")
    except Exception as e:
        logger.warning(f"Error persisting rate limit event: {e}")


# Attach API Abuse Guard middleware if available
if HAS_RATE_LIMITER:
    app.add_middleware(
        RateLimitMiddleware,
        limiter=default_limiter,
        event_callback=on_rate_limit_block,
        exempt_paths=["/healthz", "/docs", "/openapi.json", "/stream"]
    )




# Include Analyst, Sovereignty & Docs Routes
app.include_router(analyst_router)
app.include_router(sovereignty_router)
app.include_router(docs_router)




@app.get("/healthz", summary="Health check")
async def healthz():
    """Health check endpoint indicating API and DB status."""
    db_ok = await check_db_health()
    return {
        "status": "healthy" if db_ok else "degraded",
        "timestamp": datetime.now(UTC).isoformat(),
        "database": "connected" if db_ok else "unreachable",
        "version": settings.APP_VERSION
    }


@app.get("/knowledge/{doc_id}", tags=["Knowledge Base Grounding"])
async def get_root_knowledge_doc(doc_id: str):
    """Retrieve full grounding document by technique or vulnerability ID (e.g. T1110.001, CVE-2023-38606)."""
    doc = kb_retriever.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found")
    return doc



@app.post(
    "/events",
    response_model=Event,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest a new security event"
)
async def ingest_event(
    event_in: EventCreate,
    db: AsyncSession = Depends(get_db)
):
    """Ingest a security event from a sensor, execute autonomous AI triage with RAG,

    persist to Postgres, and broadcast to connected WebSocket listeners.
    """
    analyst_payload = event_in.analyst
    severity_val = event_in.severity.value

    # Auto-run AI SOC Analyst triage on ingest if not already enriched
    if analyst_payload is None and event_in.source != EventSource.ANALYST:
        try:
            raw_event_dict = {
                "source": event_in.source.value,
                "severity": event_in.severity.value,
                "type": event_in.type,
                "details": event_in.details
            }
            triage_result = await triage_agent.triage_event(raw_event_dict)
            recommendations = response_advisor.recommend_actions(raw_event_dict)
            triage_result["recommendations"] = recommendations
            analyst_payload = triage_result

            # Reconcile severity if analyst upgraded it
            if triage_result.get("severity"):
                severity_val = triage_result["severity"]

            # Record in immutable audit trail
            try:
                await record_audit_entry(
                    session=db,
                    action_type="AI_TRIAGE_PERFORMED",
                    actor="AI_SOC_ANALYST",
                    model_used=triage_result.get("provider", "local-rag"),
                    verdict={
                        "summary_en": triage_result.get("narrative_en"),
                        "severity": severity_val,
                        "mitre": triage_result.get("mitre_technique")
                    },
                    input_event_id=event_in.id,
                    citations=triage_result.get("citations", []),
                    human_approved=False
                )
            except Exception as audit_err:
                logger.warning(f"Failed to record audit entry: {audit_err}")
        except Exception as e:
            logger.warning(f"Auto-triage on ingest skipped due to error: {e}")


    record = EventRecord(
        id=event_in.id,
        ts=event_in.ts,
        source=event_in.source.value,
        severity=severity_val,
        type=event_in.type,
        details=event_in.details,
        analyst=analyst_payload
    )

    db.add(record)
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

    # Broadcast to live WebSocket clients
    event_dict = event_out.model_dump(mode="json")
    await ws_manager.broadcast({
        "type": "new_event",
        "event": event_dict
    })

    return event_out


@app.get(
    "/events",
    response_model=EventListResponse,
    summary="List and filter security events"
)
async def list_events(
    source: EventSource | None = Query(None, description="Filter by event source"),
    severity: EventSeverity | None = Query(None, description="Filter by severity level"),
    event_type: str | None = Query(None, alias="type", description="Filter by event type"),
    start_time: datetime | None = Query(None, description="Filter events ts >= start_time (ISO 8601)"),
    end_time: datetime | None = Query(None, description="Filter events ts <= end_time (ISO 8601)"),
    limit: int = Query(50, ge=1, le=500, description="Page limit"),
    offset: int = Query(0, ge=0, description="Page offset"),
    db: AsyncSession = Depends(get_db)
):
    """Query and filter paginated events from Postgres."""
    # Build query
    query = select(EventRecord)

    if source:
        query = query.where(EventRecord.source == source.value)
    if severity:
        query = query.where(EventRecord.severity == severity.value)
    if event_type:
        query = query.where(EventRecord.type == event_type)
    if start_time:
        query = query.where(EventRecord.ts >= start_time)
    if end_time:
        query = query.where(EventRecord.ts <= end_time)

    # Count total matching
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Retrieve paginated items ordered newest first
    items_query = query.order_by(desc(EventRecord.ts)).limit(limit).offset(offset)
    result = await db.execute(items_query)
    records = result.scalars().all()

    events = [
        Event(
            id=rec.id,
            ts=rec.ts,
            source=EventSource(rec.source),
            severity=EventSeverity(rec.severity),
            type=rec.type,
            details=rec.details or {},
            analyst=rec.analyst
        )
        for rec in records
    ]

    return EventListResponse(
        total=total,
        limit=limit,
        offset=offset,
        events=events
    )


@app.get(
    "/events/{event_id}",
    response_model=Event,
    summary="Retrieve a single event by UUID"
)
async def get_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Fetch event details by ID."""
    stmt = select(EventRecord).where(EventRecord.id == event_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{event_id}' not found"
        )

    return Event(
        id=record.id,
        ts=record.ts,
        source=EventSource(record.source),
        severity=EventSeverity(record.severity),
        type=record.type,
        details=record.details or {},
        analyst=record.analyst
    )


@app.websocket("/stream")
async def event_stream(websocket: WebSocket):
    """WebSocket endpoint broadcasting newly ingested events in real-time."""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; client can send pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.debug(f"WebSocket client error: {e}")
        ws_manager.disconnect(websocket)

