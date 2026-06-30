"""Shopping list generation business logic.

COMP-020: ShoppingListGenerator
ADR-0008: single active list per user — upsert model (delete items + update list)
NFR-003: generation < 500ms for a fully planned 31-day range
"""

from __future__ import annotations

import logging
from collections import defaultdict
from datetime import date, datetime, timezone
from typing import Any

from db.models import ShoppingList, ShoppingListItem
from generator.catalog_client import fetch_categories
from generator.planning_client import fetch_assignments_for_range
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

_log = logging.getLogger(__name__)


def _current_iso_week_range() -> tuple[date, date]:
    """Return (monday, sunday) of the current ISO week (ADR-0007)."""
    today = date.today()
    iso = today.isocalendar()
    monday = date.fromisocalendar(iso.year, iso.week, 1)
    sunday = date.fromisocalendar(iso.year, iso.week, 7)
    return monday, sunday


def _aggregate_assignments(
    assignments: list[dict[str, Any]],
    categories: dict[int, str | None],
) -> list[dict[str, Any]]:
    """Aggregate assignment quantities by (product_id, unit).

    Returns list of aggregated dicts with keys:
    product_id, product_name, category, total_quantity, unit.

    Same product in different units → separate rows.
    """
    # Key: (product_id, unit) → {product_name, category, total_quantity}
    totals: dict[tuple[int, str], dict[str, Any]] = defaultdict(
        lambda: {"total_quantity": 0.0, "product_name": "", "category": None}
    )

    for a in assignments:
        product_id: int = a.get("product_id", 0)
        unit: str = a.get("unit", "")
        quantity: float = float(a.get("quantity", 0.0))
        product_name: str = a.get("product_name", "")

        key = (product_id, unit)
        totals[key]["total_quantity"] += quantity
        totals[key]["product_name"] = product_name  # last write wins — should be same
        totals[key]["category"] = categories.get(product_id)

    result = []
    for (product_id, unit), data in totals.items():
        result.append(
            {
                "product_id": product_id,
                "product_name": data["product_name"],
                "category": data["category"],
                "total_quantity": data["total_quantity"],
                "unit": unit,
            }
        )

    # Sort: by category (None last), then product name
    result.sort(
        key=lambda x: (x["category"] is None, x["category"] or "", x["product_name"].lower())
    )
    return result


async def _get_existing_list(db: AsyncSession, user_id: int) -> ShoppingList | None:
    """Return the user's current shopping list, or None."""
    stmt = select(ShoppingList).where(ShoppingList.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def _get_list_items(db: AsyncSession, list_id: int) -> list[ShoppingListItem]:
    """Return all items for a shopping list."""
    stmt = select(ShoppingListItem).where(ShoppingListItem.list_id == list_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_or_generate_list(
    db: AsyncSession,
    user_id: int,
    token: str,
) -> tuple[ShoppingList, list[ShoppingListItem]]:
    """Return existing list, or generate one for the current ISO week if none exists.

    GET /shopping — AC-070, AC-071.
    EVT-020 emitted (logged) on first generate.
    """
    existing = await _get_existing_list(db, user_id)
    if existing is not None:
        items = await _get_list_items(db, existing.id)
        return existing, items

    # No list yet — generate for current ISO week (ADR-0007)
    from_date, to_date = _current_iso_week_range()
    shopping_list, items = await generate_list(
        db, user_id=user_id, from_date=from_date, to_date=to_date, token=token
    )
    _log.info("EVT-020 shopping_list_generated user=%d", user_id)
    return shopping_list, items


async def generate_list(
    db: AsyncSession,
    *,
    user_id: int,
    from_date: date,
    to_date: date,
    token: str,
) -> tuple[ShoppingList, list[ShoppingListItem]]:
    """(Re)generate shopping list for an explicit date range.

    POST /shopping/generate — AC-072, AC-073, AC-074, AC-119.
    Upsert model (ADR-0008): replace all items for this user.
    EVT-020 emitted (logged) by caller.
    """
    # 1. Fetch assignments from Planning (concurrent per week)
    assignments = await fetch_assignments_for_range(from_date, to_date, token)

    # 2. Fetch categories from Catalog (concurrent per unique product)
    unique_product_ids = list({a.get("product_id") for a in assignments if a.get("product_id")})
    categories = await fetch_categories(unique_product_ids)

    # 3. Aggregate quantities
    aggregated = _aggregate_assignments(assignments, categories)

    # 4. Upsert the list record
    existing = await _get_existing_list(db, user_id)
    now = datetime.now(tz=timezone.utc)

    if existing is not None:
        # Delete old items
        await db.execute(
            delete(ShoppingListItem).where(ShoppingListItem.list_id == existing.id)
        )
        # Update list metadata
        existing.from_date = from_date
        existing.to_date = to_date
        existing.is_stale = False
        existing.generated_at = now
        shopping_list = existing
    else:
        shopping_list = ShoppingList(
            user_id=user_id,
            from_date=from_date,
            to_date=to_date,
            is_stale=False,
            generated_at=now,
        )
        db.add(shopping_list)
        await db.flush()  # get the ID

    # 5. Insert new items
    items: list[ShoppingListItem] = []
    for agg in aggregated:
        item = ShoppingListItem(
            list_id=shopping_list.id,
            product_id=agg["product_id"],
            product_name=agg["product_name"],
            category=agg["category"],
            total_quantity=agg["total_quantity"],
            unit=agg["unit"],
        )
        db.add(item)
        items.append(item)

    await db.commit()
    await db.refresh(shopping_list)
    return shopping_list, items


async def mark_list_stale(db: AsyncSession, user_id: int, assignment_date: date) -> bool:
    """Mark the user's shopping list stale if assignment_date falls within its range.

    COMP-021: StalenessService.
    Called by POST /shopping/events/plan-changed (EVT-012/013/014 stub).
    Emits EVT-023 (logged) and INV-012 when stale.
    Returns True if the list was marked stale, False otherwise.
    """
    existing = await _get_existing_list(db, user_id)
    if existing is None:
        return False

    # Only mark stale if the changed assignment falls within this list's range (INV-012)
    if existing.from_date <= assignment_date <= existing.to_date:
        existing.is_stale = True
        await db.commit()
        _log.info(
            "EVT-023 shopping_list_stale user=%d list=%d date=%s",
            user_id,
            existing.id,
            assignment_date,
        )
        return True
    return False


async def refresh_list(
    db: AsyncSession,
    user_id: int,
    token: str,
) -> tuple[ShoppingList, list[ShoppingListItem]]:
    """Regenerate from stored date range, clear the stale flag.

    POST /shopping/refresh — AC-075, AC-076.
    EVT-021 emitted (logged) by caller.
    Falls back to current ISO week if no list exists yet.
    """
    existing = await _get_existing_list(db, user_id)
    if existing is not None:
        from_date, to_date = existing.from_date, existing.to_date
    else:
        from_date, to_date = _current_iso_week_range()

    return await generate_list(
        db, user_id=user_id, from_date=from_date, to_date=to_date, token=token
    )
