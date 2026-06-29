"""Nutrition target router — GET /plan/target, PUT /plan/target."""

from __future__ import annotations

import logging
from typing import Annotated, Any

from auth_middleware import verify_token
from db.engine import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from target.schemas import NutritionTargetRequest, NutritionTargetResponse
from target.service import get_target, upsert_target

_log = logging.getLogger(__name__)

router = APIRouter(prefix="/plan/target", tags=["target"])


@router.get("", response_model=NutritionTargetResponse)
async def get_target_route(
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> NutritionTargetResponse:
    """Return the authenticated user's daily nutrition target.

    FR-024 (AC-063, AC-064): if no target is set → 404.
    INV-014: targets are user-scoped.
    """
    user_id: int = session["account_id"]
    target = await get_target(db, user_id)
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No nutrition target set",
        )
    return NutritionTargetResponse.model_validate(target)


@router.put("", response_model=NutritionTargetResponse)
async def put_target_route(
    body: NutritionTargetRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> NutritionTargetResponse:
    """Create or replace the authenticated user's daily nutrition target.

    FR-024 (AC-106): target_calories < 0 → 422 (INV-013, enforced by Pydantic).
    INV-014: exactly one target per user (UPSERT).
    """
    user_id: int = session["account_id"]
    target = await upsert_target(
        db,
        user_id=user_id,
        target_calories=body.target_calories,
        protein_g=body.protein_g,
        fat_g=body.fat_g,
        carbs_g=body.carbs_g,
    )
    _log.info("target_upserted user=%d kcal=%.0f", user_id, body.target_calories)
    return NutritionTargetResponse.model_validate(target)
