"""SQLAlchemy 2.0 ORM models for the Product Catalog service."""

from __future__ import annotations

import enum
from datetime import datetime
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class WeekFlagEnum(enum.StrEnum):
    this_week = "this_week"
    next_week = "next_week"
    none = "none"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # null owner_id = global/shared product; non-null = user-owned
    owner_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    # Stored as JSON array of strings — portable across PostgreSQL and SQLite (tests)
    diet_tags: Mapped[list[Any]] = mapped_column(JSON, nullable=False, default=list)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    units: Mapped[list[ProductUnit]] = relationship(
        "ProductUnit", back_populates="product", cascade="all, delete-orphan"
    )
    nutrition: Mapped[NutritionPer100g | None] = relationship(
        "NutritionPer100g", back_populates="product", cascade="all, delete-orphan", uselist=False
    )
    week_flags: Mapped[list[WeekFlag]] = relationship(
        "WeekFlag", back_populates="product", cascade="all, delete-orphan"
    )

    __table_args__ = (
        # NFR-002: name search < 200 ms at 1,000 products
        Index("ix_products_name", "name"),
    )


class ProductUnit(Base):
    __tablename__ = "product_units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    unit_name: Mapped[str] = mapped_column(String(50), nullable=False)
    grams_per_unit: Mapped[float] = mapped_column(Float, nullable=False)

    product: Mapped[Product] = relationship("Product", back_populates="units")


class NutritionPer100g(Base):
    __tablename__ = "nutrition_per_100g"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    calories: Mapped[float] = mapped_column(Float, nullable=False)
    protein_g: Mapped[float] = mapped_column(Float, nullable=False)
    fat_g: Mapped[float] = mapped_column(Float, nullable=False)
    carbs_g: Mapped[float] = mapped_column(Float, nullable=False)

    product: Mapped[Product] = relationship("Product", back_populates="nutrition")


class WeekFlag(Base):
    __tablename__ = "week_flags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    flag: Mapped[WeekFlagEnum] = mapped_column(
        Enum(WeekFlagEnum, name="week_flag_enum"), nullable=False, default=WeekFlagEnum.none
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    product: Mapped[Product] = relationship("Product", back_populates="week_flags")

    __table_args__ = (
        UniqueConstraint("product_id", "user_id", name="uq_week_flags_product_user"),
    )
