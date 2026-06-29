"""Tests for week flag endpoints and scheduler rollover.

Covers: AC-043–045, AC-112 (FR-015)
"""

from __future__ import annotations

from datetime import UTC, datetime

from db.models import NutritionPer100g, Product, WeekFlag, WeekFlagEnum
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


async def _seed_product(db: AsyncSession, *, name: str = "Chicken") -> Product:
    p = Product(
        name=name,
        category="Meat",
        diet_tags=[],
        is_deleted=False,
        owner_id=1,
    )
    db.add(p)
    await db.flush()
    db.add(
        NutritionPer100g(product_id=p.id, calories=165.0, protein_g=31.0, fat_g=3.6, carbs_g=0.0)
    )
    await db.commit()
    await db.refresh(p)
    return p


class TestWeekFlag:
    """FR-015 — Week flags (AC-043–045, AC-112)."""

    async def test_set_this_week_flag(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-043: set 'this_week' flag → flag stored, appears in week_flag filter."""
        p = await _seed_product(db, name="Oats")
        resp = await client.put(f"/products/{p.id}/week-flag", json={"flag": "this_week"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["flag"] == "this_week"
        assert body["product_id"] == p.id
        assert body["user_id"] == 1

        # Verify appears in week_flag filtered list (ADR-0002)
        list_resp = await client.get("/products?week_flag=this_week&user_id=1")
        assert list_resp.status_code == 200
        items = list_resp.json()["items"]
        assert any(i["id"] == p.id for i in items)

    async def test_clear_flag(self, client: AsyncClient, db: AsyncSession) -> None:
        """AC-044: clear flag ('none') → removed from planner summary."""
        p = await _seed_product(db, name="Banana")

        # Set flag first
        await client.put(f"/products/{p.id}/week-flag", json={"flag": "this_week"})

        # Verify in list
        list_resp = await client.get("/products?week_flag=this_week&user_id=1")
        assert any(i["id"] == p.id for i in list_resp.json()["items"])

        # Clear it
        clear_resp = await client.put(f"/products/{p.id}/week-flag", json={"flag": "none"})
        assert clear_resp.status_code == 200

        # Should no longer appear in this_week filter
        list_resp2 = await client.get("/products?week_flag=this_week&user_id=1")
        assert not any(i["id"] == p.id for i in list_resp2.json()["items"])

    async def test_next_week_not_shown_in_current_week(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-112: 'next_week' flag mid-week → not shown in current week summary."""
        p = await _seed_product(db, name="Rice")
        await client.put(f"/products/{p.id}/week-flag", json={"flag": "next_week"})

        # Should NOT appear in this_week filter
        resp = await client.get("/products?week_flag=this_week&user_id=1")
        assert resp.status_code == 200
        assert not any(i["id"] == p.id for i in resp.json()["items"])

        # But should appear in next_week filter
        resp2 = await client.get("/products?week_flag=next_week&user_id=1")
        assert any(i["id"] == p.id for i in resp2.json()["items"])

    async def test_set_flag_nonexistent_product_404(self, client: AsyncClient) -> None:
        """Setting a flag on a non-existent product → 404."""
        resp = await client.put("/products/99999/week-flag", json={"flag": "this_week"})
        assert resp.status_code == 404

    async def test_week_flag_requires_auth(
        self, anon_client: AsyncClient, db: AsyncSession
    ) -> None:
        """Week flag endpoint requires authentication."""
        p = await _seed_product(db)
        resp = await anon_client.put(
            f"/products/{p.id}/week-flag", json={"flag": "this_week"}
        )
        assert resp.status_code in (401, 403)


class TestWeekFlagRollover:
    """AC-045: Monday 00:00 scheduler fires → 'Next week' flags promoted."""

    async def test_rollover_promotes_next_week_to_this_week(
        self, db: AsyncSession
    ) -> None:
        """AC-045: rollover promotes next_week → this_week and clears old this_week."""
        from weekflag.service import rollover_week_flags

        p1 = await _seed_product(db, name="Product A")
        p2 = await _seed_product(db, name="Product B")
        p3 = await _seed_product(db, name="Product C")

        # p1: next_week (should be promoted to this_week)
        # p2: this_week from last week (should be cleared)
        # p3: none (should remain none)
        old_time = datetime(2026, 6, 15, 0, 0, 0, tzinfo=UTC)

        db.add(
            WeekFlag(product_id=p1.id, user_id=1, flag=WeekFlagEnum.next_week, updated_at=old_time)
        )
        db.add(
            WeekFlag(product_id=p2.id, user_id=1, flag=WeekFlagEnum.this_week, updated_at=old_time)
        )
        db.add(
            WeekFlag(product_id=p3.id, user_id=1, flag=WeekFlagEnum.none, updated_at=old_time)
        )
        await db.commit()

        promoted = await rollover_week_flags(db)
        assert promoted == 1  # one next_week promoted

        from sqlalchemy import select
        result = await db.execute(
            select(WeekFlag.flag).where(WeekFlag.product_id == p1.id, WeekFlag.user_id == 1)
        )
        assert result.scalar_one() == WeekFlagEnum.this_week

        result2 = await db.execute(
            select(WeekFlag.flag).where(WeekFlag.product_id == p2.id, WeekFlag.user_id == 1)
        )
        assert result2.scalar_one() == WeekFlagEnum.none

        result3 = await db.execute(
            select(WeekFlag.flag).where(WeekFlag.product_id == p3.id, WeekFlag.user_id == 1)
        )
        assert result3.scalar_one() == WeekFlagEnum.none
