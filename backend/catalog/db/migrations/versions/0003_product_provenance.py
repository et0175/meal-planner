"""Product provenance for external imports (FR-038, ADR-0013).

Adds `source` and `external_id` to `products` plus a partial unique index on
(source, external_id) so a bulk import (e.g. USDA FoodData Central) can upsert
idempotently. User-added products keep both columns NULL and are excluded from
the unique constraint by the partial predicate.

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-02 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("products", sa.Column("source", sa.String(length=50), nullable=True))
    op.add_column("products", sa.Column("external_id", sa.String(length=100), nullable=True))
    op.create_index(
        "uq_products_source_external_id",
        "products",
        ["source", "external_id"],
        unique=True,
        postgresql_where=sa.text("external_id IS NOT NULL"),
        sqlite_where=sa.text("external_id IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index("uq_products_source_external_id", table_name="products")
    op.drop_column("products", "external_id")
    op.drop_column("products", "source")
