"""Tests for log-from-plan endpoints (ADR-0001, COMP-016).

Covers: AC-065, AC-066, AC-067, AC-118
"""

from __future__ import annotations

from datetime import date

from db.models import MealPlanAssignment, TrackingEntry
from httpx import AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


async def _seed_assignments(
    db: AsyncSession,
    *,
    user_id: int = 1,
    count: int = 3,
    log_date: date = date(2026, 6, 29),
) -> list[MealPlanAssignment]:
    slots = ["breakfast", "lunch", "dinner", "snacks"]
    assignments = [
        MealPlanAssignment(
            user_id=user_id,
            product_id=i + 1,
            product_name=f"Product {i}",
            date=log_date,
            meal_slot=slots[i % 4],
            quantity=float(i + 1),
            unit="unit",
        )
        for i in range(count)
    ]
    db.add_all(assignments)
    await db.commit()
    return assignments


class TestLogDay:
    """FR-025 — Log all day assignments (AC-065, AC-118)."""

    async def test_log_day_creates_entries(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-065: 5 assignments on a day → EVT-015 + 5 TrackingEntries."""
        await _seed_assignments(db, count=5, log_date=date(2026, 6, 29))

        resp = await client.post("/plan/log/day", json={"date": "2026-06-29"})
        assert resp.status_code == 201
        body = resp.json()
        assert body["entries_created"] == 5

        # Verify entries in DB
        count_stmt = select(func.count(TrackingEntry.id)).where(TrackingEntry.user_id == 1)
        result = await db.execute(count_stmt)
        assert result.scalar_one() == 5

    async def test_log_day_empty_day_no_error(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-118: empty day → 0 entries, no error."""
        resp = await client.post("/plan/log/day", json={"date": "2099-01-01"})
        assert resp.status_code == 201
        assert resp.json()["entries_created"] == 0

    async def test_log_day_entries_have_correct_data(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """TrackingEntry fields match source assignment."""
        await _seed_assignments(db, count=1, log_date=date(2026, 6, 30))
        await client.post("/plan/log/day", json={"date": "2026-06-30"})

        stmt = select(TrackingEntry).where(TrackingEntry.user_id == 1)
        result = await db.execute(stmt)
        entry = result.scalar_one()
        assert entry.product_id == 1
        assert entry.source_assignment_id is not None


class TestLogWeek:
    """FR-025 — Log all week assignments (AC-066)."""

    async def test_log_week_creates_entries(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-066: 20 assignments in a week → EVT-016 + 20 TrackingEntries."""
        # 20 assignments spread across the week
        for day_offset in range(7):
            log_date = date(2026, 6, 29)
            from datetime import timedelta
            day = log_date + timedelta(days=day_offset)
            slots_needed = 20 // 7 + (1 if day_offset < 20 % 7 else 0)
            slots_needed = max(1, min(slots_needed, 4))
            for j in range(slots_needed):
                slot = ["breakfast", "lunch", "dinner", "snacks"][j % 4]
                db.add(
                    MealPlanAssignment(
                        user_id=1,
                        product_id=day_offset * 10 + j + 1,
                        product_name=f"Product {day_offset}-{j}",
                        date=day,
                        meal_slot=slot,
                        quantity=1.0,
                        unit="unit",
                    )
                )
        await db.commit()

        resp = await client.post("/plan/log/week", json={"week": "2026-27"})
        assert resp.status_code == 201
        body = resp.json()
        assert body["entries_created"] >= 7  # at least 7 (one per day minimum)

    async def test_log_week_exactly_20_assignments(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-066 exact: 20 assignments in a week → 20 TrackingEntries."""
        # Insert exactly 20 across the week
        from datetime import timedelta
        monday = date(2026, 6, 29)
        for i in range(20):
            day = monday + timedelta(days=i % 7)
            slot = ["breakfast", "lunch", "dinner", "snacks"][i % 4]
            db.add(
                MealPlanAssignment(
                    user_id=1,
                    product_id=i + 1,
                    product_name=f"Product {i}",
                    date=day,
                    meal_slot=slot,
                    quantity=1.0,
                    unit="unit",
                )
            )
        await db.commit()

        resp = await client.post("/plan/log/week", json={"week": "2026-27"})
        assert resp.status_code == 201
        assert resp.json()["entries_created"] == 20


class TestLogItem:
    """FR-025 — Log single assignment (AC-067)."""

    async def test_log_item_creates_one_entry(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-067: log single Calendar item → EVT-017 + 1 TrackingEntry."""
        assignments = await _seed_assignments(db, count=3)
        target = assignments[1]

        resp = await client.post("/plan/log/item", json={"assignment_id": target.id})
        assert resp.status_code == 201
        assert resp.json()["entries_created"] == 1

        stmt = select(TrackingEntry).where(TrackingEntry.source_assignment_id == target.id)
        result = await db.execute(stmt)
        entry = result.scalar_one()
        assert entry.product_id == target.product_id

    async def test_log_item_not_found_returns_zero(
        self, client: AsyncClient
    ) -> None:
        """Non-existent assignment → 0 entries, no error."""
        resp = await client.post("/plan/log/item", json={"assignment_id": 999999})
        assert resp.status_code == 201
        assert resp.json()["entries_created"] == 0

    async def test_log_item_other_user_assignment_returns_zero(
        self, client_user2: AsyncClient, db: AsyncSession
    ) -> None:
        """User 2 cannot log user 1's assignment (INV-009)."""
        assignments = await _seed_assignments(db, user_id=1, count=1)
        resp = await client_user2.post(
            "/plan/log/item", json={"assignment_id": assignments[0].id}
        )
        assert resp.status_code == 201
        assert resp.json()["entries_created"] == 0
