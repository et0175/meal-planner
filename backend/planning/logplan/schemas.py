"""Pydantic v2 schemas for log-from-plan endpoints (ADR-0001)."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel


class LogDayRequest(BaseModel):
    date: date


class LogWeekRequest(BaseModel):
    week: str  # YYYY-WNN (e.g. 2026-W27)


class LogItemRequest(BaseModel):
    assignment_id: int


class LogResponse(BaseModel):
    entries_created: int
    detail: str
