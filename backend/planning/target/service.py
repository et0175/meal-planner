"""Nutrition target business logic — GET and upsert per-user daily targets."""

from __future__ import annotations

from db.models import NutritionTarget
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_target(db: AsyncSession, user_id: int) -> NutritionTarget | None:
    """Return the nutrition target for a user, or None if not set.

    INV-014: targets are user-scoped — always filter by user_id.
    """
    stmt = select(NutritionTarget).where(NutritionTarget.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def upsert_target(
    db: AsyncSession,
    *,
    user_id: int,
    target_calories: float,
    protein_g: float,
    fat_g: float,
    carbs_g: float,
) -> NutritionTarget:
    """Create or replace the nutrition target for a user.

    INV-013: target_calories >= 0 is enforced in Pydantic before reaching this layer.
    INV-014: exactly one target per user (UPSERT by user_id).
    """
    existing = await get_target(db, user_id)
    if existing is not None:
        existing.target_calories = target_calories
        existing.protein_g = protein_g
        existing.fat_g = fat_g
        existing.carbs_g = carbs_g
        await db.commit()
        await db.refresh(existing)
        return existing

    target = NutritionTarget(
        user_id=user_id,
        target_calories=target_calories,
        protein_g=protein_g,
        fat_g=fat_g,
        carbs_g=carbs_g,
    )
    db.add(target)
    await db.commit()
    await db.refresh(target)
    return target
