"""Initial shopping schema: shopping_lists, shopping_list_items.

Revision ID: 0001
Revises:
Create Date: 2026-06-29 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # shopping_lists table — one active list per user (ADR-0008)
    op.create_table(
        "shopping_lists",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("from_date", sa.Date(), nullable=False),
        sa.Column("to_date", sa.Date(), nullable=False),
        sa.Column("is_stale", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "generated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_shopping_lists_user"),
    )
    op.create_index(
        op.f("ix_shopping_lists_user_id"),
        "shopping_lists",
        ["user_id"],
        unique=False,
    )

    # shopping_list_items table — aggregated product rows
    op.create_table(
        "shopping_list_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("list_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("total_quantity", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(
            ["list_id"],
            ["shopping_lists.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_shopping_list_items_list_id",
        "shopping_list_items",
        ["list_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_shopping_list_items_list_id", table_name="shopping_list_items")
    op.drop_table("shopping_list_items")

    op.drop_index(op.f("ix_shopping_lists_user_id"), table_name="shopping_lists")
    op.drop_table("shopping_lists")
