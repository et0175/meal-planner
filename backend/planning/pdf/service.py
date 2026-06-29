"""PDF export service — generate a week meal plan PDF using reportlab.

NFR-004: must complete in < 3 s.
COMP-018: MealPlanPdfExport.
"""

from __future__ import annotations

import io
from datetime import date, timedelta

from db.models import MealPlanAssignment, MealSlot
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

_SLOT_ORDER = [MealSlot.breakfast, MealSlot.lunch, MealSlot.dinner, MealSlot.snacks]
_SLOT_LABELS = {
    MealSlot.breakfast: "Breakfast",
    MealSlot.lunch: "Lunch",
    MealSlot.dinner: "Dinner",
    MealSlot.snacks: "Snacks",
}
_DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def _parse_iso_week(week_str: str) -> date:
    """Return the Monday of the given ISO week."""
    parts = week_str.split("-")
    if len(parts) != 2:  # noqa: PLR2004
        raise ValueError(f"Invalid week format: {week_str!r}")
    year, week = int(parts[0]), int(parts[1])
    return date.fromisocalendar(year, week, 1)


def generate_pdf(
    assignments: list[MealPlanAssignment],
    week_str: str,
) -> bytes:
    """Render a week meal plan to a PDF byte string.

    NFR-004: pure in-memory generation, no external calls → well under 3 s.
    FR-026 (AC-068, AC-069): empty week → generates empty-plan PDF (no error).
    EVT-018 emitted by router.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title=f"Meal Plan — Week {week_str}",
    )

    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph(f"<b>Meal Plan — Week {week_str}</b>", styles["Title"]))
    story.append(Spacer(1, 0.5 * cm))

    monday = _parse_iso_week(week_str)

    # Index assignments by (date, slot)
    by_date_slot: dict[tuple[date, MealSlot], list[MealPlanAssignment]] = {}
    for a in assignments:
        key = (a.date, a.meal_slot)
        by_date_slot.setdefault(key, []).append(a)

    # Build grid: rows = meal slots, cols = days
    # Header row: blank + Mon … Sun with date
    header = [""]
    for i in range(7):
        day_date = monday + timedelta(days=i)
        header.append(f"{_DAY_NAMES[i]}\n{day_date.strftime('%d/%m')}")

    table_data = [header]

    for slot in _SLOT_ORDER:
        row: list[str] = [_SLOT_LABELS[slot]]
        for i in range(7):
            day_date = monday + timedelta(days=i)
            items = by_date_slot.get((day_date, slot), [])
            if items:
                cell_lines = [f"{a.product_name} {a.quantity} {a.unit}" for a in items]
                row.append("\n".join(cell_lines))
            else:
                row.append("—")
        table_data.append(row)

    col_widths = [2.5 * cm] + [2.6 * cm] * 7
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4F81BD")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#DCE6F1")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#B8CCE4")),
                ("ROWBACKGROUNDS", (1, 1), (-1, -1), [colors.white, colors.HexColor("#EEF3FA")]),
            ]
        )
    )
    story.append(table)

    # Footer note
    story.append(Spacer(1, 0.5 * cm))
    total = len(assignments)
    story.append(
        Paragraph(
            f"Total assignments this week: {total}",
            styles["Normal"],
        )
    )

    doc.build(story)
    return buffer.getvalue()
