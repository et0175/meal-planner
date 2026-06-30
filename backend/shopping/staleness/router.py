"""Staleness detection and refresh router.

POST /shopping/refresh — regenerate from stored dates, clear stale flag (FR-030, AC-075, AC-076)
POST /shopping/events/plan-changed — mark list stale on plan event (AC-103, AC-104, AC-105)

The /events/plan-changed endpoint is a stub for future event-bus integration.
In production it would be called by the Planning service when assignments change.
For the current implementation the frontend triggers it after plan mutations.
"""

from __future__ import annotations

import logging
from typing import Annotated, Any

from auth_middleware import verify_token
from db.engine import get_db
from fastapi import APIRouter, Depends, Request, status
from generator.schemas import PlanEventRequest, RefreshResponse, ShoppingListResponse
from generator.service import mark_list_stale, refresh_list
from generator.router import _build_response
from sqlalchemy.ext.asyncio import AsyncSession

_log = logging.getLogger(__name__)

router = APIRouter(prefix="/shopping", tags=["shopping"])


@router.post("/refresh", response_model=ShoppingListResponse, status_code=status.HTTP_200_OK)
async def refresh_shopping_list(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> ShoppingListResponse:
    """Regenerate the shopping list from the stored date range, clearing the stale flag.

    FR-030 (AC-075, AC-076): "Refresh" button regenerates list + clears staleness.
    EVT-021 emitted (logged).
    """
    user_id: int = session["account_id"]
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()

    shopping_list, items = await refresh_list(db, user_id=user_id, token=token)
    _log.info("EVT-021 shopping_list_refreshed user=%d", user_id)
    return _build_response(shopping_list, items)


@router.post(
    "/events/plan-changed",
    response_model=RefreshResponse,
    status_code=status.HTTP_200_OK,
)
async def plan_changed_event(
    body: PlanEventRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> RefreshResponse:
    """Mark the user's shopping list stale when a plan assignment changes.

    Stub for event-bus integration (EVT-012/013/014 — ADR-0003).
    POL-002, POL-003, POL-004, POL-005.
    INV-012: only marks stale if assignment_date falls within the list's range.
    EVT-023 emitted (logged) when stale.
    """
    user_id: int = session["account_id"]
    was_marked = await mark_list_stale(db, user_id=user_id, assignment_date=body.assignment_date)

    if was_marked:
        _log.info(
            "EVT-023 shopping_list_stale user=%d event=%s date=%s",
            user_id,
            body.event_type,
            body.assignment_date,
        )
        return RefreshResponse(detail="Shopping list marked stale")
    return RefreshResponse(detail="No active list in range — no action taken")
