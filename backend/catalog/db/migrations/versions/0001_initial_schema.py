"""Initial catalog schema: products, product_units, nutrition_per_100g, week_flags.

Revision ID: 0001
Revises:
Create Date: 2026-06-25 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # products table
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("diet_tags", sa.JSON(), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_products_name"), "products", ["name"], unique=False)
    op.create_index(op.f("ix_products_owner_id"), "products", ["owner_id"], unique=False)

    # NFR-002: GIN trigram index for fast ILIKE search on PostgreSQL only
    if op.get_bind().dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
        op.execute(
            "CREATE INDEX IF NOT EXISTS ix_products_name_trgm"
            " ON products USING GIN (name gin_trgm_ops)"
        )

    # product_units table
    op.create_table(
        "product_units",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("unit_name", sa.String(length=50), nullable=False),
        sa.Column("grams_per_unit", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_product_units_product_id"), "product_units", ["product_id"], unique=False
    )

    # nutrition_per_100g table
    op.create_table(
        "nutrition_per_100g",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("calories", sa.Float(), nullable=False),
        sa.Column("protein_g", sa.Float(), nullable=False),
        sa.Column("fat_g", sa.Float(), nullable=False),
        sa.Column("carbs_g", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product_id"),
    )
    op.create_index(
        op.f("ix_nutrition_per_100g_product_id"),
        "nutrition_per_100g",
        ["product_id"],
        unique=False,
    )

    # week_flags table
    op.create_table(
        "week_flags",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "flag",
            sa.Enum("this_week", "next_week", "none", name="week_flag_enum"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product_id", "user_id", name="uq_week_flags_product_user"),
    )
    op.create_index(
        op.f("ix_week_flags_product_id"), "week_flags", ["product_id"], unique=False
    )
    op.create_index(op.f("ix_week_flags_user_id"), "week_flags", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_week_flags_user_id"), table_name="week_flags")
    op.drop_index(op.f("ix_week_flags_product_id"), table_name="week_flags")
    op.drop_table("week_flags")

    op.drop_index(
        op.f("ix_nutrition_per_100g_product_id"), table_name="nutrition_per_100g"
    )
    op.drop_table("nutrition_per_100g")

    op.drop_index(op.f("ix_product_units_product_id"), table_name="product_units")
    op.drop_table("product_units")

    # Drop GIN trigram index before the B-tree index (PostgreSQL only)
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP INDEX IF EXISTS ix_products_name_trgm")

    op.drop_index(op.f("ix_products_owner_id"), table_name="products")
    op.drop_index(op.f("ix_products_name"), table_name="products")
    op.drop_table("products")

    # Drop PostgreSQL enum type (SQLite ignores this)
    op.execute("DROP TYPE IF EXISTS week_flag_enum")
