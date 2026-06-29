"""Tests for PDF export endpoint.

Covers: AC-068, AC-069, NFR-004 (< 3 s)
"""

from __future__ import annotations

import time
from datetime import date

from db.models import MealPlanAssignment
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


class TestPdfExport:
    """FR-026 — PDF export (AC-068, AC-069, NFR-004)."""

    async def test_export_pdf_with_assignments(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-068: assignments exist → PDF returned."""
        db.add(
            MealPlanAssignment(
                user_id=1,
                product_id=1,
                product_name="Chicken Breast",
                date=date(2026, 6, 29),
                meal_slot="lunch",
                quantity=200.0,
                unit="g",
            )
        )
        await db.commit()

        resp = await client.post("/plan/export/pdf", params={"week": "2026-27"})
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"
        assert len(resp.content) > 100  # non-empty PDF

    async def test_export_pdf_empty_week(self, client: AsyncClient) -> None:
        """AC-069: empty week → empty-plan PDF (no error)."""
        resp = await client.post("/plan/export/pdf", params={"week": "2099-01"})
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"
        assert len(resp.content) > 100  # still generates a PDF with title

    async def test_export_pdf_within_3_seconds(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """NFR-004: PDF export completes in < 3 s."""
        # Seed 50 assignments (realistic load)
        from datetime import timedelta

        monday = date(2026, 6, 29)
        assignments = [
            MealPlanAssignment(
                user_id=1,
                product_id=i + 1,
                product_name=f"Product {i}",
                date=monday + timedelta(days=i % 7),
                meal_slot=["breakfast", "lunch", "dinner", "snacks"][i % 4],
                quantity=float(i + 1),
                unit="unit",
            )
            for i in range(50)
        ]
        db.add_all(assignments)
        await db.commit()

        start = time.monotonic()
        resp = await client.post("/plan/export/pdf", params={"week": "2026-27"})
        elapsed = time.monotonic() - start

        assert resp.status_code == 200
        assert elapsed < 3.0, f"PDF export took {elapsed:.2f}s (NFR-004 requires < 3s)"

    async def test_export_pdf_filename_header(self, client: AsyncClient) -> None:
        """PDF response has correct Content-Disposition filename."""
        resp = await client.post("/plan/export/pdf", params={"week": "2026-27"})
        assert resp.status_code == 200
        assert "meal-plan-2026-27.pdf" in resp.headers.get("content-disposition", "")
