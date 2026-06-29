"""Product authoring business logic — create, update, soft-delete."""

from __future__ import annotations

from typing import TypedDict

from db.models import NutritionPer100g, Product, ProductUnit
from query.service import count_user_products
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

_MAX_USER_PRODUCTS = 500  # INV-007
_MAX_UNITS = 10  # INV-004


class UnitDict(TypedDict):
    unit_name: str
    grams_per_unit: float


class ProductLimitError(Exception):
    """Raised when user reaches the 500 product limit (INV-007)."""


class UnitLimitError(Exception):
    """Raised when a product already has 10 units and another is attempted (INV-004)."""


class AuthorizationError(Exception):
    """Raised when user tries to edit/delete a product they don't own (INV-006)."""


async def create_product(
    db: AsyncSession,
    *,
    owner_id: int,
    name: str,
    category: str,
    diet_tags: list[str],
    calories: float,
    protein_g: float,
    fat_g: float,
    carbs_g: float,
    units: list[UnitDict],
) -> Product:
    """Create a new user product.

    Raises:
        ProductLimitError: if the user already has 500 products (INV-007).
        UnitLimitError: if units list has > 10 items (INV-004).
    """
    count = await count_user_products(db, owner_id)
    if count >= _MAX_USER_PRODUCTS:
        raise ProductLimitError(
            f"User {owner_id} has reached the maximum of {_MAX_USER_PRODUCTS} products (INV-007)"
        )

    if len(units) > _MAX_UNITS:
        raise UnitLimitError(
            f"A product may have at most {_MAX_UNITS} alternative units (INV-004)"
        )

    product = Product(
        owner_id=owner_id,
        name=name,
        category=category,
        diet_tags=diet_tags,
        is_deleted=False,
    )
    db.add(product)
    await db.flush()  # get product.id without committing

    nutrition = NutritionPer100g(
        product_id=product.id,
        calories=calories,
        protein_g=protein_g,
        fat_g=fat_g,
        carbs_g=carbs_g,
    )
    db.add(nutrition)

    for unit in units:
        db.add(
            ProductUnit(
                product_id=product.id,
                unit_name=str(unit["unit_name"]),
                grams_per_unit=float(unit["grams_per_unit"]),
            )
        )

    await db.commit()
    await db.refresh(product)
    return product


async def update_product(
    db: AsyncSession,
    product_id: int,
    owner_id: int,
    *,
    name: str | None = None,
    category: str | None = None,
    diet_tags: list[str] | None = None,
    calories: float | None = None,
    protein_g: float | None = None,
    fat_g: float | None = None,
    carbs_g: float | None = None,
    units: list[UnitDict] | None = None,
) -> Product:
    """Update an existing product. Only the owner may edit it (INV-006).

    Raises:
        ValueError: if the product is not found.
        AuthorizationError: if owner_id doesn't match or product is global.
        UnitLimitError: if new units list has > 10 items.
    """
    stmt = (
        select(Product)
        .options(selectinload(Product.nutrition), selectinload(Product.units))
        .where(Product.id == product_id, Product.is_deleted == False)  # noqa: E712
    )
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()

    if product is None:
        raise ValueError(f"Product {product_id} not found")

    # INV-006: global products (owner_id=null) → 403; other user's products → 403
    if product.owner_id is None or product.owner_id != owner_id:
        raise AuthorizationError(
            f"User {owner_id} is not authorized to edit product {product_id}"
        )

    if units is not None and len(units) > _MAX_UNITS:
        raise UnitLimitError(
            f"A product may have at most {_MAX_UNITS} alternative units (INV-004)"
        )

    if name is not None:
        product.name = name
    if category is not None:
        product.category = category
    if diet_tags is not None:
        product.diet_tags = diet_tags

    # Update nutrition if any nutrition field is provided
    if any(v is not None for v in (calories, protein_g, fat_g, carbs_g)):
        if product.nutrition is not None:
            if calories is not None:
                product.nutrition.calories = calories
            if protein_g is not None:
                product.nutrition.protein_g = protein_g
            if fat_g is not None:
                product.nutrition.fat_g = fat_g
            if carbs_g is not None:
                product.nutrition.carbs_g = carbs_g
        else:
            db.add(
                NutritionPer100g(
                    product_id=product.id,
                    calories=calories if calories is not None else 0.0,
                    protein_g=protein_g if protein_g is not None else 0.0,
                    fat_g=fat_g if fat_g is not None else 0.0,
                    carbs_g=carbs_g if carbs_g is not None else 0.0,
                )
            )

    # Replace units if provided
    if units is not None:
        for existing_unit in product.units:
            await db.delete(existing_unit)
        await db.flush()
        for unit in units:
            db.add(
                ProductUnit(
                    product_id=product.id,
                    unit_name=unit["unit_name"],
                    grams_per_unit=unit["grams_per_unit"],
                )
            )

    await db.commit()
    await db.refresh(product)
    return product


async def delete_product(
    db: AsyncSession,
    product_id: int,
    owner_id: int,
) -> bool:
    """Soft-delete a product. Only the owner may delete (INV-006).

    Raises:
        ValueError: if the product is not found.
        AuthorizationError: if owner_id doesn't match or product is global.
    Returns True on success.
    """
    stmt = select(
        Product.id, Product.owner_id, Product.is_deleted
    ).where(Product.id == product_id)
    result = await db.execute(stmt)
    row = result.one_or_none()

    if row is None or row.is_deleted:
        raise ValueError(f"Product {product_id} not found")

    # INV-006: global products (owner_id=null) or other user's product → 403
    if row.owner_id is None or row.owner_id != owner_id:
        raise AuthorizationError(
            f"User {owner_id} is not authorized to delete product {product_id}"
        )

    await db.execute(
        update(Product).where(Product.id == product_id).values(is_deleted=True)
    )
    await db.commit()
    return True
