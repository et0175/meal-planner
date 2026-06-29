"""Idempotent seed script for the Meal Planning service.

Inserts representative assignments, a nutrition target, and a tracking entry stub.
Re-running is safe: skips rows that already exist.

Run inside the container:
    docker exec mealplanner_new_1-planning-1 python seed.py
"""

from __future__ import annotations

import asyncio
from datetime import date

from db.engine import get_session_factory
from db.models import MealPlanAssignment, NutritionTarget
from sqlalchemy import select

# Seed user ID (matches identity seed)
_USER_ID = 1

SEED_ASSIGNMENTS = [
    {
        "product_id": 1,
        "product_name": "Rolled Oats",
        "date": date(2026, 6, 29),  # Monday week 27
        "meal_slot": "breakfast",
        "quantity": 1.5,
        "unit": "cup",
        "kcal_per_unit": 350.0,
        "protein_g_per_unit": 12.0,
        "fat_g_per_unit": 6.0,
        "carbs_g_per_unit": 60.0,
    },
    {
        "product_id": 1,
        "product_name": "Chicken Breast (raw)",
        "date": date(2026, 6, 30),  # Tuesday
        "meal_slot": "lunch",
        "quantity": 200.0,
        "unit": "g",
        "kcal_per_unit": 1.65,
        "protein_g_per_unit": 0.31,
        "fat_g_per_unit": 0.036,
        "carbs_g_per_unit": 0.0,
    },
    {
        "product_id": 3,
        "product_name": "Broccoli",
        "date": date(2026, 6, 30),  # Tuesday
        "meal_slot": "dinner",
        "quantity": 300.0,
        "unit": "g",
        "kcal_per_unit": 0.34,
        "protein_g_per_unit": 0.028,
        "fat_g_per_unit": 0.004,
        "carbs_g_per_unit": 0.066,
    },
    {
        "product_id": 2,
        "product_name": "Whole Milk",
        "date": date(2026, 7, 1),  # Wednesday
        "meal_slot": "snacks",
        "quantity": 250.0,
        "unit": "ml",
        "kcal_per_unit": 0.61,
        "protein_g_per_unit": 0.032,
        "fat_g_per_unit": 0.033,
        "carbs_g_per_unit": 0.048,
    },
]

SEED_TARGET = {
    "target_calories": 2000.0,
    "protein_g": 150.0,
    "fat_g": 70.0,
    "carbs_g": 250.0,
}


async def seed() -> None:
    factory = get_session_factory()
    async with factory() as db:
        # Seed assignments (check by product_name + date + meal_slot + user_id)
        for data in SEED_ASSIGNMENTS:
            stmt = select(MealPlanAssignment.id).where(
                MealPlanAssignment.user_id == _USER_ID,
                MealPlanAssignment.product_name == data["product_name"],
                MealPlanAssignment.date == data["date"],
                MealPlanAssignment.meal_slot == data["meal_slot"],
            )
            result = await db.execute(stmt)
            if result.scalar_one_or_none() is not None:
                label = f"{data['product_name']} {data['date']} {data['meal_slot']}"
                print(f"skip {label}")
                continue

            a = MealPlanAssignment(
                user_id=_USER_ID,
                product_id=data["product_id"],
                product_name=data["product_name"],
                date=data["date"],
                meal_slot=data["meal_slot"],
                quantity=data["quantity"],
                unit=data["unit"],
                kcal_per_unit=data.get("kcal_per_unit"),
                protein_g_per_unit=data.get("protein_g_per_unit"),
                fat_g_per_unit=data.get("fat_g_per_unit"),
                carbs_g_per_unit=data.get("carbs_g_per_unit"),
            )
            db.add(a)
            await db.commit()
            label = f"{data['product_name']} {data['date']} {data['meal_slot']}"
            print(f"added {label}")

        # Seed nutrition target
        stmt = select(NutritionTarget.id).where(NutritionTarget.user_id == _USER_ID)
        result = await db.execute(stmt)
        if result.scalar_one_or_none() is not None:
            print("skip nutrition_target user_id=1")
        else:
            db.add(
                NutritionTarget(
                    user_id=_USER_ID,
                    **SEED_TARGET,
                )
            )
            await db.commit()
            print("added nutrition_target user_id=1")


if __name__ == "__main__":
    asyncio.run(seed())
