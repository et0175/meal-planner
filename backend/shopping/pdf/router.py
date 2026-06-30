"""PDF export router.

POST /shopping/export/pdf — generate PDF from current shopping list (FR-031, AC-077, AC-120).
NFR-004: must complete in < 3s.
"""

from __future__ import annotations

import logging
from typing import Annotated, Any

from auth_middleware import verify_token
from db.engine import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from generator.service import _get_existing_list, _get_list_items
from pdf.service import generate_pdf
from sqlalchemy.ext.asyncio import AsyncSession

_log = logging.getLogger(__name__)

router = APIRouter(prefix="/shopping", tags=["shopping"])


@router.post("/export/pdf")
async def export_pdf(
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> Response:
    """Generate a PDF of the current shopping list, grouped by category.

    FR-031 (AC-077): EVT-022 emitted, PDF returned.
    AC-120: empty list → empty-list PDF (no error).
    NFR-004: < 3s (pure in-memory reportlab).
    """
    user_id: int = session["account_id"]
    shopping_list = await _get_existing_list(db, user_id)
    if shopping_list is None:
        # No list generated yet — return an empty-range PDF
        from datetime import date
        today = date.today().isoformat()
        pdf_bytes = generate_pdf([], today, today)
        _log.info("EVT-022 shopping_pdf_exported user=%d items=0", user_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="shopping-list.pdf"',
            },
        )

    items = await _get_list_items(db, shopping_list.id)
    pdf_bytes = generate_pdf(
        items,
        shopping_list.from_date.isoformat(),
        shopping_list.to_date.isoformat(),
    )
    _log.info("EVT-022 shopping_pdf_exported user=%d items=%d", user_id, len(items))
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="shopping-list.pdf"',
        },
    )
