"""Week-flag reader: fetch this-week flagged products from the Catalog service.

ADR-0002: Planning calls GET /products?week_flag=this_week&user_id=X on Catalog
at render time (sync REST, no event bus). Falls back gracefully to an empty list
if the Catalog service is unavailable.
"""

from __future__ import annotations

import logging
import os
from typing import Any

import httpx

_log = logging.getLogger(__name__)

# Module-level client — reused across requests for connection pooling.
# Replaced with a mock in tests.
_catalog_client = httpx.AsyncClient()


def _catalog_url() -> str:
    return os.environ.get("CATALOG_SERVICE_URL", "http://catalog:8000")


async def get_this_week_products(user_id: int) -> list[dict[str, Any]]:
    """Return products flagged 'this_week' for the given user.

    Falls back to [] if the Catalog service is unavailable or returns an error.
    """
    url = _catalog_url()
    try:
        resp = await _catalog_client.get(
            f"{url}/products",
            params={"week_flag": "this_week", "user_id": str(user_id)},
            timeout=5.0,
        )
        if resp.status_code == 200:
            return resp.json().get("items", [])  # type: ignore[no-any-return]
        _log.warning("Catalog returned %d for week flags", resp.status_code)
        return []
    except httpx.HTTPError as exc:
        _log.warning("Catalog unavailable for week flags: %s", exc)
        return []


async def search_catalog_products(q: str) -> list[dict[str, Any]]:
    """Search products in the Catalog service by name query.

    Returns [] on any error — callers should handle empty gracefully.
    """
    url = _catalog_url()
    try:
        resp = await _catalog_client.get(
            f"{url}/products",
            params={"search": q},  # Catalog GET /products reads `search`, not `q`
            timeout=5.0,
        )
        if resp.status_code == 200:
            return resp.json().get("items", [])  # type: ignore[no-any-return]
        _log.warning("Catalog returned %d for search", resp.status_code)
        return []
    except httpx.HTTPError as exc:
        _log.warning("Catalog unavailable for search: %s", exc)
        return []
