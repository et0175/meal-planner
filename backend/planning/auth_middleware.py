"""Cross-service auth middleware for the Planning service.

Validates tokens by calling GET /auth/session on the Identity service.
Returns the session payload: {"account_id": int, "email": str, "role": str}
"""

from __future__ import annotations

import os
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_bearer = HTTPBearer()

# Module-level client — reused across requests for connection pooling.
# Closed by the lifespan shutdown hook in main.py.
_identity_client = httpx.AsyncClient()


def _identity_url() -> str:
    return os.environ.get("IDENTITY_SERVICE_URL", "http://identity:8000")


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),  # noqa: B008
) -> dict[str, Any]:
    """Validate Bearer token against the Identity service.

    Returns the session dict: {"account_id": int, "email": str, "role": str}
    Raises 401 if the token is invalid or the Identity service rejects it.
    Raises 503 if the Identity service is unreachable or times out.
    """
    url = _identity_url()
    try:
        resp = await _identity_client.get(
            f"{url}/auth/session",
            headers={"Authorization": f"Bearer {credentials.credentials}"},
            timeout=5.0,
        )
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Identity service unavailable",
        ) from None
    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return resp.json()  # type: ignore[no-any-return]
