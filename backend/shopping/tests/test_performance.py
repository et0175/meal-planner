"""Performance benchmarks for the Shopping List service.

NFR-003: list generation must complete in < 500ms for a fully planned 31-day range.
Benchmark: 31 days × 4 meal slots × 5 items per slot = 620 assignments.
"""

from __future__ import annotations

import time
from datetime import date, timedelta
from typing import Any
from unittest.mock import AsyncMock, patch

from httpx import AsyncClient


def _make_31_day_assignments() -> list[dict[str, Any]]:
    """Generate 620 mock assignments: 31 days × 4 slots × 5 products."""
    slots = ["breakfast", "lunch", "dinner", "snacks"]
    products = [
        {"id": 1, "name": "Oats", "unit": "g"},
        {"id": 2, "name": "Milk", "unit": "ml"},
        {"id": 3, "name": "Banana", "unit": "piece"},
        {"id": 4, "name": "Chicken", "unit": "g"},
        {"id": 5, "name": "Rice", "unit": "g"},
    ]

    assignments = []
    start = date(2026, 7, 1)
    for day_offset in range(31):
        day = start + timedelta(days=day_offset)
        for slot in slots:
            for product in products:
                assignments.append(
                    {
                        "id": day_offset * 100 + len(assignments),
                        "user_id": 1,
                        "product_id": product["id"],
                        "product_name": product["name"],
                        "date": day.isoformat(),
                        "meal_slot": slot,
                        "quantity": 100.0,
                        "unit": product["unit"],
                        "kcal_per_unit": None,
                    }
                )
    return assignments


_BENCHMARK_ASSIGNMENTS = _make_31_day_assignments()
_BENCHMARK_CATEGORIES = {
    1: "Grains",
    2: "Dairy",
    3: "Fruits",
    4: "Proteins",
    5: "Grains",
}


class TestPerformance:
    """NFR-003 — Generation < 500ms for 31-day range."""

    async def test_generate_31_days_under_500ms(self, client: AsyncClient) -> None:
        """NFR-003: 31 days × 4 slots × 5 items = 620 assignments aggregated in < 500ms.

        HTTP calls (planning + catalog) are mocked; budget covers aggregation + DB upsert.
        """
        assert len(_BENCHMARK_ASSIGNMENTS) == 620, "Expected 620 assignments"

        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=_BENCHMARK_ASSIGNMENTS),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value=_BENCHMARK_CATEGORIES),
            ),
        ):
            start = time.monotonic()
            resp = await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-31"},
                headers={"Authorization": "Bearer test-token"},
            )
            elapsed = time.monotonic() - start

        assert resp.status_code == 200
        body = resp.json()

        # 620 assignments across 5 products × 4 units = 5 unique (product_id, unit) pairs
        # (each product always uses the same unit in our test data)
        assert len(body["items"]) == 5, f"Expected 5 aggregated items, got {len(body['items'])}"

        # Verify aggregation: each product appears once, quantity = 31 days × 4 slots × 100.0
        expected_qty = 31 * 4 * 100.0  # 12,400 per product
        for item in body["items"]:
            assert item["total_quantity"] == expected_qty, (
                f"{item['product_name']}: expected {expected_qty}, got {item['total_quantity']}"
            )

        # NFR-003 gate
        assert elapsed < 0.5, (
            f"List generation took {elapsed * 1000:.0f}ms for 31 days "
            f"(must be < 500ms, NFR-003)"
        )

    async def test_generate_31_days_regeneration_under_500ms(
        self, client: AsyncClient
    ) -> None:
        """NFR-003: regeneration (upsert path) also completes in < 500ms."""
        # First generation
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=_BENCHMARK_ASSIGNMENTS),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value=_BENCHMARK_CATEGORIES),
            ),
        ):
            await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-31"},
                headers={"Authorization": "Bearer test-token"},
            )

        # Re-generation (upsert path — deletes old items + inserts new)
        with (
            patch(
                "generator.service.fetch_assignments_for_range",
                new=AsyncMock(return_value=_BENCHMARK_ASSIGNMENTS),
            ),
            patch(
                "generator.service.fetch_categories",
                new=AsyncMock(return_value=_BENCHMARK_CATEGORIES),
            ),
        ):
            start = time.monotonic()
            resp = await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-31"},
                headers={"Authorization": "Bearer test-token"},
            )
            elapsed = time.monotonic() - start

        assert resp.status_code == 200
        assert elapsed < 0.5, (
            f"Re-generation took {elapsed * 1000:.0f}ms (must be < 500ms, NFR-003)"
        )
