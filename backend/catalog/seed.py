"""Idempotent seed script for the Product Catalog service.

Inserts 5 realistic global products (owner_id=NULL) across 3 categories.
Re-running is safe: existing products (matched by name) are skipped.

Run inside the container:
    docker exec mealplanner_new_1-catalog-1 python seed.py
"""

from __future__ import annotations

import asyncio
from typing import Any

from db.engine import get_session_factory
from db.models import NutritionPer100g, Product, ProductUnit
from sqlalchemy import select

SEED_PRODUCTS: list[dict[str, Any]] = [
    {
        "name": "Chicken Breast (raw)",
        "category": "Meat & Poultry",
        "diet_tags": ["Gluten-Free", "High-Protein"],
        "nutrition": {"calories": 165.0, "protein_g": 31.0, "fat_g": 3.6, "carbs_g": 0.0},
        "units": [
            {"unit_name": "100g", "grams_per_unit": 100.0},
            {"unit_name": "breast (avg)", "grams_per_unit": 175.0},
        ],
    },
    {
        "name": "Whole Milk",
        "category": "Dairy",
        "diet_tags": ["Vegetarian"],
        "nutrition": {"calories": 61.0, "protein_g": 3.2, "fat_g": 3.3, "carbs_g": 4.8},
        "units": [
            {"unit_name": "100ml", "grams_per_unit": 103.0},
            {"unit_name": "glass (250ml)", "grams_per_unit": 258.0},
            {"unit_name": "cup", "grams_per_unit": 244.0},
        ],
    },
    {
        "name": "Rolled Oats",
        "category": "Grains & Cereals",
        "diet_tags": ["Vegan", "Vegetarian"],
        "nutrition": {"calories": 389.0, "protein_g": 16.9, "fat_g": 6.9, "carbs_g": 66.3},
        "units": [
            {"unit_name": "100g", "grams_per_unit": 100.0},
            {"unit_name": "cup (dry)", "grams_per_unit": 90.0},
            {"unit_name": "tbsp", "grams_per_unit": 9.0},
        ],
    },
    {
        "name": "Broccoli",
        "category": "Vegetables",
        "diet_tags": ["Vegan", "Vegetarian", "Gluten-Free"],
        "nutrition": {"calories": 34.0, "protein_g": 2.8, "fat_g": 0.4, "carbs_g": 6.6},
        "units": [
            {"unit_name": "100g", "grams_per_unit": 100.0},
            {"unit_name": "head (avg)", "grams_per_unit": 608.0},
            {"unit_name": "floret", "grams_per_unit": 11.0},
        ],
    },
    {
        "name": "Extra Virgin Olive Oil",
        "category": "Oils & Fats",
        "diet_tags": ["Vegan", "Vegetarian", "Gluten-Free", "Keto"],
        "nutrition": {"calories": 884.0, "protein_g": 0.0, "fat_g": 100.0, "carbs_g": 0.0},
        "units": [
            {"unit_name": "100ml", "grams_per_unit": 91.0},
            {"unit_name": "tbsp (15ml)", "grams_per_unit": 13.5},
            {"unit_name": "tsp (5ml)", "grams_per_unit": 4.5},
        ],
    },
]


async def seed() -> None:
    factory = get_session_factory()
    async with factory() as db:
        for product_data in SEED_PRODUCTS:
            name: str = product_data["name"]
            # Check if already exists
            stmt = select(Product.id).where(
                Product.name == name, Product.owner_id.is_(None)
            )
            result = await db.execute(stmt)
            existing_id = result.scalar_one_or_none()

            if existing_id is not None:
                print(f"skip {name}")
                continue

            product = Product(
                name=name,
                category=product_data["category"],
                diet_tags=product_data["diet_tags"],
                is_deleted=False,
                owner_id=None,  # global product
            )
            db.add(product)
            await db.flush()

            nutr: dict[str, float] = product_data["nutrition"]
            db.add(
                NutritionPer100g(
                    product_id=product.id,
                    calories=nutr["calories"],
                    protein_g=nutr["protein_g"],
                    fat_g=nutr["fat_g"],
                    carbs_g=nutr["carbs_g"],
                )
            )

            for unit_data in product_data["units"]:
                unit: dict[str, Any] = unit_data
                db.add(
                    ProductUnit(
                        product_id=product.id,
                        unit_name=str(unit["unit_name"]),
                        grams_per_unit=float(unit["grams_per_unit"]),
                    )
                )

            await db.commit()
            print(f"added {name}")


if __name__ == "__main__":
    asyncio.run(seed())
