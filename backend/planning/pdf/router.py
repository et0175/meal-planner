"""PDF export router — POST /plan/export/pdf."""

from __future__ import annotations

import logging
from datetime import date
from typing import Annotated, Any

from auth_middleware import verify_token
from db.engine import get_db
from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from mealplan.service import list_assignments
from pdf.service import generate_pdf
from sqlalchemy.ext.asyncio import AsyncSession

_log = logging.getLogger(__name__)

router = APIRouter(prefix="/plan/export", tags=["export"])


def _current_iso_week() -> str:
    iso = date.today().isocalendar()
    return f"{iso.year}-W{iso.week:02d}"


@router.post("/pdf")
async def export_pdf_route(
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
    week: str | None = Query(None, description="ISO week YYYY-WNN (e.g. 2026-W27), default current"),
) -> Response:
    """Generate and return a PDF of the week meal plan.

    FR-026 (AC-068, AC-069, NFR-004 < 3 s).
    EVT-018 emitted (logged).
    Empty week → generates empty-plan PDF (no error).
    """
    user_id: int = session["account_id"]
    resolved_week = week if week and week != "current" else _current_iso_week()

    assignments, _ = await list_assignments(db, user_id=user_id, week=resolved_week)
    pdf_bytes = generate_pdf(assignments, resolved_week)

    _log.info(
        "EVT-018 pdf_exported user=%d week=%s assignments=%d bytes=%d",
        user_id,
        resolved_week,
        len(assignments),
        len(pdf_bytes),
    )

    filename = f"meal-plan-{resolved_week}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
