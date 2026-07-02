"""Product query router — GET /products, GET /products/:id."""

from __future__ import annotations

from typing import Annotated, Literal

from db.engine import get_db
from db.models import WeekFlagEnum
from fastapi import APIRouter, Depends, HTTPException, Query, status
from query.schemas import ProductDetail, ProductListResponse, ProductSummary
from query.service import DEFAULT_LOCALE, get_product, list_products
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
async def list_products_route(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: str | None = Query(default=None, description="Filter by category"),
    diet_tag: str | None = Query(default=None, description="Filter by diet tag"),
    search: str | None = Query(default=None, description="Case-insensitive name search"),
    sort_by: Literal["name", "category", "protein", "calories"] = Query(default="name"),
    sort_dir: Literal["asc", "desc"] = Query(default="asc"),
    week_flag: WeekFlagEnum | None = Query(default=None, description="Filter by week flag"),  # noqa: B008
    user_id: int | None = Query(default=None, description="User ID for week flag filter"),  # noqa: B008
    locale: str = Query(default=DEFAULT_LOCALE, description="BCP-47 locale; English fallback"),  # noqa: B008
    limit: int = Query(default=50, ge=1, le=200, description="Page size"),
    offset: int = Query(default=0, ge=0, description="Page offset"),
) -> ProductListResponse:
    """List products with optional filters, sorting, locale resolution, and pagination.

    Product names are returned in `locale` with English fallback (FR-037, ADR-0012).
    Supports week_flag + user_id filter for ADR-0002 (Planning service).
    No auth required — public read endpoint.
    """
    rows, total = await list_products(
        db,
        category=category,
        diet_tag=diet_tag,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir,
        week_flag=week_flag,
        user_id=user_id,
        locale=locale,
        limit=limit,
        offset=offset,
    )
    items = [
        ProductSummary.model_validate(p).model_copy(update={"name": name})
        for (p, name) in rows
    ]
    return ProductListResponse(items=items, total=total)


@router.get("/{product_id}", response_model=ProductDetail)
async def get_product_route(
    product_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    locale: str = Query(default=DEFAULT_LOCALE, description="BCP-47 locale; English fallback"),  # noqa: B008
) -> ProductDetail:
    """Get product detail with nutrition and unit conversion table.

    Product name is returned in `locale` with English fallback (FR-037).
    No auth required — public read endpoint.
    """
    result = await get_product(db, product_id, locale=locale)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found",
        )
    product, resolved_name = result
    return ProductDetail.model_validate(product).model_copy(update={"name": resolved_name})
