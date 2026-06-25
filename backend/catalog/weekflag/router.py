"""Week flag router — PUT /products/:id/week-flag."""

from __future__ import annotations

from typing import Annotated, Any

from auth_middleware import verify_token
from db.engine import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from weekflag.schemas import SetWeekFlagRequest, WeekFlagResponse
from weekflag.service import ProductNotFoundError, set_week_flag

router = APIRouter(prefix="/products", tags=["week-flags"])


@router.put("/{product_id}/week-flag", response_model=WeekFlagResponse)
async def set_week_flag_route(
    product_id: int,
    body: SetWeekFlagRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> WeekFlagResponse:
    """Set the week flag for a product for the current user.

    EVT-009: week flag updated.
    """
    user_id: int = session["account_id"]
    try:
        flag_row = await set_week_flag(db, product_id, user_id, body.flag)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return WeekFlagResponse(
        product_id=flag_row.product_id,
        user_id=flag_row.user_id,
        flag=flag_row.flag,
        updated_at=flag_row.updated_at,
    )
