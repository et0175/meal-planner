"""Product authoring router — POST, PUT, DELETE /products."""

from __future__ import annotations

from typing import Annotated, Any, cast

from auth_middleware import verify_token
from authoring.schemas import (
    CreateProductRequest,
    DeleteResponse,
    ProductResponse,
    UpdateProductRequest,
)
from authoring.service import (
    AuthorizationError,
    ProductLimitError,
    UnitDict,
    UnitLimitError,
    create_product,
    delete_product,
    update_product,
)
from db.engine import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/products", tags=["products"])


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product_route(
    body: CreateProductRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> ProductResponse:
    """Create a new user product.

    Enforces: no empty name, no negative nutrition, max 500 user products, max 10 units.
    EVT-006: product created event (logged via response).
    """
    owner_id: int = session["account_id"]
    try:
        product = await create_product(
            db,
            owner_id=owner_id,
            name=body.name,
            category=body.category,
            diet_tags=body.diet_tags,
            calories=body.nutrition.calories,
            protein_g=body.nutrition.protein_g,
            fat_g=body.nutrition.fat_g,
            carbs_g=body.nutrition.carbs_g,
            units=cast(list[UnitDict], [u.model_dump() for u in body.units]),
        )
    except ProductLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc
    except UnitLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc
    return ProductResponse.model_validate(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product_route(
    product_id: int,
    body: UpdateProductRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> ProductResponse:
    """Update an owned product.

    EVT-007: product updated event (logged via response).
    """
    owner_id: int = session["account_id"]

    nutrition = body.nutrition
    try:
        product = await update_product(
            db,
            product_id,
            owner_id,
            name=body.name,
            category=body.category,
            diet_tags=body.diet_tags,
            calories=nutrition.calories if nutrition else None,
            protein_g=nutrition.protein_g if nutrition else None,
            fat_g=nutrition.fat_g if nutrition else None,
            carbs_g=nutrition.carbs_g if nutrition else None,
            units=(
                cast(list[UnitDict], [u.model_dump() for u in body.units])
                if body.units is not None
                else None
            ),
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except AuthorizationError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except UnitLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc
    return ProductResponse.model_validate(product)


@router.delete("/{product_id}", response_model=DeleteResponse)
async def delete_product_route(
    product_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> DeleteResponse:
    """Soft-delete an owned product.

    EVT-008: product deleted event (logged via response).
    """
    owner_id: int = session["account_id"]
    try:
        await delete_product(db, product_id, owner_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except AuthorizationError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    return DeleteResponse(detail=f"Product {product_id} deleted")
