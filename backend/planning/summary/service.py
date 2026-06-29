"""Plan summary business logic — aggregate weekly nutrition totals."""

from __future__ import annotations

from datetime import date

from db.models import MealPlanAssignment
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


def _parse_iso_week(week_str: str) -> tuple[date, date]:
    parts = week_str.split("-")
    if len(parts) != 2:  # noqa: PLR2004
        raise ValueError(f"Invalid week format: {week_str!r}")
    year, week = int(parts[0]), int(parts[1])
    return date.fromisocalendar(year, week, 1), date.fromisocalendar(year, week, 7)


def _current_iso_week() -> str:
    today = date.today()
    iso = today.isocalendar()
    return f"{iso.year}-{iso.week:02d}"


async def compute_summary(
    db: AsyncSession,
    *,
    user_id: int,
    week: str | None = None,
) -> dict[str, object]:
    """Return aggregate nutrition totals for a week.

    Sums quantity * kcal_per_unit (etc.) for all assignments with inline nutrition.
    COMP-017 / ADR-0004.
    """
    resolved_week = week if week and week != "current" else _current_iso_week()
    monday, sunday = _parse_iso_week(resolved_week)

    stmt = select(
        func.count(MealPlanAssignment.id).label("assignment_count"),
        func.coalesce(
            func.sum(MealPlanAssignment.quantity * MealPlanAssignment.kcal_per_unit), 0.0
        ).label("total_kcal"),
        func.coalesce(
            func.sum(MealPlanAssignment.quantity * MealPlanAssignment.protein_g_per_unit), 0.0
        ).label("total_protein_g"),
        func.coalesce(
            func.sum(MealPlanAssignment.quantity * MealPlanAssignment.fat_g_per_unit), 0.0
        ).label("total_fat_g"),
        func.coalesce(
            func.sum(MealPlanAssignment.quantity * MealPlanAssignment.carbs_g_per_unit), 0.0
        ).label("total_carbs_g"),
    ).where(
        MealPlanAssignment.user_id == user_id,
        MealPlanAssignment.date >= monday,
        MealPlanAssignment.date <= sunday,
    )

    result = await db.execute(stmt)
    row = result.one()

    return {
        "week": resolved_week,
        "assignment_count": row.assignment_count or 0,
        "total_kcal": float(row.total_kcal or 0.0),
        "total_protein_g": float(row.total_protein_g or 0.0),
        "total_fat_g": float(row.total_fat_g or 0.0),
        "total_carbs_g": float(row.total_carbs_g or 0.0),
    }
