"""Initial planning schema: meal_plan_assignments, nutrition_targets, tracking_entries.

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
    # meal_plan_assignments table
    op.create_table(
        "meal_plan_assignments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column(
            "meal_slot",
            sa.Enum("breakfast", "lunch", "dinner", "snacks", name="meal_slot_enum"),
            nullable=False,
        ),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(length=50), nullable=False),
        sa.Column("kcal_per_unit", sa.Float(), nullable=True),
        sa.Column("protein_g_per_unit", sa.Float(), nullable=True),
        sa.Column("fat_g_per_unit", sa.Float(), nullable=True),
        sa.Column("carbs_g_per_unit", sa.Float(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_meal_plan_assignments_user_id"),
        "meal_plan_assignments",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_meal_plan_assignments_product_id"),
        "meal_plan_assignments",
        ["product_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_meal_plan_assignments_date"),
        "meal_plan_assignments",
        ["date"],
        unique=False,
    )
    op.create_index(
        "ix_meal_plan_assignments_user_date",
        "meal_plan_assignments",
        ["user_id", "date"],
        unique=False,
    )

    # nutrition_targets table
    op.create_table(
        "nutrition_targets",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("target_calories", sa.Float(), nullable=False),
        sa.Column("protein_g", sa.Float(), nullable=False),
        sa.Column("fat_g", sa.Float(), nullable=False),
        sa.Column("carbs_g", sa.Float(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_nutrition_targets_user"),
    )
    op.create_index(
        op.f("ix_nutrition_targets_user_id"),
        "nutrition_targets",
        ["user_id"],
        unique=False,
    )

    # tracking_entries table (stub — write-only, ADR-0001)
    op.create_table(
        "tracking_entries",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(length=50), nullable=False),
        sa.Column(
            "logged_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("source_assignment_id", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_tracking_entries_user_id"),
        "tracking_entries",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_tracking_entries_source_assignment_id"),
        "tracking_entries",
        ["source_assignment_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_tracking_entries_source_assignment_id"), table_name="tracking_entries"
    )
    op.drop_index(op.f("ix_tracking_entries_user_id"), table_name="tracking_entries")
    op.drop_table("tracking_entries")

    op.drop_index(op.f("ix_nutrition_targets_user_id"), table_name="nutrition_targets")
    op.drop_table("nutrition_targets")

    op.drop_index("ix_meal_plan_assignments_user_date", table_name="meal_plan_assignments")
    op.drop_index(
        op.f("ix_meal_plan_assignments_date"), table_name="meal_plan_assignments"
    )
    op.drop_index(
        op.f("ix_meal_plan_assignments_product_id"), table_name="meal_plan_assignments"
    )
    op.drop_index(
        op.f("ix_meal_plan_assignments_user_id"), table_name="meal_plan_assignments"
    )
    op.drop_table("meal_plan_assignments")

    # Drop PostgreSQL enum type (SQLite ignores this)
    op.execute("DROP TYPE IF EXISTS meal_slot_enum")
