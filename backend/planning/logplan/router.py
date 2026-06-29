"""Log-from-plan router — POST /plan/log/day, /plan/log/week, /plan/log/item."""

from __future__ import annotations

import logging
from typing import Annotated, Any

from auth_middleware import verify_token
from db.engine import get_db
from fastapi import APIRouter, Depends
from logplan.schemas import LogDayRequest, LogItemRequest, LogResponse, LogWeekRequest
from logplan.service import log_day, log_item, log_week
from sqlalchemy.ext.asyncio import AsyncSession

_log = logging.getLogger(__name__)

router = APIRouter(prefix="/plan/log", tags=["log"])


@router.post("/day", response_model=LogResponse, status_code=201)
async def log_day_route(
    body: LogDayRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> LogResponse:
    """Log all assignments for a day as TrackingEntries.

    FR-025 (AC-065, AC-118): empty day → 0 entries (no error).
    EVT-015 emitted (logged).
    """
    user_id: int = session["account_id"]
    count = await log_day(db, user_id=user_id, log_date=body.date)
    _log.info("EVT-015 log_day user=%d date=%s entries=%d", user_id, body.date, count)
    return LogResponse(
        entries_created=count,
        detail=f"Logged {count} entries for {body.date}",
    )


@router.post("/week", response_model=LogResponse, status_code=201)
async def log_week_route(
    body: LogWeekRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> LogResponse:
    """Log all assignments for a week as TrackingEntries.

    FR-025 (AC-066).
    EVT-016 emitted (logged).
    """
    user_id: int = session["account_id"]
    count = await log_week(db, user_id=user_id, week=body.week)
    _log.info("EVT-016 log_week user=%d week=%s entries=%d", user_id, body.week, count)
    return LogResponse(
        entries_created=count,
        detail=f"Logged {count} entries for week {body.week}",
    )


@router.post("/item", response_model=LogResponse, status_code=201)
async def log_item_route(
    body: LogItemRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> LogResponse:
    """Log a single assignment as a TrackingEntry.

    FR-025 (AC-067).
    EVT-017 emitted (logged).
    """
    user_id: int = session["account_id"]
    count = await log_item(db, user_id=user_id, assignment_id=body.assignment_id)
    _log.info(
        "EVT-017 log_item user=%d assignment=%d entries=%d",
        user_id,
        body.assignment_id,
        count,
    )
    return LogResponse(
        entries_created=count,
        detail=f"Logged {count} entry from assignment {body.assignment_id}",
    )
