"""Tests for shopping list staleness detection and refresh.

Covers: AC-075, AC-076, AC-103, AC-104, AC-105
FR-030, ADR-0003, INV-012, POL-002, POL-003, POL-004, POL-005
"""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, patch

from httpx import AsyncClient

from tests.conftest import CATEGORY_MAP, WEEK_ASSIGNMENTS


async def _generate_list(client: AsyncClient) -> dict[str, Any]:
    """Helper: generate a shopping list for 2026-07-01..2026-07-07."""
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
    return resp.json()


class TestStaleness:
    """FR-030 — Staleness detection (AC-075, AC-103, AC-104, AC-105)."""

    async def test_list_is_not_stale_after_generate(
        self, client: AsyncClient
    ) -> None:
        """Freshly generated list has is_stale=False."""
        body = await _generate_list(client)
        assert body["is_stale"] is False

    async def test_plan_event_within_range_marks_stale(
        self, client: AsyncClient
    ) -> None:
        """AC-103/AC-075: EVT-012 within range → list marked stale (EVT-023, INV-012)."""
        await _generate_list(client)

        # Send a plan-changed event for a date within the list range
        resp = await client.post(
            "/shopping/events/plan-changed",
            json={"event_type": "assignment_updated", "assignment_date": "2026-07-03"},
            headers={"Authorization": "Bearer test-token"},
        )
        assert resp.status_code == 200
        assert "stale" in resp.json()["detail"].lower()

        # GET /shopping now returns the stale list
        resp2 = await client.get("/shopping", headers={"Authorization": "Bearer test-token"})
        assert resp2.status_code == 200
        assert resp2.json()["is_stale"] is True

    async def test_plan_event_outside_range_does_not_mark_stale(
        self, client: AsyncClient
    ) -> None:
        """INV-012: plan event for date outside list range → list stays fresh."""
        await _generate_list(client)

        # Send event for a date OUTSIDE the 2026-07-01..07 range
        resp = await client.post(
            "/shopping/events/plan-changed",
            json={"event_type": "assignment_updated", "assignment_date": "2026-08-01"},
            headers={"Authorization": "Bearer test-token"},
        )
        assert resp.status_code == 200
        # "no action" response
        assert "no active list in range" in resp.json()["detail"].lower()

        # List is still fresh
        resp2 = await client.get("/shopping", headers={"Authorization": "Bearer test-token"})
        assert resp2.status_code == 200
        assert resp2.json()["is_stale"] is False

    async def test_assignment_removed_within_range_marks_stale(
        self, client: AsyncClient
    ) -> None:
        """AC-104: EVT-013 (PlanAssignmentRemoved) within range → list stale (POL-004)."""
        await _generate_list(client)

        resp = await client.post(
            "/shopping/events/plan-changed",
            json={"event_type": "assignment_removed", "assignment_date": "2026-07-05"},
            headers={"Authorization": "Bearer test-token"},
        )
        assert resp.status_code == 200

        resp2 = await client.get("/shopping", headers={"Authorization": "Bearer test-token"})
        assert resp2.json()["is_stale"] is True

    async def test_assignment_moved_outside_range_marks_stale(
        self, client: AsyncClient
    ) -> None:
        """AC-105: EVT-014 (PlanAssignmentMoved) outside range → list stale (POL-005)."""
        await _generate_list(client)

        # Assignment moved OUT of the range — but the original date was inside
        resp = await client.post(
            "/shopping/events/plan-changed",
            json={"event_type": "assignment_moved", "assignment_date": "2026-07-07"},
            headers={"Authorization": "Bearer test-token"},
        )
        assert resp.status_code == 200

        resp2 = await client.get("/shopping", headers={"Authorization": "Bearer test-token"})
        assert resp2.json()["is_stale"] is True

    async def test_plan_event_no_list_returns_graceful(
        self, client: AsyncClient
    ) -> None:
        """Plan event with no list → graceful response, no error."""
        resp = await client.post(
            "/shopping/events/plan-changed",
            json={"event_type": "assignment_updated", "assignment_date": "2026-07-03"},
            headers={"Authorization": "Bearer test-token"},
        )
        assert resp.status_code == 200
        assert "no active list in range" in resp.json()["detail"].lower()


class TestRefresh:
    """FR-030 — Refresh clears staleness (AC-075, AC-076)."""

    async def test_refresh_clears_stale_flag(self, client: AsyncClient) -> None:
        """AC-076: POST /shopping/refresh → EVT-021 + list regenerated + is_stale=False."""
        # Generate then mark stale
        await _generate_list(client)
        await client.post(
            "/shopping/events/plan-changed",
            json={"event_type": "assignment_updated", "assignment_date": "2026-07-04"},
            headers={"Authorization": "Bearer test-token"},
        )

        # Verify stale
        resp_check = await client.get(
            "/shopping", headers={"Authorization": "Bearer test-token"}
        )
        assert resp_check.json()["is_stale"] is True

        # Refresh
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
            resp_refresh = await client.post(
                "/shopping/refresh", headers={"Authorization": "Bearer test-token"}
            )

        assert resp_refresh.status_code == 200
        body = resp_refresh.json()
        assert body["is_stale"] is False
        assert len(body["items"]) == 2

    async def test_refresh_without_existing_list(self, client: AsyncClient) -> None:
        """POST /shopping/refresh with no existing list → generates for current week."""
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
                "/shopping/refresh", headers={"Authorization": "Bearer test-token"}
            )

        assert resp.status_code == 200
        assert resp.json()["is_stale"] is False

    async def test_refresh_requires_auth(self, anon_client: AsyncClient) -> None:
        """POST /shopping/refresh without token → 401/403."""
        resp = await anon_client.post("/shopping/refresh")
        assert resp.status_code in (401, 403)
