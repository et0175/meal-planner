"""Week flag business logic — set/get flags, Monday rollover."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import cast

from db.models import Product, WeekFlag, WeekFlagEnum
from sqlalchemy import select, update
from sqlalchemy.engine import CursorResult
from sqlalchemy.ext.asyncio import AsyncSession


class ProductNotFoundError(Exception):
    """Raised when the target product does not exist."""


async def set_week_flag(
    db: AsyncSession,
    product_id: int,
    user_id: int,
    flag: WeekFlagEnum,
) -> WeekFlag:
    """Set or upsert a week flag for (product_id, user_id).

    EVT-009: flag updated.
    Raises ProductNotFoundError if the product doesn't exist or is deleted.
    """
    # Verify product exists and is not deleted
    prod_stmt = select(Product.id).where(
        Product.id == product_id, Product.is_deleted == False  # noqa: E712
    )
    prod_result = await db.execute(prod_stmt)
    if prod_result.scalar_one_or_none() is None:
        raise ProductNotFoundError(f"Product {product_id} not found")

    # Check for existing flag row
    stmt = select(WeekFlag).where(
        WeekFlag.product_id == product_id,
        WeekFlag.user_id == user_id,
    )
    flag_result = await db.execute(stmt)
    existing: WeekFlag | None = flag_result.scalar_one_or_none()

    now = datetime.now(tz=UTC)

    if existing is not None:
        await db.execute(
            update(WeekFlag)
            .where(WeekFlag.id == existing.id)
            .values(flag=flag, updated_at=now)
        )
        await db.commit()
        await db.refresh(existing)
        return existing

    new_flag = WeekFlag(
        product_id=product_id,
        user_id=user_id,
        flag=flag,
        updated_at=now,
    )
    db.add(new_flag)
    await db.commit()
    await db.refresh(new_flag)
    return new_flag


async def rollover_week_flags(db: AsyncSession) -> int:
    """Monday 00:00 rollover (ADR-0009).

    1. Promote next_week → this_week.
    2. Clear (set to 'none') any remaining this_week flags (from prior week).

    Returns the count of flags promoted.
    EVT-010.
    """
    now = datetime.now(tz=UTC)

    # Step 1: Promote next_week → this_week
    raw_result = await db.execute(
        update(WeekFlag)
        .where(WeekFlag.flag == WeekFlagEnum.next_week)
        .values(flag=WeekFlagEnum.this_week, updated_at=now)
    )
    cursor_result = cast(CursorResult[tuple[()]], raw_result)
    promoted_count: int = cursor_result.rowcount

    # Step 2: Clear old this_week flags that were NOT just promoted.
    # Rows updated in step 1 have updated_at == now; stale this_week rows have updated_at < now.
    await db.execute(
        update(WeekFlag)
        .where(WeekFlag.flag == WeekFlagEnum.this_week, WeekFlag.updated_at < now)
        .values(flag=WeekFlagEnum.none, updated_at=now)
    )

    await db.commit()
    return promoted_count
