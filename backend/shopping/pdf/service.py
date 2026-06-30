"""PDF export service — generate shopping list PDF grouped by category.

COMP-022: ShoppingListPdfExport
NFR-004: must complete in < 3s.
FR-031 (AC-077, AC-120): grouped by category; omit empty categories; empty list → empty PDF.
"""

from __future__ import annotations

import io
from collections import defaultdict

from db.models import ShoppingListItem
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

_UNCATEGORIZED = "Uncategorized"


def generate_pdf(
    items: list[ShoppingListItem],
    from_date: str,
    to_date: str,
) -> bytes:
    """Render the shopping list to a PDF byte string.

    Groups items by category; skips empty categories; handles empty list gracefully.
    NFR-004: pure in-memory generation, no external calls → well under 3s.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2.0 * cm,
        leftMargin=2.0 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.0 * cm,
        title=f"Shopping List {from_date} – {to_date}",
    )

    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(
        Paragraph(f"<b>Shopping List: {from_date} – {to_date}</b>", styles["Title"])
    )
    story.append(Spacer(1, 0.5 * cm))

    if not items:
        story.append(Paragraph("No items in the shopping list for this range.", styles["Normal"]))
        doc.build(story)
        return buffer.getvalue()

    # Group by category
    by_category: dict[str, list[ShoppingListItem]] = defaultdict(list)
    for item in items:
        cat = item.category or _UNCATEGORIZED
        by_category[cat].append(item)

    # Sort categories alphabetically; Uncategorized goes last
    sorted_categories = sorted(
        by_category.keys(),
        key=lambda c: ("\xff" if c == _UNCATEGORIZED else c.lower()),
    )

    for category in sorted_categories:
        cat_items = by_category[category]
        if not cat_items:
            continue  # omit empty categories (AC-120 requirement)

        # Category heading
        story.append(Paragraph(f"<b>{category}</b>", styles["Heading2"]))
        story.append(Spacer(1, 0.2 * cm))

        # Table: product name | quantity | unit
        table_data = [["Product", "Quantity", "Unit"]]
        for it in sorted(cat_items, key=lambda x: x.product_name.lower()):
            qty = (
                str(int(it.total_quantity))
                if it.total_quantity == int(it.total_quantity)
                else f"{it.total_quantity:.2f}".rstrip("0").rstrip(".")
            )
            table_data.append([it.product_name, qty, it.unit])

        col_widths = [10 * cm, 4 * cm, 4 * cm]
        table = Table(table_data, colWidths=col_widths)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4F81BD")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#B8CCE4")),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.white, colors.HexColor("#EEF3FA")],
                    ),
                ]
            )
        )
        story.append(table)
        story.append(Spacer(1, 0.5 * cm))

    # Footer
    total = len(items)
    story.append(
        Paragraph(f"Total items: {total}", styles["Normal"])
    )

    doc.build(story)
    return buffer.getvalue()
