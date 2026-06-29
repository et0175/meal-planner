"""Pydantic v2 schemas for the plan summary endpoint."""

from __future__ import annotations

from pydantic import BaseModel


class PlanSummaryResponse(BaseModel):
    """Aggregate nutrition totals for a week (ADR-0004, COMP-017).

    Used by the topbar widget to display weekly stats.
    Only includes assignments that have inline nutrition data.
    """

    week: str
    total_kcal: float
    total_protein_g: float
    total_fat_g: float
    total_carbs_g: float
    assignment_count: int
