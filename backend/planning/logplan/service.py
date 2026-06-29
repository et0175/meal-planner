"""Log-from-plan business logic — create TrackingEntry rows (ADR-0001, COMP-016).

Writes to the tracking_entries table in the Planning DB.
Read UI is deferred to Personal Cabinet v1.1.
"""

from __future__ import annotations

from datetime import date

from db.models import MealPlanAssignment, TrackingEntry
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


def _parse_iso_week(week_str: str) -> tuple[date, date]:
    parts = week_str.split("-")
    if len(parts) != 2:  # noqa: PLR2004
        raise ValueError(f"Invalid week format: {week_str!r}")
    year, week = int(parts[0]), int(parts[1])
    return date.fromisocalendar(year, week, 1), date.fromisocalendar(year, week, 7)


async def _assignments_for_dates(
    db: AsyncSession,
    *,
    user_id: int,
    start_date: date,
    end_date: date,
) -> list[MealPlanAssignment]:
    stmt = select(MealPlanAssignment).where(
        MealPlanAssignment.user_id == user_id,
        MealPlanAssignment.date >= start_date,
        MealPlanAssignment.date <= end_date,
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def log_day(
    db: AsyncSession,
    *,
    user_id: int,
    log_date: date,
) -> int:
    """Create TrackingEntries for all assignments on a given date.

    FR-025 (AC-065, AC-118).
    EVT-015 (logged by router).
    Returns the number of entries created.
    """
    assignments = await _assignments_for_dates(
        db, user_id=user_id, start_date=log_date, end_date=log_date
    )
    entries = [
        TrackingEntry(
            user_id=user_id,
            product_id=a.product_id,
            product_name=a.product_name,
            quantity=a.quantity,
            unit=a.unit,
            source_assignment_id=a.id,
        )
        for a in assignments
    ]
    if entries:
        db.add_all(entries)
        await db.commit()
    return len(entries)


async def log_week(
    db: AsyncSession,
    *,
    user_id: int,
    week: str,
) -> int:
    """Create TrackingEntries for all assignments in a week.

    FR-025 (AC-066).
    EVT-016 (logged by router).
    Returns the number of entries created.
    """
    monday, sunday = _parse_iso_week(week)
    assignments = await _assignments_for_dates(
        db, user_id=user_id, start_date=monday, end_date=sunday
    )
    entries = [
        TrackingEntry(
            user_id=user_id,
            product_id=a.product_id,
            product_name=a.product_name,
            quantity=a.quantity,
            unit=a.unit,
            source_assignment_id=a.id,
        )
        for a in assignments
    ]
    if entries:
        db.add_all(entries)
        await db.commit()
    return len(entries)


async def log_item(
    db: AsyncSession,
    *,
    user_id: int,
    assignment_id: int,
) -> int:
    """Create a single TrackingEntry from one assignment.

    FR-025 (AC-067).
    EVT-017 (logged by router).
    Returns 1 on success, 0 if assignment not found or belongs to different user.
    """
    stmt = select(MealPlanAssignment).where(
        MealPlanAssignment.id == assignment_id,
        MealPlanAssignment.user_id == user_id,
    )
    result = await db.execute(stmt)
    assignment = result.scalar_one_or_none()
    if assignment is None:
        return 0

    entry = TrackingEntry(
        user_id=user_id,
        product_id=assignment.product_id,
        product_name=assignment.product_name,
        quantity=assignment.quantity,
        unit=assignment.unit,
        source_assignment_id=assignment.id,
    )
    db.add(entry)
    await db.commit()
    return 1
