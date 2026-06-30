"""Tests for shopping list generation endpoints.

Covers: AC-070, AC-071, AC-072, AC-073, AC-074, AC-119
FR-027, FR-028, FR-029, INV-011
"""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import CATEGORY_MAP, WEEK_ASSIGNMENTS, make_assignment


# ---------------------------------------------------------------------------
# GET /shopping — auto-generate on navigation (FR-027)
# ---------------------------------------------------------------------------


class TestGetShoppingList:
    """FR-027 — Auto-generate on navigation (AC-070, AC-071)."""

    async def test_get_generates_list_when_none_exists(
        self, client: AsyncClient
    ) -> None:
        """AC-070: GET /shopping with plan assignments → list generated + returned."""
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=WEEK_ASSIGNMENTS),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value=CATEGORY_MAP),
            ),
        ):
            resp = await client.get("/shopping", headers={"Authorization": "Bearer test-token"})

        assert resp.status_code == 200
        body = resp.json()
        assert "id" in body
        assert "items" in body
        assert body["is_stale"] is False
        assert len(body["items"]) == 2  # Oats (aggregated) + Milk

    async def test_get_returns_empty_items_when_no_plan(
        self, client: AsyncClient
    ) -> None:
        """AC-071: no plan assignments → empty items list (no error)."""
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=[]),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value={}),
            ),
        ):
            resp = await client.get("/shopping", headers={"Authorization": "Bearer test-token"})

        assert resp.status_code == 200
        body = resp.json()
        assert body["items"] == []

    async def test_get_returns_existing_list_without_regenerating(
        self, client: AsyncClient
    ) -> None:
        """GET /shopping returns existing list on subsequent calls (no re-generation)."""
        # First call — generates
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=WEEK_ASSIGNMENTS),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value=CATEGORY_MAP),
            ),
        ):
            resp1 = await client.get("/shopping", headers={"Authorization": "Bearer test-token"})
        assert resp1.status_code == 200
        first_generated_at = resp1.json()["generated_at"]

        # Second call — should return same list without calling planning again
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=[]),  # would return empty if called
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value={}),
            ),
        ):
            resp2 = await client.get("/shopping", headers={"Authorization": "Bearer test-token"})

        assert resp2.status_code == 200
        # generated_at unchanged — not regenerated
        assert resp2.json()["generated_at"] == first_generated_at
        assert len(resp2.json()["items"]) == 2  # still has original items

    async def test_get_requires_auth(self, anon_client: AsyncClient) -> None:
        """GET /shopping without token → 401/403 (HTTPBearer requires credentials)."""
        resp = await anon_client.get("/shopping")
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# POST /shopping/generate — explicit date range (FR-028)
# ---------------------------------------------------------------------------


class TestGenerateShoppingList:
    """FR-028 — Custom date range (AC-072, AC-073)."""

    async def test_generate_explicit_range(self, client: AsyncClient) -> None:
        """AC-072: from=2026-07-01 to=2026-07-07 → list reflects only that range."""
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=WEEK_ASSIGNMENTS),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value=CATEGORY_MAP),
            ),
        ):
            resp = await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token"},
            )

        assert resp.status_code == 200
        body = resp.json()
        assert body["from_date"] == "2026-07-01"
        assert body["to_date"] == "2026-07-07"
        assert len(body["items"]) == 2

    async def test_generate_from_after_to_is_422(self, client: AsyncClient) -> None:
        """AC-073: from_date > to_date → 422 (INV-011)."""
        resp = await client.post(
            "/shopping/generate",
            json={"from_date": "2026-07-07", "to_date": "2026-07-01"},
            headers={"Authorization": "Bearer test-token"},
        )
        assert resp.status_code == 422

    async def test_generate_same_date_is_valid(self, client: AsyncClient) -> None:
        """from_date == to_date is valid (single day range)."""
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=[]),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value={}),
            ),
        ):
            resp = await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-01"},
                headers={"Authorization": "Bearer test-token"},
            )
        assert resp.status_code == 200

    @pytest.mark.parametrize(
        "from_date,to_date",
        [
            ("2026-07-07", "2026-07-01"),  # reversed
            ("2026-12-31", "2026-01-01"),  # large reversal
        ],
    )
    async def test_generate_invalid_ranges_422(
        self, client: AsyncClient, from_date: str, to_date: str
    ) -> None:
        """Property test: from_date > to_date always → 422 (INV-011)."""
        resp = await client.post(
            "/shopping/generate",
            json={"from_date": from_date, "to_date": to_date},
            headers={"Authorization": "Bearer test-token"},
        )
        assert resp.status_code == 422, f"expected 422 for {from_date}>{to_date}"

    async def test_generate_requires_auth(self, anon_client: AsyncClient) -> None:
        """POST /shopping/generate without token → 401/403."""
        resp = await anon_client.post(
            "/shopping/generate",
            json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
        )
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Aggregation (FR-029)
# ---------------------------------------------------------------------------


