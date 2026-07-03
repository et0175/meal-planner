"""Week flag router — PUT /products/:id/week-flag."""

from __future__ import annotations

from typing import Annotated, Any

from auth_middleware import verify_token
from authoring.schemas import ProductResponse
from db.engine import get_db
from db.models import Product
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from weekflag.schemas import SetWeekFlagRequest
from weekflag.service import ProductNotFoundError, set_week_flag

router = APIRouter(prefix="/products", tags=["week-flags"])


@router.put("/{product_id}/week-flag", response_model=ProductResponse)
async def set_week_flag_route(
    product_id: int,
    body: SetWeekFlagRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> ProductResponse:
    """Set the week flag for a product for the current user.

    Returns the updated product with eager-loaded relationships.
    EVT-009: week flag updated.
    """
    user_id: int = session["account_id"]
    try:
        await set_week_flag(db, product_id, user_id, body.flag)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    # Return the full product with eager-loaded relationships
    stmt = (
        select(Product)
        .options(selectinload(Product.nutrition), selectinload(Product.units))
        .where(Product.id == product_id)
    )
    result = await db.execute(stmt)
    product = result.scalar_one()
    return ProductResponse.model_validate(product)
