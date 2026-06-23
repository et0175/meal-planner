"""Identity-internal auth dependency — verify_token for protected routes within this service.

Import only inside backend/identity/. Other services must call GET /auth/session
via the pattern in backend/shared/auth_middleware.py — this guard uses the identity
DB directly and cannot be imported by other services.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from db.engine import get_db
from db.models import Account
from session.service import validate_token
from sqlalchemy.ext.asyncio import AsyncSession

_bearer = HTTPBearer()


async def verify_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Account:
    """FastAPI dependency that validates a Bearer token and returns the Account.

    Raises 401 if the token is missing, invalid, or expired.
    """
    account = await validate_token(credentials.credentials, db)
    if account is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return account
