"""Meal plan assignment business logic — CRUD, search."""

from __future__ import annotations

from datetime import date
from typing import Any

from db.models import MealPlanAssignment, MealSlot
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

_MAX_ASSIGNMENTS = 10_000  # INV-010


class AssignmentLimitError(Exception):
    """Raised when user reaches the 10,000 assignment limit (INV-010)."""


class NotFoundError(Exception):
    """Raised when a requested assignment does not exist."""


class AuthorizationError(Exception):
    """Raised when user tries to access another user's assignment (INV-009)."""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _parse_iso_week(week_str: str) -> tuple[date, date]:
    """Parse 'YYYY-WNN' or 'YYYY-NN' into (monday, sunday) date objects."""
    parts = week_str.split("-")
    if len(parts) != 2:  # noqa: PLR2004
        raise ValueError(f"Invalid week format: {week_str!r}. Expected YYYY-WNN")
    year, week = int(parts[0]), int(parts[1].lstrip("W"))
    monday = date.fromisocalendar(year, week, 1)
    sunday = date.fromisocalendar(year, week, 7)
    return monday, sunday


def _current_iso_week() -> str:
    """Return the current ISO week as 'YYYY-WNN'."""
    today = date.today()
    iso = today.isocalendar()
    return f"{iso.year}-W{iso.week:02d}"


# ---------------------------------------------------------------------------
# Queries
# ---------------------------------------------------------------------------


async def list_assignments(
    db: AsyncSession,
    *,
    user_id: int,
    week: str | None = None,
) -> tuple[list[MealPlanAssignment], str]:
    """Return assignments for a week (defaults to current ISO week).

    Returns (assignments, resolved_week_str).
    """
    resolved_week = week if week and week != "current" else _current_iso_week()
    monday, sunday = _parse_iso_week(resolved_week)

    stmt = (
        select(MealPlanAssignment)
        .where(
            MealPlanAssignment.user_id == user_id,
            MealPlanAssignment.date >= monday,
            MealPlanAssignment.date <= sunday,
        )
        .order_by(MealPlanAssignment.date, MealPlanAssignment.meal_slot, MealPlanAssignment.id)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all()), resolved_week


async def get_assignment(
    db: AsyncSession, assignment_id: int, user_id: int
) -> MealPlanAssignment:
    """Fetch one assignment; raises NotFoundError or AuthorizationError."""
    stmt = select(MealPlanAssignment).where(MealPlanAssignment.id == assignment_id)
    result = await db.execute(stmt)
    assignment = result.scalar_one_or_none()
    if assignment is None:
        raise NotFoundError(f"Assignment {assignment_id} not found")
    if assignment.user_id != user_id:
        raise AuthorizationError(
            f"Assignment {assignment_id} belongs to a different user (INV-009)"
        )
    return assignment


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------


async def _count_user_assignments(db: AsyncSession, user_id: int) -> int:
    stmt = select(func.count(MealPlanAssignment.id)).where(
        MealPlanAssignment.user_id == user_id
    )
    result = await db.execute(stmt)
    return result.scalar_one()


