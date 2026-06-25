"""Product query router — GET /products, GET /products/:id."""

from __future__ import annotations

from typing import Annotated, Literal

from db.engine import get_db
from db.models import WeekFlagEnum
from fastapi import APIRouter, Depends, HTTPException, Query, status
from query.schemas import ProductDetail, ProductListResponse, ProductSummary
from query.service import get_product, list_products
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
) -> ProductListResponse:
    """List products with optional filters and sorting.

    Supports week_flag + user_id filter for ADR-0002 (Planning service).
    No auth required — public read endpoint.
    """
    products = await list_products(
        db,
        category=category,
        diet_tag=diet_tag,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir,
        week_flag=week_flag,
        user_id=user_id,
    )
    items = [ProductSummary.model_validate(p) for p in products]
    return ProductListResponse(items=items, total=len(items))


@router.get("/{product_id}", response_model=ProductDetail)
async def get_product_route(
    product_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ProductDetail:
    """Get product detail with nutrition and unit conversion table.

    No auth required — public read endpoint.
    """
    product = await get_product(db, product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found",
        )
    return ProductDetail.model_validate(product)
