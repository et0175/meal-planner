"""Shopping list generator router.

GET /shopping — auto-generate on navigation (FR-027, AC-070, AC-071)
POST /shopping/generate — explicit date range (FR-028, AC-072, AC-073)
"""

from __future__ import annotations

import logging
from typing import Annotated, Any

from auth_middleware import verify_token
from db.engine import get_db
from db.models import ShoppingList, ShoppingListItem
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from generator.schemas import GenerateRequest, ShoppingItemResponse, ShoppingListResponse
from generator.service import generate_list, get_or_generate_list
from sqlalchemy.ext.asyncio import AsyncSession

_log = logging.getLogger(__name__)

router = APIRouter(prefix="/shopping", tags=["shopping"])

_bearer = HTTPBearer()


def _token_from_credentials(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),  # noqa: B008
) -> str:
    return credentials.credentials


def _build_response(
    shopping_list: ShoppingList, items: list[ShoppingListItem]
) -> ShoppingListResponse:
    return ShoppingListResponse(
        id=shopping_list.id,
        user_id=shopping_list.user_id,
        from_date=shopping_list.from_date,
        to_date=shopping_list.to_date,
        is_stale=shopping_list.is_stale,
        generated_at=shopping_list.generated_at,
        items=[ShoppingItemResponse.model_validate(item) for item in items],
    )


@router.get("", response_model=ShoppingListResponse)
async def get_shopping_list(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> ShoppingListResponse:
    """Return the current shopping list, generating one for current ISO week if none exists.

    FR-027 (AC-070, AC-071): auto-generate on first navigation.
    EVT-020 emitted when list is generated for the first time.
    Empty plan → empty items list (no error, AC-071).
    """
    user_id: int = session["account_id"]
    # Extract bearer token to forward to Planning service
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()

    shopping_list, items = await get_or_generate_list(db, user_id=user_id, token=token)
    return _build_response(shopping_list, items)


@router.post("/generate", response_model=ShoppingListResponse, status_code=status.HTTP_200_OK)
async def generate_shopping_list(
    body: GenerateRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    session: Annotated[dict[str, Any], Depends(verify_token)],
) -> ShoppingListResponse:
    """(Re)generate shopping list for an explicit date range.

    FR-028 (AC-072, AC-073): custom date range.
    FR-029 (AC-074, AC-119): aggregate and group by category.
    INV-011: from_date > to_date → 422 (enforced by Pydantic).
    EVT-020 emitted (logged).
    """
    user_id: int = session["account_id"]
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()

    shopping_list, items = await generate_list(
        db,
        user_id=user_id,
        from_date=body.from_date,
        to_date=body.to_date,
        token=token,
    )
    _log.info("EVT-020 shopping_list_generated user=%d range=%s..%s", user_id, body.from_date, body.to_date)
    return _build_response(shopping_list, items)
