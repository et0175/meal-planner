"""HTTP client for the Planning service.

ADR-0002: Shopping reads plan assignments via sync REST calls to Planning.
Token forwarding: the user's Bearer token is forwarded so Planning can
authenticate and return the correct user's assignments.
"""

from __future__ import annotations

import asyncio
import logging
import os
from datetime import date, timedelta
from typing import Any

import httpx

_log = logging.getLogger(__name__)

# Module-level client — reused across requests.
# Closed by the lifespan shutdown hook in main.py.
_planning_client = httpx.AsyncClient()


def _planning_url() -> str:
    return os.environ.get("PLANNING_SERVICE_URL", "http://planning:8000")


def _iso_weeks_in_range(from_date: date, to_date: date) -> list[str]:
    """Return ISO 'YYYY-WW' strings for every week that overlaps [from_date, to_date]."""
    weeks: list[str] = []
    current = from_date
    while current <= to_date:
        iso = current.isocalendar()
        week_str = f"{iso.year}-{iso.week:02d}"
        if week_str not in weeks:
            weeks.append(week_str)
        # Advance to the Monday of the *next* week
        monday = date.fromisocalendar(iso.year, iso.week, 1)
        current = monday + timedelta(days=7)
    return weeks


async def _fetch_week(week: str, token: str) -> list[dict[str, Any]]:
    """Fetch assignments for one ISO week from the Planning service.

    Returns empty list on any error (graceful degradation).
    """
    url = _planning_url()
    try:
        resp = await _planning_client.get(
            f"{url}/plan",
            params={"week": week},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10.0,
        )
        if resp.status_code == 200:
            data = resp.json()
            return data.get("assignments", [])  # type: ignore[no-any-return]
        _log.warning("Planning returned %d for week %s", resp.status_code, week)
        return []
    except httpx.HTTPError as exc:
        _log.warning("Planning unavailable for week %s: %s", week, exc)
        return []


async def fetch_assignments_for_range(
    from_date: date,
    to_date: date,
    token: str,
) -> list[dict[str, Any]]:
    """Fetch all plan assignments in [from_date, to_date] from Planning.

    Calls Planning once per ISO week (concurrent), then filters assignments
    to only those whose date falls within the requested range.
    """
    weeks = _iso_weeks_in_range(from_date, to_date)
    results = await asyncio.gather(*[_fetch_week(w, token) for w in weeks])

    # Flatten and filter to the exact date range
    all_assignments: list[dict[str, Any]] = []
    for week_assignments in results:
        for a in week_assignments:
            a_date_str: str | None = a.get("date")
            if a_date_str is None:
                continue
            try:
                a_date = date.fromisoformat(a_date_str)
            except ValueError:
                continue
            if from_date <= a_date <= to_date:
                all_assignments.append(a)
    return all_assignments
