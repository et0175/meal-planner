"""Session router — GET /auth/session for token validation by other services."""

from __future__ import annotations

from typing import Annotated

from auth_guard import verify_token
from db.models import Account, RoleEnum
from fastapi import APIRouter, Depends
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])


class SessionInfo(BaseModel):
    account_id: int
    email: str
    role: RoleEnum


@router.get("/session", response_model=SessionInfo)
async def get_session(
    account: Annotated[Account, Depends(verify_token)],
) -> SessionInfo:
    """Validate a Bearer token and return the associated account information.

    Used by other services to verify session tokens without re-implementing auth logic.
    Returns 401 for invalid or expired tokens.
    """
    return SessionInfo(account_id=account.id, email=account.email, role=account.role)
