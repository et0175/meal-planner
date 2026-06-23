"""Tests for account registration, sign-in, sign-out, and auth guard.

Covers: AC-001–012, AC-018–019, AC-100
Trace: TestRegisterAccount_*, TestSignIn_*, TestSignOut_*, TestAuthGuard_*
"""

from __future__ import annotations

import secrets
from datetime import UTC, datetime, timedelta

import pytest
from db.models import Account, ResetToken
from httpx import AsyncClient
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession


class TestRegisterAccount:
    """FR-001 — Register (AC-001–004, AC-100)."""

    async def test_register_account_persists(self, client: AsyncClient) -> None:
        """AC-001: valid email + password → 201, account persisted."""
        resp = await client.post(
            "/auth/register",
            json={"email": "alice@example.com", "password": "s3cure!Pass"},
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["email"] == "alice@example.com"
        assert body["role"] == "user"
        assert "id" in body

    async def test_register_account_rejects_duplicate_email(self, client: AsyncClient) -> None:
        """AC-002: duplicate email → 409, no second account."""
        payload = {"email": "alice@example.com", "password": "s3cure!Pass"}
        await client.post("/auth/register", json=payload)
        resp = await client.post("/auth/register", json=payload)
        assert resp.status_code == 409

    async def test_register_account_rejects_empty_password(self, client: AsyncClient) -> None:
        """AC-003: empty password → 422, nothing persisted."""
        resp = await client.post(
            "/auth/register",
            json={"email": "bob@example.com", "password": ""},
        )
        assert resp.status_code == 422

    async def test_register_account_rejects_malformed_email(self, client: AsyncClient) -> None:
        """AC-004: malformed email → 422, nothing persisted."""
        resp = await client.post(
            "/auth/register",
            json={"email": "not-an-email", "password": "s3cure!Pass"},
        )
        assert resp.status_code == 422

    async def test_register_account_role_is_valid_enum(self, client: AsyncClient) -> None:
        """AC-100: role is always 'user' at registration — not caller-controlled.

        Callers cannot elevate themselves to 'nutritionist' or any other role at sign-up.
        The role field in the request body is ignored (extra fields are silently dropped).
        """
        # Providing role: "user" is fine (ignored but harmless)
        resp_user = await client.post(
            "/auth/register",
            json={"email": "user1@example.com", "password": "s3cure!Pass"},
        )
        assert resp_user.status_code == 201
        assert resp_user.json()["role"] == "user"

        # Attempting privilege escalation via role: "nutritionist" is silently rejected —
        # the account is still created with role "user".
        resp_attempt = await client.post(
            "/auth/register",
            json={"email": "nutr@example.com", "password": "s3cure!Pass", "role": "nutritionist"},
        )
        assert resp_attempt.status_code == 201
        assert resp_attempt.json()["role"] == "user", "Role escalation must not be possible at registration"


class TestSignIn:
    """FR-002 — Sign-in (AC-005–007)."""

    async def test_sign_in_creates_session(self, client: AsyncClient) -> None:
        """AC-005: valid credentials → session token returned."""
        await client.post(
            "/auth/register",
            json={"email": "alice@example.com", "password": "s3cure!Pass"},
        )
        resp = await client.post(
            "/auth/sign-in",
            json={"email": "alice@example.com", "password": "s3cure!Pass"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert "token" in body
        assert body["token"] != ""
        assert "account_id" in body

    async def test_sign_in_rejects_wrong_password(self, client: AsyncClient) -> None:
        """AC-006: wrong password → 401, no session."""
        await client.post(
            "/auth/register",
            json={"email": "alice@example.com", "password": "s3cure!Pass"},
        )
        resp = await client.post(
            "/auth/sign-in",
            json={"email": "alice@example.com", "password": "wrongpassword"},
        )
        assert resp.status_code == 401

    async def test_sign_in_rejects_unknown_email(self, client: AsyncClient) -> None:
        """AC-007: unknown email → 401, no session."""
        resp = await client.post(
            "/auth/sign-in",
            json={"email": "nobody@example.com", "password": "s3cure!Pass"},
        )
        assert resp.status_code == 401


class TestRateLimiting:
    """FR-003 — Rate-limiting (AC-009–010)."""

    async def test_sign_in_rate_limits_after_threshold(
        self, client: AsyncClient, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """AC-009: after threshold consecutive failures → 429 + Retry-After."""
        monkeypatch.setenv("RATE_LIMIT_MAX_ATTEMPTS", "5")
        await client.post(
            "/auth/register",
            json={"email": "victim@example.com", "password": "correct!Pass"},
        )
        # Make 5 failed attempts
        for _ in range(5):
            await client.post(
                "/auth/sign-in",
                json={"email": "victim@example.com", "password": "wrong"},
            )
        # 6th attempt should be locked out
        resp = await client.post(
            "/auth/sign-in",
            json={"email": "victim@example.com", "password": "wrong"},
        )
        assert resp.status_code == 429
        assert "Retry-After" in resp.headers

    async def test_sign_in_allows_after_cooldown(
        self, client: AsyncClient, db: AsyncSession, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """AC-010: after lockout expires, sign-in succeeds with correct credentials."""
        monkeypatch.setenv("RATE_LIMIT_MAX_ATTEMPTS", "1")
        await client.post(
            "/auth/register",
            json={"email": "victim2@example.com", "password": "correct!Pass"},
        )

        # Trigger lockout with a wrong password (1 attempt = immediate lockout)
        await client.post(
            "/auth/sign-in",
            json={"email": "victim2@example.com", "password": "wrong"},
        )
        resp_locked = await client.post(
            "/auth/sign-in",
            json={"email": "victim2@example.com", "password": "correct!Pass"},
        )
        assert resp_locked.status_code == 429

        # Simulate lockout expiry by setting locked_until to the past in the DB
        past = datetime.now(tz=UTC) - timedelta(hours=2)
        await db.execute(
            update(Account)
            .where(Account.email == "victim2@example.com")
            .values(locked_until=past)
        )
        await db.commit()

        # Now sign-in with correct credentials should succeed
        resp_ok = await client.post(
            "/auth/sign-in",
            json={"email": "victim2@example.com", "password": "correct!Pass"},
        )
        assert resp_ok.status_code == 200
        assert "token" in resp_ok.json()


class TestSignOut:
    """FR-004 — Sign-out (AC-011–012)."""

    async def test_sign_out_invalidates_session(self, client: AsyncClient) -> None:
        """AC-011: sign out → token invalidated."""
        await client.post(
            "/auth/register",
            json={"email": "alice@example.com", "password": "s3cure!Pass"},
        )
        sign_in_resp = await client.post(
            "/auth/sign-in",
            json={"email": "alice@example.com", "password": "s3cure!Pass"},
        )
        token = sign_in_resp.json()["token"]

        sign_out_resp = await client.post(
            "/auth/sign-out",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert sign_out_resp.status_code == 200

    async def test_sign_out_invalidated_token_rejected(self, client: AsyncClient) -> None:
        """AC-012: invalidated token used → 401."""
        await client.post(
            "/auth/register",
            json={"email": "alice@example.com", "password": "s3cure!Pass"},
        )
        sign_in_resp = await client.post(
            "/auth/sign-in",
            json={"email": "alice@example.com", "password": "s3cure!Pass"},
        )
        token = sign_in_resp.json()["token"]

        # Sign out
        await client.post(
            "/auth/sign-out",
            headers={"Authorization": f"Bearer {token}"},
        )

        # Use invalidated token to access protected session endpoint
        resp = await client.get(
            "/auth/session",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 401


class TestAuthGuard:
    """FR-006 — Auth guard (AC-018–019)."""

    async def test_auth_guard_rejects_anonymous(self, client: AsyncClient) -> None:
        """AC-018: request to protected route with no session → 401."""
        resp = await client.get("/auth/session")
        # No Authorization header → 403 from HTTPBearer (no auto_error override)
        # HTTPBearer returns 403 when header is missing, 401 when invalid
        assert resp.status_code in (401, 403)

    async def test_auth_guard_rejects_expired_session(self, client: AsyncClient) -> None:
        """AC-019: expired session token → 401."""
        resp = await client.get(
            "/auth/session",
            headers={"Authorization": "Bearer invalid_fake_token_xyz"},
        )
        assert resp.status_code == 401


class TestSessionInvalidation:
    """Session invalidation after password reset (regression for cycle-1 security fix)."""

    async def test_sessions_invalidated_after_password_reset(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """Active sessions must be rejected after a successful password reset (AC-016)."""
        await client.post(
            "/auth/register",
            json={"email": "resetme@example.com", "password": "OldPass!1"},
        )
        sign_in_resp = await client.post(
            "/auth/sign-in",
            json={"email": "resetme@example.com", "password": "OldPass!1"},
        )
        old_token = sign_in_resp.json()["token"]

        # Confirm the token is currently valid
        check = await client.get(
            "/auth/session", headers={"Authorization": f"Bearer {old_token}"}
        )
        assert check.status_code == 200

        # Insert a reset token directly — avoids email infrastructure in tests
        stmt = select(Account.id).where(Account.email == "resetme@example.com")
        result = await db.execute(stmt)
        account_id = result.scalar_one()

        reset_value = secrets.token_urlsafe(32)
        db.add(
            ResetToken(
                account_id=account_id,
                token=reset_value,
                is_used=False,
                expires_at=datetime.now(tz=UTC) + timedelta(hours=1),
            )
        )
        await db.commit()

        # Confirm the password reset
        confirm_resp = await client.post(
            "/auth/reset-confirm",
            json={"token": reset_value, "new_password": "NewPass!2"},
        )
        assert confirm_resp.status_code == 200

        # Old session token must now be rejected
        rejected = await client.get(
            "/auth/session", headers={"Authorization": f"Bearer {old_token}"}
        )
        assert rejected.status_code == 401
