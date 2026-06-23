"""Cross-service auth middleware — HTTP-based token validation.

Other services (catalog, planning, shopping) should NOT import from identity's
internal modules. Instead, call GET /auth/session on the Identity service:

    import httpx, os
    from fastapi import Depends, HTTPException, status
    from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

    _bearer = HTTPBearer()
    _identity_url = os.environ["IDENTITY_SERVICE_URL"]

    async def verify_token(
        credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    ) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{_identity_url}/auth/session",
                headers={"Authorization": f"Bearer {credentials.credentials}"},
                timeout=5.0,
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Invalid or expired session token",
                                headers={"WWW-Authenticate": "Bearer"})
        return resp.json()   # {"account_id": int, "email": str, "role": str}

The Identity service itself uses backend/identity/auth_guard.py (DB-direct) —
that file must NOT be used by other bounded contexts.
"""
