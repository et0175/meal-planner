"""SQLAlchemy 2.0 ORM models for the Meal Planning service."""

from __future__ import annotations

import enum
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    Float,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class MealSlot(enum.StrEnum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snacks = "snacks"


class MealPlanAssignment(Base):
    """One product assigned to a specific meal slot on a date for a user.

    Invariants:
        INV-008: quantity > 0
        INV-009: always filtered by user_id — assignments are user-scoped
        INV-010: max 10,000 total assignments per user
    """

    __tablename__ = "meal_plan_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    product_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    # Denormalised for PDF/summary without calling Catalog at render time
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    meal_slot: Mapped[MealSlot] = mapped_column(
        Enum(MealSlot, name="meal_slot_enum"), nullable=False
    )
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    # Optional inline nutrition (per assignment unit) — enables summary + PDF without
    # calling Catalog at render time. Populated from the product data the client sends.
    kcal_per_unit: Mapped[float | None] = mapped_column(Float, nullable=True)
    protein_g_per_unit: Mapped[float | None] = mapped_column(Float, nullable=True)
    fat_g_per_unit: Mapped[float | None] = mapped_column(Float, nullable=True)
    carbs_g_per_unit: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_meal_plan_assignments_user_date", "user_id", "date"),
    )


class NutritionTarget(Base):
    """Per-user daily calorie/macro target corridor.

    Invariants:
        INV-013: target_calories >= 0
        INV-014: user-scoped — exactly one target per user
    """

    __tablename__ = "nutrition_targets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    target_calories: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    protein_g: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    fat_g: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    carbs_g: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint("user_id", name="uq_nutrition_targets_user"),
    )


class TrackingEntry(Base):
    """Stub write-only log of consumed items (ADR-0001).

    Read UI deferred to Personal Cabinet v1.1.
    source_assignment_id links back to the originating MealPlanAssignment.
    """

    __tablename__ = "tracking_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    product_id: Mapped[int] = mapped_column(Integer, nullable=False)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    source_assignment_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
