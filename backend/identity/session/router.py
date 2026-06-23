"""Session router — GET /auth/session for token validation by other services."""

from __future__ import annotations

from typing import Annotated

from db.engine import get_db
from db.models import RoleEnum
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from session.service import validate_token
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/auth", tags=["auth"])

_bearer = HTTPBearer()


class SessionInfo(BaseModel):
    account_id: int
    email: str
    role: RoleEnum


@router.get("/session", response_model=SessionInfo)
async def get_session(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SessionInfo:
    """Validate a Bearer token and return the associated account information.

    Used by other services to verify session tokens without re-implementing auth logic.
    Returns 401 for invalid or expired tokens.
    """
    account = await validate_token(credentials.credentials, db)
    if account is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return SessionInfo(account_id=account.id, email=account.email, role=account.role)
