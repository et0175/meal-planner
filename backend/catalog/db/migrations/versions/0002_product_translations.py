"""Product name localization: product_translations table (FR-037, ADR-0012).

Phase 1 of the localization model: adds per-locale product name translations,
backfills existing product names as English ('en'), and builds a per-locale
trigram index so ILIKE search stays within NFR-002 at 10k products per language.

`products.name` is retained as the canonical default-locale value and fallback;
it is not dropped here (see ADR-0012 — old columns are removed in a later phase
once all readers use the translation join).

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-30 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

DEFAULT_LOCALE = "en"


def upgrade() -> None:
    op.create_table(
        "product_translations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("locale", sa.String(length=10), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "product_id", "locale", name="uq_product_translations_product_locale"
        ),
    )
    op.create_index(
        op.f("ix_product_translations_product_id"),
        "product_translations",
        ["product_id"],
        unique=False,
    )

    # Backfill: every existing product name becomes its English translation.
    op.execute(
        sa.text(
            "INSERT INTO product_translations (product_id, locale, name) "
            "SELECT id, :loc, name FROM products"
        ).bindparams(loc=DEFAULT_LOCALE)
    )

    # NFR-002/010: per-locale GIN trigram index for fast ILIKE search on PostgreSQL.
    # pg_trgm is already enabled by migration 0001.
    if op.get_bind().dialect.name == "postgresql":
        op.execute(
            "CREATE INDEX IF NOT EXISTS ix_product_translations_name_trgm"
            " ON product_translations USING GIN (name gin_trgm_ops)"
        )


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP INDEX IF EXISTS ix_product_translations_name_trgm")
    op.drop_index(
        op.f("ix_product_translations_product_id"), table_name="product_translations"
    )
    op.drop_table("product_translations")
