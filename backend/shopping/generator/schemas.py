"""Pydantic v2 schemas for shopping list endpoints."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field, model_validator


class GenerateRequest(BaseModel):
    """Explicit date range for POST /shopping/generate."""

    from_date: date
    to_date: date

    @model_validator(mode="after")
    def validate_date_order(self) -> "GenerateRequest":
        if self.from_date > self.to_date:
            raise ValueError("from_date must be <= to_date (INV-011)")
        return self


class ShoppingItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    category: str | None = None
    total_quantity: float
    unit: str

    model_config = {"from_attributes": True}


class ShoppingListResponse(BaseModel):
    id: int
    user_id: int
    from_date: date
    to_date: date
    is_stale: bool
    generated_at: datetime
    items: list[ShoppingItemResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class PlanEventRequest(BaseModel):
    """Simulated plan-change event (stub for future event-bus integration).

    Covers EVT-012, EVT-013, EVT-014 (AC-103, AC-104, AC-105).
    event_type: 'assignment_updated' | 'assignment_removed' | 'assignment_moved'
    assignment_date: the date of the affected assignment
    """

    event_type: str
    assignment_date: date


class RefreshResponse(BaseModel):
    detail: str
