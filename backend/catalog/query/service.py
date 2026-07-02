"""Product query business logic — list and detail reads.

Localization (FR-037, ADR-0012): reads resolve the product name to the caller's
requested locale via a LEFT JOIN on `product_translations`, falling back to the
canonical `products.name` (English default) when that locale has no row. The
resolved name is what is searched, sorted, and returned.
"""

from __future__ import annotations

from typing import Literal

from db.models import NutritionPer100g, Product, ProductTranslation, WeekFlag, WeekFlagEnum
from fastapi import HTTPException, status
from sqlalchemy import Select, and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.elements import ColumnElement

DEFAULT_LOCALE = "en"
_MAX_LIMIT = 200


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
    locale: str = DEFAULT_LOCALE,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[tuple[Product, str]], int]:
    """Return a page of non-deleted products plus the total matching count.

    Each item is `(product, resolved_name)` where `resolved_name` is the name in
    `locale` (or the English fallback). `total` is the full filtered count, not the
    page size — required for correct pagination at 10k products per language.

    Supports the week_flag filter for ADR-0002 (Planning service integration).
    """
    limit = max(1, min(limit, _MAX_LIMIT))
    offset = max(0, offset)

    # Resolved name = the locale translation if present, else the canonical name.
    resolved_name: ColumnElement[str] = func.coalesce(ProductTranslation.name, Product.name)

    def apply_filters(stmt: Select) -> Select:  # type: ignore[type-arg]
        stmt = stmt.outerjoin(
            ProductTranslation,
            (ProductTranslation.product_id == Product.id)
            & (ProductTranslation.locale == locale),
        ).where(Product.is_deleted == False)  # noqa: E712
        if category:
            stmt = stmt.where(Product.category == category)
        if diet_tag:
            # JSON contains filter — portable across SQLite and PostgreSQL for string arrays
            stmt = stmt.where(Product.diet_tags.contains(diet_tag))
        if search:
            pattern = f"%{search}%"
            # Search each column directly rather than COALESCE(t.name, p.name) so the
            # per-column pg_trgm GIN indexes (ix_product_translations_name_trgm,
            # ix_products_name_trgm) can be used. Logically identical to
            # COALESCE(t.name, p.name) ILIKE :pattern:
            #   - translated rows (t.name not null): match on t.name
            #   - untranslated rows (t.name null):   match on the base p.name
            stmt = stmt.where(
                or_(
                    ProductTranslation.name.ilike(pattern),
                    and_(ProductTranslation.name.is_(None), Product.name.ilike(pattern)),
                )
            )
        if week_flag is not None:
            # user_id is mandatory when week_flag is specified — raise early rather than
            # silently ignoring the filter (which would return an incorrect list to Planning).
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="user_id is required when week_flag is specified",
                )
            stmt = stmt.join(
                WeekFlag,
                (WeekFlag.product_id == Product.id) & (WeekFlag.user_id == user_id),
            ).where(WeekFlag.flag == week_flag)
        return stmt

    # Total matching count (filters only, no ordering/pagination).
    count_stmt = apply_filters(select(func.count(func.distinct(Product.id))).select_from(Product))
    total = (await db.execute(count_stmt)).scalar_one()

    # Page query: select the entity plus the resolved name.
    page_stmt = apply_filters(
        select(Product, resolved_name.label("resolved_name")).options(
            selectinload(Product.nutrition)
        )
    )

    if sort_by in ("protein", "calories"):
        order_col = (
            NutritionPer100g.protein_g if sort_by == "protein" else NutritionPer100g.calories
        )
        page_stmt = page_stmt.outerjoin(
            NutritionPer100g, NutritionPer100g.product_id == Product.id
        )
        order_expr = order_col.desc() if sort_dir == "desc" else order_col.asc()
        page_stmt = page_stmt.order_by(order_expr.nulls_last())
    elif sort_by == "category":
        page_stmt = page_stmt.order_by(
            Product.category.desc() if sort_dir == "desc" else Product.category.asc()
        )
    else:  # name (locale-resolved)
        page_stmt = page_stmt.order_by(
            resolved_name.desc() if sort_dir == "desc" else resolved_name.asc()
        )

    page_stmt = page_stmt.limit(limit).offset(offset)
    rows = (await db.execute(page_stmt)).all()
    return [(row[0], row[1]) for row in rows], total


async def get_product(
    db: AsyncSession, product_id: int, *, locale: str = DEFAULT_LOCALE
) -> tuple[Product, str] | None:
    """Return `(product, resolved_name)` for a non-deleted product, or None.

    `resolved_name` is the name in `locale` with English fallback. Units and
    nutrition are eagerly loaded for the detail card.
    """
    resolved_name: ColumnElement[str] = func.coalesce(ProductTranslation.name, Product.name)
    stmt = (
        select(Product, resolved_name.label("resolved_name"))
        .outerjoin(
            ProductTranslation,
            (ProductTranslation.product_id == Product.id)
            & (ProductTranslation.locale == locale),
        )
        .options(
            selectinload(Product.nutrition),
            selectinload(Product.units),
        )
        .where(Product.id == product_id, Product.is_deleted == False)  # noqa: E712
    )
    row = (await db.execute(stmt)).one_or_none()
    if row is None:
        return None
    return row[0], row[1]


async def count_user_products(db: AsyncSession, owner_id: int) -> int:
    """Count non-deleted products owned by a specific user."""
    stmt = select(func.count(Product.id)).where(
        Product.owner_id == owner_id,
        Product.is_deleted == False,  # noqa: E712
    )
    result = await db.execute(stmt)
    return result.scalar_one()
