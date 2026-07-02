"""Tests for meal plan assignment endpoints.

Covers: AC-046–051, AC-054–056, AC-079, AC-101, AC-102, AC-052, AC-062, AC-121
"""

from __future__ import annotations

import copy
from datetime import date
from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
from db.models import MealPlanAssignment
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _seed_assignment(
    db: AsyncSession,
    *,
    user_id: int = 1,
    product_id: int = 1,
    product_name: str = "Oats",
    assignment_date: date = date(2026, 6, 29),
    meal_slot: str = "breakfast",
    quantity: float = 1.0,
    unit: str = "cup",
) -> MealPlanAssignment:
    a = MealPlanAssignment(
        user_id=user_id,
        product_id=product_id,
        product_name=product_name,
        date=assignment_date,
        meal_slot=meal_slot,
        quantity=quantity,
        unit=unit,
    )
    db.add(a)
    await db.commit()
    await db.refresh(a)
    return a


# ---------------------------------------------------------------------------
# Week plan listing (FR-016)
# ---------------------------------------------------------------------------


class TestWeekPlan:
    """FR-016 — Week navigation (AC-046, AC-047)."""

    async def test_get_week_plan_current_week(
        self, client: AsyncClient, assignment_payload: dict[str, Any]
    ) -> None:
        """GET /plan returns assignments for the current week."""
        # Patch week-flag reader to return empty (catalog not needed)
        with patch(
            "mealplan.router.get_this_week_products",
            new=AsyncMock(return_value=[]),
        ):
            resp = await client.get("/plan")
        assert resp.status_code == 200
        body = resp.json()
        assert "week" in body
        assert "assignments" in body

    async def test_get_week_plan_specific_week(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-046: specific week parameter loads that week's assignments."""
        a = await _seed_assignment(db, assignment_date=date(2026, 6, 29))  # week 27
        with patch(
            "mealplan.router.get_this_week_products",
            new=AsyncMock(return_value=[]),
        ):
            resp = await client.get("/plan", params={"week": "2026-27"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["week"] == "2026-27"
        ids = [x["id"] for x in body["assignments"]]
        assert a.id in ids

    async def test_get_week_plan_w_prefixed_week(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """The YYYY-WNN form (e.g. 2026-W27) is accepted and echoed back unchanged."""
        a = await _seed_assignment(db, assignment_date=date(2026, 6, 29))  # week 27
        with patch(
            "mealplan.router.get_this_week_products",
            new=AsyncMock(return_value=[]),
        ):
            resp = await client.get("/plan", params={"week": "2026-W27"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["week"] == "2026-W27"
        assert a.id in [x["id"] for x in body["assignments"]]

    async def test_different_week_not_included(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-046: assignment in week 26 not returned when querying week 27."""
        await _seed_assignment(db, assignment_date=date(2026, 6, 22))  # week 26
        with patch(
            "mealplan.router.get_this_week_products",
            new=AsyncMock(return_value=[]),
        ):
            resp = await client.get("/plan", params={"week": "2026-27"})
        assert resp.status_code == 200
        assert len(resp.json()["assignments"]) == 0

    async def test_three_assignments_monday_breakfast(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-048: 3 Monday Breakfast assignments → all 3 returned."""
        for i in range(3):
            await _seed_assignment(
                db,
                product_name=f"Product {i}",
                assignment_date=date(2026, 6, 29),
                meal_slot="breakfast",
            )
        with patch(
            "mealplan.router.get_this_week_products",
            new=AsyncMock(return_value=[]),
        ):
            resp = await client.get("/plan", params={"week": "2026-27"})
        assert resp.status_code == 200
        assert len(resp.json()["assignments"]) == 3

    async def test_week_flag_products_included_for_current_week(
        self, client: AsyncClient
    ) -> None:
        """AC-052: this-week flagged products appear in the current week response."""
        flagged = [{"id": 99, "name": "Flagged Product", "week_flag": "this_week"}]
        with patch(
            "mealplan.router.get_this_week_products",
            new=AsyncMock(return_value=flagged),
        ):
            resp = await client.get("/plan")
        assert resp.status_code == 200
        body = resp.json()
        assert len(body["week_flagged_products"]) == 1
        assert body["week_flagged_products"][0]["id"] == 99

    async def test_week_flag_products_not_in_other_week(
        self, client: AsyncClient
    ) -> None:
        """AC-114: flagged products not returned for a past week."""
        with patch(
            "mealplan.router.get_this_week_products",
            new=AsyncMock(return_value=[{"id": 99, "name": "Flagged"}]),
        ):
            resp = await client.get("/plan", params={"week": "2026-01"})
        assert resp.status_code == 200
        assert resp.json()["week_flagged_products"] == []


# ---------------------------------------------------------------------------
# Create assignment (FR-017, FR-019)
# ---------------------------------------------------------------------------


class TestCreateAssignment:
    """FR-017 / FR-019 — Add assignment (AC-049, AC-054, AC-101)."""

    async def test_create_assignment_persists(
        self, client: AsyncClient, assignment_payload: dict[str, Any]
    ) -> None:
        """AC-049: valid payload → 201, assignment stored."""
        resp = await client.post("/plan/assignments", json=assignment_payload)
        assert resp.status_code == 201
        body = resp.json()
        assert body["product_name"] == "Rolled Oats"
        assert body["quantity"] == 1.5
        assert body["meal_slot"] == "breakfast"
        assert "id" in body

    async def test_create_assignment_quantity_zero_422(
        self, client: AsyncClient, assignment_payload: dict[str, Any]
    ) -> None:
        """AC-101, AC-115: quantity = 0 → 422 (INV-008)."""
        assignment_payload["quantity"] = 0
        resp = await client.post("/plan/assignments", json=assignment_payload)
        assert resp.status_code == 422

    async def test_create_assignment_negative_quantity_422(
        self, client: AsyncClient, assignment_payload: dict[str, Any]
    ) -> None:
        """AC-101: quantity < 0 → 422 (INV-008)."""
        assignment_payload["quantity"] = -1.5
        resp = await client.post("/plan/assignments", json=assignment_payload)
        assert resp.status_code == 422

    @pytest.mark.parametrize("qty", [0.001, 0.5, 1.0, 100.0, 9999.9])
    async def test_create_assignment_valid_quantities(
        self,
        client: AsyncClient,
        assignment_payload: dict[str, Any],
        qty: float,
    ) -> None:
        """Property test: any quantity > 0 is accepted."""
        assignment_payload["quantity"] = qty
        resp = await client.post("/plan/assignments", json=assignment_payload)
        assert resp.status_code == 201

    async def test_create_assignment_limit_10001_is_409(
        self, client: AsyncClient, db: AsyncSession, assignment_payload: dict[str, Any]
    ) -> None:
        """AC-079: 10,001st assignment → 409 (INV-010)."""
        # Bulk-insert 10,000 assignments directly
        assignments = [
            MealPlanAssignment(
                user_id=1,
                product_id=i,
                product_name=f"Product {i}",
                date=date(2026, 1, 1),
                meal_slot="breakfast",
                quantity=1.0,
                unit="unit",
            )
            for i in range(10_000)
        ]
        db.add_all(assignments)
        await db.commit()

        resp = await client.post("/plan/assignments", json=assignment_payload)
        assert resp.status_code == 409

    async def test_create_assignment_all_meal_slots(
        self,
        client: AsyncClient,
        assignment_payload: dict[str, Any],
    ) -> None:
        """FR-019: all meal slots are accepted."""
        for slot in ["breakfast", "lunch", "dinner", "snacks"]:
            payload = copy.deepcopy(assignment_payload)
            payload["meal_slot"] = slot
            payload["product_id"] = hash(slot) % 1000 + 1
            resp = await client.post("/plan/assignments", json=payload)
            assert resp.status_code == 201, f"slot={slot} failed"


# ---------------------------------------------------------------------------
# User isolation (INV-009)
# ---------------------------------------------------------------------------


class TestUserIsolation:
    """FR-017 — User isolation (AC-102)."""

    async def test_user1_assignments_not_visible_to_user2(
        self,
        client: AsyncClient,
        client_user2: AsyncClient,
        db: AsyncSession,
    ) -> None:
        """AC-102: Alice's assignments not visible to Bob (INV-009)."""
        await _seed_assignment(db, user_id=1)
        with patch(
            "mealplan.router.get_this_week_products",
            new=AsyncMock(return_value=[]),
        ):
            resp = await client_user2.get("/plan", params={"week": "2026-27"})
        assert resp.status_code == 200
        assert len(resp.json()["assignments"]) == 0

    async def test_user2_cannot_update_user1_assignment(
        self,
        client_user2: AsyncClient,
        db: AsyncSession,
    ) -> None:
        """INV-009: user 2 cannot update user 1's assignment → 403."""
        a = await _seed_assignment(db, user_id=1)
        resp = await client_user2.put(
            f"/plan/assignments/{a.id}", json={"quantity": 5.0}
        )
        assert resp.status_code == 403

    async def test_user2_cannot_delete_user1_assignment(
        self,
        client_user2: AsyncClient,
        db: AsyncSession,
    ) -> None:
        """INV-009: user 2 cannot delete user 1's assignment → 403."""
        a = await _seed_assignment(db, user_id=1)
        resp = await client_user2.delete(f"/plan/assignments/{a.id}")
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Update assignment (FR-017, FR-019)
# ---------------------------------------------------------------------------


class TestUpdateAssignment:
    """FR-017 / FR-019 — Update assignment (AC-051, AC-056)."""

    async def test_update_quantity_and_unit(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-051: toggle to grams → quantity and unit updated."""
        a = await _seed_assignment(db)
        resp = await client.put(
            f"/plan/assignments/{a.id}", json={"quantity": 200.0, "unit": "g"}
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["quantity"] == 200.0
        assert body["unit"] == "g"

    async def test_update_nonexistent_assignment_404(self, client: AsyncClient) -> None:
        """404 when updating an assignment that does not exist."""
        resp = await client.put("/plan/assignments/999999", json={"quantity": 1.0})
        assert resp.status_code == 404

    async def test_update_quantity_zero_422(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """quantity = 0 on update → 422 (INV-008)."""
        a = await _seed_assignment(db)
        resp = await client.put(f"/plan/assignments/{a.id}", json={"quantity": 0})
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Delete assignment (FR-017)
# ---------------------------------------------------------------------------


class TestDeleteAssignment:
    """FR-017 — Remove assignment (AC-050)."""

    async def test_delete_assignment(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-050: delete assignment → 200, gone from list."""
        a = await _seed_assignment(db)
        resp = await client.delete(f"/plan/assignments/{a.id}")
        assert resp.status_code == 200

        with patch(
            "mealplan.router.get_this_week_products",
            new=AsyncMock(return_value=[]),
        ):
            plan_resp = await client.get("/plan", params={"week": "2026-27"})
        ids = [x["id"] for x in plan_resp.json()["assignments"]]
        assert a.id not in ids

    async def test_delete_nonexistent_404(self, client: AsyncClient) -> None:
        """404 when deleting non-existent assignment."""
        resp = await client.delete("/plan/assignments/999999")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Move assignment (FR-019)
# ---------------------------------------------------------------------------


class TestMoveAssignment:
    """FR-019 — Move assignment to different slot/date (AC-055)."""

    async def test_move_assignment(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-055: move from Monday Lunch to Wednesday Dinner → updated."""
        a = await _seed_assignment(
            db, assignment_date=date(2026, 6, 29), meal_slot="lunch"
        )
        resp = await client.put(
            f"/plan/assignments/{a.id}/move",
            json={"date": "2026-07-01", "meal_slot": "dinner"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["date"] == "2026-07-01"
        assert body["meal_slot"] == "dinner"


# ---------------------------------------------------------------------------
# Search (FR-023)
# ---------------------------------------------------------------------------


class TestSearch:
    """FR-023 — Item search order (AC-062, AC-121)."""

    async def test_search_recently_used_first(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-062: recently used product appears first in search results."""
        # Seed an assignment for product 10 (recently used)
        await _seed_assignment(db, user_id=1, product_id=10, product_name="Oat Bran")

        catalog_products = [
            {"id": 5, "name": "Oat Flour", "owner_id": None},
            {"id": 10, "name": "Oat Bran", "owner_id": None},
            {"id": 20, "name": "Oat Milk", "owner_id": None},
        ]
        with patch(
            "mealplan.router.search_catalog_products",
            new=AsyncMock(return_value=catalog_products),
        ):
            resp = await client.get("/plan/search", params={"q": "oat"})
        assert resp.status_code == 200
        results = resp.json()
        assert len(results) == 3
        assert results[0]["id"] == 10  # recently used first

    async def test_search_no_history_alphabetical(
        self, client: AsyncClient
    ) -> None:
        """AC-121: no history → results are alphabetical."""
        catalog_products = [
            {"id": 3, "name": "Zucchini", "owner_id": None},
            {"id": 1, "name": "Apple", "owner_id": None},
            {"id": 2, "name": "Banana", "owner_id": None},
        ]
        with patch(
            "mealplan.router.search_catalog_products",
            new=AsyncMock(return_value=catalog_products),
        ):
            resp = await client.get("/plan/search", params={"q": "a"})
        assert resp.status_code == 200
        results = resp.json()
        names = [r["name"] for r in results]
        assert names == sorted(names, key=str.lower)

    async def test_search_user_owned_before_global(
        self, client: AsyncClient
    ) -> None:
        """User-owned products appear before global ones (when not recently used)."""
        catalog_products = [
            {"id": 1, "name": "Alpha Global", "owner_id": None},
            {"id": 2, "name": "Beta Owned", "owner_id": 1},  # owned by user 1
        ]
        with patch(
            "mealplan.router.search_catalog_products",
            new=AsyncMock(return_value=catalog_products),
        ):
            resp = await client.get("/plan/search", params={"q": "a"})
        assert resp.status_code == 200
        results = resp.json()
        # user-owned (id=2) should come before global (id=1)
        ids = [r["id"] for r in results]
        assert ids.index(2) < ids.index(1)


class TestCatalogSearchContract:
    """Outbound contract with Catalog GET /products (param name + response shape)."""

    async def test_search_sends_search_param_not_q(self) -> None:
        """search_catalog_products must use the param name Catalog reads (`search`).

        Catalog's GET /products declares `search`, not `q`; sending `q` is silently
        ignored and returns the unfiltered catalog. This asserts the wire contract that
        the other search tests bypass by mocking search_catalog_products.
        """
        import weekflag_reader.service as wfr

        fake_resp = AsyncMock()
        fake_resp.status_code = 200
        fake_resp.json = lambda: {"items": [{"id": 1, "name": "Oat Bran"}]}
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=fake_resp)

        with patch.object(wfr, "_catalog_client", mock_client):
            items = await wfr.search_catalog_products("oat")

        assert items == [{"id": 1, "name": "Oat Bran"}]
        _, kwargs = mock_client.get.call_args
        assert kwargs["params"] == {"search": "oat"}
