"""Meal plan assignment router — CRUD, search, week plan view."""

from __future__ import annotations

import logging
from typing import Annotated, Any

from auth_middleware import verify_token
from db.engine import get_db
from fastapi import APIRouter, Depends, HTTPException, Query, status
from mealplan.schemas import (
    AssignmentResponse,
    CreateAssignmentRequest,
    DeleteResponse,
    MoveAssignmentRequest,
    UpdateAssignmentRequest,
    WeekPlanResponse,
)
from mealplan.service import (
    AssignmentLimitError,
    AuthorizationError,
    NotFoundError,
    create_assignment,
    delete_assignment,
    list_assignments,
    move_assignment,
    search_items,
    update_assignment,
)
from sqlalchemy.ext.asyncio import AsyncSession
from weekflag_reader.service import get_this_week_products, search_catalog_products

_log = logging.getLogger(__name__)

router = APIRouter(prefix="/plan", tags=["plan"])


def _current_iso_week() -> str:
    from datetime import date

    iso = date.today().isocalendar()
    return f"{iso.year}-W{iso.week:02d}"


@router.get("", response_model=WeekPlanResponse)
async def get_week_plan(
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
    week: str | None = Query(None, description="ISO week as YYYY-WNN (e.g. 2026-W27), or omit for current week"),
) -> WeekPlanResponse:
    """List all assignments for a week (defaults to current ISO week).

    FR-016 (AC-046, AC-047): week navigation.
    ADR-0002 (AC-052): includes this-week flagged products from Catalog when week=current.
    """
    user_id: int = session["account_id"]
    assignments, resolved_week = await list_assignments(db, user_id=user_id, week=week)

    # Only fetch week-flagged products for the current week (ADR-0002 / AC-052)
    week_flagged: list[dict[str, Any]] = []
    current_week = _current_iso_week()
    if resolved_week == current_week:
        week_flagged = await get_this_week_products(user_id)

    return WeekPlanResponse(
        week=resolved_week,
        assignments=[AssignmentResponse.model_validate(a) for a in assignments],
        week_flagged_products=week_flagged,
    )


@router.post(
    "/assignments",
    response_model=AssignmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_assignment_route(
    body: CreateAssignmentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> AssignmentResponse:
    """Add an assignment to the plan.

    FR-017 (AC-049), FR-019 (AC-054).
    EVT-011 emitted (logged).
    Enforces: quantity > 0 (INV-008), max 10,000 assignments (INV-010).
    """
    user_id: int = session["account_id"]
    nutrition = body.nutrition
    try:
        assignment = await create_assignment(
            db,
            user_id=user_id,
            product_id=body.product_id,
            product_name=body.product_name,
            assignment_date=body.date,
            meal_slot=body.meal_slot,
            quantity=body.quantity,
            unit=body.unit,
            kcal_per_unit=nutrition.kcal if nutrition else None,
            protein_g_per_unit=nutrition.protein_g if nutrition else None,
            fat_g_per_unit=nutrition.fat_g if nutrition else None,
            carbs_g_per_unit=nutrition.carbs_g if nutrition else None,
        )
    except AssignmentLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc

    _log.info("EVT-011 assignment_created user=%d assignment=%d", user_id, assignment.id)
    return AssignmentResponse.model_validate(assignment)


@router.put("/assignments/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment_route(
    assignment_id: int,
    body: UpdateAssignmentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> AssignmentResponse:
    """Update quantity/unit on an assignment.

    FR-017 (AC-051), FR-019 (AC-056).
    EVT-012 emitted (logged).
    """
    user_id: int = session["account_id"]
    nutrition = body.nutrition
    try:
        assignment = await update_assignment(
            db,
            assignment_id,
            user_id,
            quantity=body.quantity,
            unit=body.unit,
            kcal_per_unit=nutrition.kcal if nutrition else None,
            protein_g_per_unit=nutrition.protein_g if nutrition else None,
            fat_g_per_unit=nutrition.fat_g if nutrition else None,
            carbs_g_per_unit=nutrition.carbs_g if nutrition else None,
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except AuthorizationError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    _log.info("EVT-012 assignment_updated user=%d assignment=%d", user_id, assignment_id)
    return AssignmentResponse.model_validate(assignment)


@router.delete("/assignments/{assignment_id}", response_model=DeleteResponse)
async def delete_assignment_route(
    assignment_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> DeleteResponse:
    """Remove an assignment from the plan.

    FR-017 (AC-050).
    EVT-013 emitted (logged).
    """
    user_id: int = session["account_id"]
    try:
        await delete_assignment(db, assignment_id, user_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except AuthorizationError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    _log.info("EVT-013 assignment_deleted user=%d assignment=%d", user_id, assignment_id)
    return DeleteResponse(detail=f"Assignment {assignment_id} deleted")


@router.put("/assignments/{assignment_id}/move", response_model=AssignmentResponse)
async def move_assignment_route(
    assignment_id: int,
    body: MoveAssignmentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> AssignmentResponse:
    """Move assignment to a different date/slot.

    FR-019 (AC-055).
    EVT-014 emitted (logged).
    """
    user_id: int = session["account_id"]
    try:
        assignment = await move_assignment(
            db,
            assignment_id,
            user_id,
            new_date=body.date,
            new_meal_slot=body.meal_slot,
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except AuthorizationError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    _log.info("EVT-014 assignment_moved user=%d assignment=%d", user_id, assignment_id)
    return AssignmentResponse.model_validate(assignment)


@router.get("/search")
async def search_route(
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
    q: str = Query(..., min_length=1, description="Search query"),
) -> list[dict[str, Any]]:
    """Search products sorted: recently used first, user-owned second, alphabetical rest.

    FR-023 (AC-062, AC-121).
    Calls Catalog service; falls back gracefully to empty list on error.
    """
    user_id: int = session["account_id"]
    catalog_products = await search_catalog_products(q)
    return await search_items(db, user_id=user_id, q=q, catalog_products=catalog_products)
