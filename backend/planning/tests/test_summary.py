"""Tests for the plan summary endpoint (ADR-0004, COMP-017).

Covers: AC-058, AC-063
"""

from __future__ import annotations

from datetime import date

from db.models import MealPlanAssignment
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


class TestPlanSummary:
    """FR-021 / FR-024 — Plan summary panel (AC-058, AC-063)."""

    async def test_summary_no_assignments(self, client: AsyncClient) -> None:
        """No assignments → zeros returned (no error)."""
        resp = await client.get("/plan/summary", params={"week": "2099-01"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["total_kcal"] == 0.0
        assert body["assignment_count"] == 0

    async def test_summary_aggregates_nutrition(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-063: 1600 kcal / 2000 target → 80% — summary returns correct totals."""
        # 2 assignments: 800 kcal each = 1600 total
        for i in range(2):
            db.add(
                MealPlanAssignment(
                    user_id=1,
                    product_id=i + 1,
                    product_name=f"Product {i}",
                    date=date(2026, 6, 29),
                    meal_slot="breakfast",
                    quantity=1.0,
                    unit="serving",
                    kcal_per_unit=800.0,
                    protein_g_per_unit=50.0,
                    fat_g_per_unit=30.0,
                    carbs_g_per_unit=100.0,
                )
            )
        await db.commit()

        resp = await client.get("/plan/summary", params={"week": "2026-27"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["total_kcal"] == 1600.0
        assert body["total_protein_g"] == 100.0
        assert body["total_fat_g"] == 60.0
        assert body["total_carbs_g"] == 200.0
        assert body["assignment_count"] == 2

    async def test_summary_ignores_no_nutrition_data(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """Assignments without nutrition data contribute 0 to totals."""
        db.add(
            MealPlanAssignment(
                user_id=1,
                product_id=1,
                product_name="Unknown Nutrition",
                date=date(2026, 6, 29),
                meal_slot="snacks",
                quantity=2.0,
                unit="piece",
                kcal_per_unit=None,  # no nutrition
            )
        )
        await db.commit()

        resp = await client.get("/plan/summary", params={"week": "2026-27"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["total_kcal"] == 0.0
        assert body["assignment_count"] == 1  # assignment counted even without nutrition

    async def test_summary_user_isolation(
        self,
        client: AsyncClient,
        client_user2: AsyncClient,
        db: AsyncSession,
    ) -> None:
        """AC-107 variant: user 2 sees 0 totals for user 1's assignments."""
        db.add(
            MealPlanAssignment(
                user_id=1,
                product_id=1,
                product_name="Steak",
                date=date(2026, 6, 29),
                meal_slot="dinner",
                quantity=1.0,
                unit="portion",
                kcal_per_unit=500.0,
            )
        )
        await db.commit()

        resp = await client_user2.get("/plan/summary", params={"week": "2026-27"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["total_kcal"] == 0.0
        assert body["assignment_count"] == 0

    async def test_summary_default_current_week(self, client: AsyncClient) -> None:
        """No week param → current week summary returned without error."""
        resp = await client.get("/plan/summary")
        assert resp.status_code == 200
        body = resp.json()
        assert "week" in body
        assert "total_kcal" in body
