"""Tests for PDF export endpoint.

Covers: AC-077, AC-120
FR-031, NFR-004 (PDF < 3s)
"""

from __future__ import annotations

import time
from unittest.mock import AsyncMock, patch

from httpx import AsyncClient

from tests.conftest import CATEGORY_MAP, WEEK_ASSIGNMENTS


class TestPdfExport:
    """FR-031 — PDF export (AC-077, AC-120)."""

    async def test_pdf_export_returns_pdf_bytes(self, client: AsyncClient) -> None:
        """AC-077: generated list → PDF response (application/pdf content type)."""
        # First generate a list
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
            await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token"},
            )

        # Export PDF
        resp = await client.post(
            "/shopping/export/pdf", headers={"Authorization": "Bearer test-token"}
        )
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"
        assert len(resp.content) > 0
        # PDF starts with %PDF
        assert resp.content[:4] == b"%PDF"

    async def test_pdf_export_no_list_returns_empty_pdf(self, client: AsyncClient) -> None:
        """AC-120: no list / empty list → empty-list PDF (no error)."""
        resp = await client.post(
            "/shopping/export/pdf", headers={"Authorization": "Bearer test-token"}
        )
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"
        assert resp.content[:4] == b"%PDF"

    async def test_pdf_export_empty_list_no_error(self, client: AsyncClient) -> None:
        """AC-120: empty shopping list (no items) → PDF generated without error."""
        # Generate empty list
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
            await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token"},
            )

        resp = await client.post(
            "/shopping/export/pdf", headers={"Authorization": "Bearer test-token"}
        )
        assert resp.status_code == 200
        assert resp.content[:4] == b"%PDF"

    async def test_pdf_export_completion_under_3s(self, client: AsyncClient) -> None:
        """NFR-004: PDF generation completes in < 3s."""
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
            await client.post(
                "/shopping/generate",
                json={"from_date": "2026-07-01", "to_date": "2026-07-07"},
                headers={"Authorization": "Bearer test-token"},
            )

        start = time.monotonic()
        resp = await client.post(
            "/shopping/export/pdf", headers={"Authorization": "Bearer test-token"}
        )
        elapsed = time.monotonic() - start

        assert resp.status_code == 200
        assert elapsed < 3.0, f"PDF generation took {elapsed:.2f}s, must be < 3s (NFR-004)"

    async def test_pdf_requires_auth(self, anon_client: AsyncClient) -> None:
        """POST /shopping/export/pdf without token → 401/403."""
        resp = await anon_client.post("/shopping/export/pdf")
        assert resp.status_code in (401, 403)
