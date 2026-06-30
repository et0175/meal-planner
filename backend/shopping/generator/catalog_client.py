"""HTTP client for the Catalog service — category lookup only.

Called after aggregating assignments from Planning to enrich items with
category names for PDF grouping. Best-effort: falls back to None per product.
"""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

import httpx

_log = logging.getLogger(__name__)

# Module-level client — reused across requests.
# Closed by the lifespan shutdown hook in main.py.
_catalog_client = httpx.AsyncClient()


def _catalog_url() -> str:
    return os.environ.get("CATALOG_SERVICE_URL", "http://catalog:8000")


async def _fetch_product_category(product_id: int) -> tuple[int, str | None]:
    """Fetch a single product's category from Catalog.

    Returns (product_id, category) — category is None on error.
    Catalog's GET /products/{id} is a public endpoint (no auth needed).
    """
    url = _catalog_url()
    try:
        resp = await _catalog_client.get(
            f"{url}/products/{product_id}",
            timeout=5.0,
        )
        if resp.status_code == 200:
            data: dict[str, Any] = resp.json()
            return product_id, data.get("category")
        _log.debug("Catalog returned %d for product %d", resp.status_code, product_id)
        return product_id, None
    except httpx.HTTPError as exc:
        _log.debug("Catalog unavailable for product %d: %s", product_id, exc)
        return product_id, None


async def fetch_categories(product_ids: list[int]) -> dict[int, str | None]:
    """Fetch category for each product_id concurrently.

    Returns {product_id: category_or_None}.
    """
    if not product_ids:
        return {}
    results = await asyncio.gather(*[_fetch_product_category(pid) for pid in product_ids])
    return dict(results)