async def create_assignment(
    db: AsyncSession,
    *,
    user_id: int,
    product_id: int,
    product_name: str,
    assignment_date: date,
    meal_slot: MealSlot,
    quantity: float,
    unit: str,
    kcal_per_unit: float | None = None,
    protein_g_per_unit: float | None = None,
    fat_g_per_unit: float | None = None,
    carbs_g_per_unit: float | None = None,
) -> MealPlanAssignment:
    """Create a new assignment.

    Raises AssignmentLimitError if user already has 10,000 assignments (INV-010).
    """
    count = await _count_user_assignments(db, user_id)
    if count >= _MAX_ASSIGNMENTS:
        raise AssignmentLimitError(
            f"User {user_id} has reached the maximum of {_MAX_ASSIGNMENTS} assignments (INV-010)"
        )

    assignment = MealPlanAssignment(
        user_id=user_id,
        product_id=product_id,
        product_name=product_name,
        date=assignment_date,
        meal_slot=meal_slot,
        quantity=quantity,
        unit=unit,
        kcal_per_unit=kcal_per_unit,
        protein_g_per_unit=protein_g_per_unit,
        fat_g_per_unit=fat_g_per_unit,
        carbs_g_per_unit=carbs_g_per_unit,
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment


async def update_assignment(
    db: AsyncSession,
    assignment_id: int,
    user_id: int,
    *,
    quantity: float | None = None,
    unit: str | None = None,
    kcal_per_unit: float | None = None,
    protein_g_per_unit: float | None = None,
    fat_g_per_unit: float | None = None,
    carbs_g_per_unit: float | None = None,
) -> MealPlanAssignment:
    """Update quantity/unit/nutrition on an assignment (EVT-012).

    Raises NotFoundError, AuthorizationError.
    """
    assignment = await get_assignment(db, assignment_id, user_id)
    if quantity is not None:
        assignment.quantity = quantity
    if unit is not None:
        assignment.unit = unit
    if kcal_per_unit is not None:
        assignment.kcal_per_unit = kcal_per_unit
    if protein_g_per_unit is not None:
        assignment.protein_g_per_unit = protein_g_per_unit
    if fat_g_per_unit is not None:
        assignment.fat_g_per_unit = fat_g_per_unit
    if carbs_g_per_unit is not None:
        assignment.carbs_g_per_unit = carbs_g_per_unit
    await db.commit()
    await db.refresh(assignment)
    return assignment


async def delete_assignment(
    db: AsyncSession,
    assignment_id: int,
    user_id: int,
) -> None:
    """Delete an assignment (EVT-013).

    Raises NotFoundError, AuthorizationError.
    """
    assignment = await get_assignment(db, assignment_id, user_id)
    await db.delete(assignment)
    await db.commit()


async def move_assignment(
    db: AsyncSession,
    assignment_id: int,
    user_id: int,
    *,
    new_date: date,
    new_meal_slot: MealSlot,
) -> MealPlanAssignment:
    """Move assignment to a different date/slot (EVT-014).

    Raises NotFoundError, AuthorizationError.
    """
    assignment = await get_assignment(db, assignment_id, user_id)
    assignment.date = new_date
    assignment.meal_slot = new_meal_slot
    await db.commit()
    await db.refresh(assignment)
    return assignment


# ---------------------------------------------------------------------------
# Search (FR-023 / AC-062)
# ---------------------------------------------------------------------------


async def _get_recent_product_ids(db: AsyncSession, user_id: int) -> list[int]:
    """Return product_ids used by this user, most-recently-assigned first."""
    stmt = (
        select(
            MealPlanAssignment.product_id,
            func.max(MealPlanAssignment.updated_at).label("last_used"),
        )
        .where(MealPlanAssignment.user_id == user_id)
        .group_by(MealPlanAssignment.product_id)
        .order_by(func.max(MealPlanAssignment.updated_at).desc())
        .limit(100)
    )
    result = await db.execute(stmt)
    return [row[0] for row in result.all()]


async def search_items(
    db: AsyncSession,
    *,
    user_id: int,
    q: str,
    catalog_products: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Sort catalog search results: recently used first, user-owned second, then alphabetical.

    FR-023: AC-062 (recently used first), AC-121 (no history → alphabetical).
    catalog_products: raw product dicts from Catalog service.
    """
    recent_ids = await _get_recent_product_ids(db, user_id)
    recent_set = {pid: idx for idx, pid in enumerate(recent_ids)}

    def sort_key(p: dict[str, Any]) -> tuple[int, int, str]:
        pid = p.get("id", 0)
        owner = p.get("owner_id")
        # Tier 0 = recently used; tier 1 = user-owned (not recently used); tier 2 = rest
        if pid in recent_set:
            tier = 0
            sub = recent_set[pid]
        elif owner == user_id:
            tier = 1
            sub = 0
        else:
            tier = 2
            sub = 0
        return (tier, sub, p.get("name", "").lower())

    return sorted(catalog_products, key=sort_key)
