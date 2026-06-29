"""Tests for nutrition target endpoints.

Covers: AC-063, AC-064, AC-106, AC-107, INV-013, INV-014
"""

from __future__ import annotations

import pytest
from db.models import NutritionTarget
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


class TestGetTarget:
    """FR-024 — Get nutrition target (AC-063, AC-064)."""

    async def test_get_target_not_set_404(self, client: AsyncClient) -> None:
        """AC-064: no target set → 404."""
        resp = await client.get("/plan/target")
        assert resp.status_code == 404

    async def test_get_target_returns_correct_values(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-063: target set → correct values returned."""
        db.add(
            NutritionTarget(
                user_id=1,
                target_calories=2000.0,
                protein_g=150.0,
                fat_g=70.0,
                carbs_g=250.0,
            )
        )
        await db.commit()

        resp = await client.get("/plan/target")
        assert resp.status_code == 200
        body = resp.json()
        assert body["target_calories"] == 2000.0
        assert body["protein_g"] == 150.0
        assert body["user_id"] == 1


class TestPutTarget:
    """FR-024 — Set nutrition target (AC-106, INV-013, INV-014)."""

    async def test_put_target_creates(self, client: AsyncClient) -> None:
        """PUT /plan/target creates target when none exists."""
        payload = {"target_calories": 2000.0, "protein_g": 150.0, "fat_g": 70.0, "carbs_g": 250.0}
        resp = await client.put("/plan/target", json=payload)
        assert resp.status_code == 200
        body = resp.json()
        assert body["target_calories"] == 2000.0

    async def test_put_target_updates_existing(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """INV-014: exactly one target per user — upsert replaces existing."""
        db.add(
            NutritionTarget(user_id=1, target_calories=1500.0, protein_g=100.0, fat_g=50.0, carbs_g=200.0)
        )
        await db.commit()

        resp = await client.put(
            "/plan/target",
            json={"target_calories": 2200.0, "protein_g": 160.0, "fat_g": 80.0, "carbs_g": 260.0},
        )
        assert resp.status_code == 200
        assert resp.json()["target_calories"] == 2200.0

        # Ensure only one target exists
        from sqlalchemy import func, select
        stmt = select(func.count(NutritionTarget.id)).where(NutritionTarget.user_id == 1)
        result = await db.execute(stmt)
        assert result.scalar_one() == 1

    async def test_put_target_negative_calories_422(self, client: AsyncClient) -> None:
        """AC-106: target_calories = -100 → 422 (INV-013)."""
        resp = await client.put(
            "/plan/target",
            json={"target_calories": -100.0, "protein_g": 0.0, "fat_g": 0.0, "carbs_g": 0.0},
        )
        assert resp.status_code == 422

    async def test_put_target_zero_calories_ok(self, client: AsyncClient) -> None:
        """INV-013 boundary: target_calories = 0 is valid."""
        resp = await client.put(
            "/plan/target",
            json={"target_calories": 0.0, "protein_g": 0.0, "fat_g": 0.0, "carbs_g": 0.0},
        )
        assert resp.status_code == 200

    @pytest.mark.parametrize("kcal", [-0.001, -1.0, -100.0, -9999.9])
    async def test_negative_calories_always_422(
        self, client: AsyncClient, kcal: float
    ) -> None:
        """Property test: any negative calorie value → 422."""
        resp = await client.put(
            "/plan/target",
            json={"target_calories": kcal, "protein_g": 0.0, "fat_g": 0.0, "carbs_g": 0.0},
        )
        assert resp.status_code == 422

    async def test_target_user_isolation(
        self,
        client_user2: AsyncClient,
        db: AsyncSession,
    ) -> None:
        """AC-107: Alice's target not visible to Bob (INV-014)."""
        # Seed user 1's target directly in DB (avoid dual-client override conflict)
        db.add(
            NutritionTarget(
                user_id=1,
                target_calories=2000.0,
                protein_g=150.0,
                fat_g=70.0,
                carbs_g=250.0,
            )
        )
        await db.commit()

        # User 2 has no target
        resp = await client_user2.get("/plan/target")
        assert resp.status_code == 404
