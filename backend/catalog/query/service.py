"""Product query business logic — list and detail reads."""

from __future__ import annotations

from typing import Literal

from db.models import NutritionPer100g, Product, WeekFlag, WeekFlagEnum
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload


async def list_products(
    db: AsyncSession,
    *,
    category: str | None = None,
    diet_tag: str | None = None,
    search: str | None = None,
    sort_by: Literal["name", "category", "protein", "calories"] = "name",
    sort_dir: Literal["asc", "desc"] = "asc",
    week_flag: WeekFlagEnum | None = None,
    user_id: int | None = None,
) -> list[Product]:
    """Return non-deleted products with optional filters and sorting.

    Supports week_flag filter for ADR-0002 (Planning service integration).
    """
    stmt = (
        select(Product)
        .options(selectinload(Product.nutrition))
        .where(Product.is_deleted == False)  # noqa: E712
    )

    # Optional filters
    if category:
        stmt = stmt.where(Product.category == category)

    if diet_tag:
        # JSON contains filter — portable across SQLite and PostgreSQL for string arrays
        stmt = stmt.where(Product.diet_tags.contains(diet_tag))

    if search:
        stmt = stmt.where(Product.name.ilike(f"%{search}%"))

    # Week flag filter (ADR-0002): only return products with the given flag for this user
    if week_flag is not None and user_id is not None:
        stmt = stmt.join(
            WeekFlag,
            (WeekFlag.product_id == Product.id) & (WeekFlag.user_id == user_id),
        ).where(WeekFlag.flag == week_flag)

    # Sorting
    if sort_by == "protein":
        order_col = NutritionPer100g.protein_g
        stmt = stmt.outerjoin(NutritionPer100g, NutritionPer100g.product_id == Product.id)
        if sort_dir == "desc":
            stmt = stmt.order_by(order_col.desc().nulls_last())
        else:
            stmt = stmt.order_by(order_col.asc().nulls_last())
    elif sort_by == "calories":
        order_col = NutritionPer100g.calories
        stmt = stmt.outerjoin(NutritionPer100g, NutritionPer100g.product_id == Product.id)
        if sort_dir == "desc":
            stmt = stmt.order_by(order_col.desc().nulls_last())
        else:
            stmt = stmt.order_by(order_col.asc().nulls_last())
    elif sort_by == "category":
        if sort_dir == "desc":
            stmt = stmt.order_by(Product.category.desc())
        else:
            stmt = stmt.order_by(Product.category.asc())
    else:
        # Default: name
        if sort_dir == "desc":
            stmt = stmt.order_by(Product.name.desc())
        else:
            stmt = stmt.order_by(Product.name.asc())

    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_product(db: AsyncSession, product_id: int) -> Product | None:
    """Return a single non-deleted product by ID, with units and nutrition loaded."""
    stmt = (
        select(Product)
        .options(
            selectinload(Product.nutrition),
            selectinload(Product.units),
        )
        .where(Product.id == product_id, Product.is_deleted == False)  # noqa: E712
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def count_user_products(db: AsyncSession, owner_id: int) -> int:
    """Count non-deleted products owned by a specific user."""
    stmt = select(func.count(Product.id)).where(
        Product.owner_id == owner_id,
        Product.is_deleted == False,  # noqa: E712
    )
    result = await db.execute(stmt)
    return result.scalar_one()
