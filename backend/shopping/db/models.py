"""SQLAlchemy 2.0 ORM models for the Shopping List service."""

from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ShoppingList(Base):
    """Single active shopping list per user (ADR-0008).

    Invariants:
        INV-011: from_date <= to_date (enforced in Pydantic schema)
        INV-012: is_stale=True when any plan event affects assignments in range
    """

    __tablename__ = "shopping_lists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    from_date: Mapped[date] = mapped_column(Date, nullable=False)
    to_date: Mapped[date] = mapped_column(Date, nullable=False)
    # Staleness flag — set True when a plan event (EVT-012/013/014) affects the range
    is_stale: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    __table_args__ = (
        # ADR-0008: one active list per user
        UniqueConstraint("user_id", name="uq_shopping_lists_user"),
    )


class ShoppingListItem(Base):
    """An aggregated product entry in a shopping list.

    Aggregated by (product_id, unit) across the date range —
    same product in different units gets separate rows.
    """

    __tablename__ = "shopping_list_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # index=False — index defined explicitly in __table_args__ to avoid duplicate name conflict
    list_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("shopping_lists.id", ondelete="CASCADE"),
        nullable=False,
        index=False,
    )
    product_id: Mapped[int] = mapped_column(Integer, nullable=False)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    # Populated from Catalog service (best-effort); None when catalog unavailable
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    total_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)

    __table_args__ = (
        # Performance: fast item retrieval by list (NFR-003)
        Index("ix_shopping_list_items_list_id", "list_id"),
    )