class TestAggregation:
    """FR-029 — Aggregate and group (AC-074, AC-119)."""

    async def test_aggregates_same_product_same_unit(
        self, client: AsyncClient
    ) -> None:
        """AC-074: Oats 100 g Mon + 50 g Tue → Oats 150 g under Grains."""
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=WEEK_ASSIGNMENTS),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value=CATEGORY_MAP),
            ),
        ):
            resp = await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token"},
            )

        assert resp.status_code == 200
        items = resp.json()["items"]

        oats = next((i for i in items if i["product_name"] == "Oats"), None)
        assert oats is not None, "Oats not in items"
        assert oats["total_quantity"] == 150.0
        assert oats["unit"] == "g"
        assert oats["category"] == "Grains"

    async def test_different_units_not_aggregated(
        self, client: AsyncClient
    ) -> None:
        """Oats 100 g + Oats 2 cups → separate rows (different units)."""
        assignments = [
            make_assignment(1, "Oats", 100.0, "g", "2026-07-01"),
            make_assignment(1, "Oats", 2.0, "cup", "2026-07-02"),
        ]
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=assignments),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value={1: "Grains"}),
            ),
        ):
            resp = await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token"},
            )

        assert resp.status_code == 200
        items = resp.json()["items"]
        oats_items = [i for i in items if i["product_name"] == "Oats"]
        assert len(oats_items) == 2, "Expected 2 separate Oats rows for different units"

    async def test_empty_plan_returns_empty_list(self, client: AsyncClient) -> None:
        """AC-119: empty plan for range → empty list (no error)."""
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=[]),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value={}),
            ),
        ):
            resp = await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token"},
            )

        assert resp.status_code == 200
        assert resp.json()["items"] == []

    async def test_upsert_replaces_previous_list(self, client: AsyncClient) -> None:
        """ADR-0008: generating a new list replaces the previous one."""
        # First generation: 2 items
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=WEEK_ASSIGNMENTS),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value=CATEGORY_MAP),
            ),
        ):
            resp1 = await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token"},
            )
        assert resp1.status_code == 200
        assert len(resp1.json()["items"]) == 2

        # Second generation: 1 item only
        single_assignment = [make_assignment(3, "Banana", 3.0, "piece", "2026-07-03")]
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=single_assignment),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value={3: "Fruits"}),
            ),
        ):
            resp2 = await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token"},
            )
        assert resp2.status_code == 200
        items2 = resp2.json()["items"]
        assert len(items2) == 1
        assert items2[0]["product_name"] == "Banana"

    async def test_category_none_when_catalog_unavailable(
        self, client: AsyncClient
    ) -> None:
        """Category falls back to None when Catalog is unavailable."""
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=[make_assignment(99, "Mystery Food", 100.0)]),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value={99: None}),
            ),
        ):
            resp = await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token"},
            )

        assert resp.status_code == 200
        items = resp.json()["items"]
        assert len(items) == 1
        assert items[0]["category"] is None

    async def test_user_isolation(
        self, client: AsyncClient, client_user2: AsyncClient
    ) -> None:
        """User 1's list is not visible to user 2 (separate lists per user)."""
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=WEEK_ASSIGNMENTS),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value=CATEGORY_MAP),
            ),
        ):
            # User 1 generates a list
            resp1 = await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token"},
            )
        assert resp1.status_code == 200
        assert len(resp1.json()["items"]) == 2

        # User 2 gets their own empty list
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=[]),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value={}),
            ),
        ):
            resp2 = await client_user2.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token-user2"},
            )
        assert resp2.status_code == 200
        assert resp2.json()["items"] == []
