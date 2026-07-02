"""Plan summary router — GET /plan/summary."""

from __future__ import annotations

from typing import Annotated, Any

from auth_middleware import verify_token
from db.engine import get_db
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from summary.schemas import PlanSummaryResponse
from summary.service import compute_summary

router = APIRouter(prefix="/plan/summary", tags=["summary"])


@router.get("", response_model=PlanSummaryResponse)
async def get_summary_route(
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
    week: str | None = Query(None, description="ISO week as YYYY-WNN (e.g. 2026-W27), or omit for current week"),
) -> PlanSummaryResponse:
    """Return aggregate weekly nutrition totals for the topbar widget.

    COMP-017, ADR-0004 (FR-021/FR-024, AC-058, AC-063).
    Sums only assignments that have inline nutrition data (kcal_per_unit, etc.).
    """
    user_id: int = session["account_id"]
    data = await compute_summary(db, user_id=user_id, week=week)
    return PlanSummaryResponse(**data)  # type: ignore[arg-type]
