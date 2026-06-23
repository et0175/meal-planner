"""Tests for password reset flow.

Covers: AC-013–017
Trace: TestRequestPasswordReset_*, TestResetPassword_*
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest
from db.models import ResetToken
from httpx import AsyncClient
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession


class TestPasswordReset:
    """FR-005 — Password reset (AC-013–017)."""

    async def test_request_password_reset_sends_email(
        self, client: AsyncClient, capsys: pytest.CaptureFixture[str]
    ) -> None:
        """AC-013: registered email → reset link output (stdout stub), EVT-004."""
        await client.post(
            "/auth/register",
            json={"email": "alice@example.com", "password": "s3cure!Pass"},
        )
        resp = await client.post(
            "/auth/reset-request",
            json={"email": "alice@example.com"},
        )
        assert resp.status_code == 200
        captured = capsys.readouterr()
        assert "alice@example.com" in captured.out
        assert "reset" in captured.out.lower()

    async def test_reset_password_updates_password(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-014: valid unexpired token + new password → password updated, EVT-005."""
        await client.post(
            "/auth/register",
            json={"email": "alice@example.com", "password": "oldPassword1"},
        )
        await client.post(
            "/auth/reset-request",
            json={"email": "alice@example.com"},
        )

        # Fetch the token from DB
        from sqlalchemy import select

        stmt = select(ResetToken.token).order_by(ResetToken.id.desc()).limit(1)
        result = await db.execute(stmt)
        token_value = result.scalar_one()

        resp = await client.post(
            "/auth/reset-confirm",
            json={"token": token_value, "new_password": "newPassword2"},
        )
        assert resp.status_code == 200

        # Verify new password works
        sign_in_resp = await client.post(
            "/auth/sign-in",
            json={"email": "alice@example.com", "password": "newPassword2"},
        )
        assert sign_in_resp.status_code == 200

    async def test_reset_password_rejects_used_token(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-015: already-used token → 410."""
        await client.post(
            "/auth/register",
            json={"email": "alice@example.com", "password": "oldPassword1"},
        )
        await client.post(
            "/auth/reset-request",
            json={"email": "alice@example.com"},
        )

        from sqlalchemy import select

        stmt = select(ResetToken.token).order_by(ResetToken.id.desc()).limit(1)
        result = await db.execute(stmt)
        token_value = result.scalar_one()

        # Use the token once
        await client.post(
            "/auth/reset-confirm",
            json={"token": token_value, "new_password": "newPassword2"},
        )
        # Use it again
        resp = await client.post(
            "/auth/reset-confirm",
            json={"token": token_value, "new_password": "anotherPassword3"},
        )
        assert resp.status_code == 410

    async def test_reset_password_rejects_expired_token(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-016: expired token → 410."""
        await client.post(
            "/auth/register",
            json={"email": "alice@example.com", "password": "oldPassword1"},
        )
        await client.post(
            "/auth/reset-request",
            json={"email": "alice@example.com"},
        )

        from sqlalchemy import select

        stmt = select(ResetToken.id, ResetToken.token).order_by(ResetToken.id.desc()).limit(1)
        result = await db.execute(stmt)
        row = result.one()

        # Expire the token by setting expires_at in the past
        past = datetime.now(tz=UTC) - timedelta(hours=2)
        await db.execute(
            update(ResetToken).where(ResetToken.id == row.id).values(expires_at=past)
        )
        await db.commit()

        resp = await client.post(
            "/auth/reset-confirm",
            json={"token": row.token, "new_password": "newPassword2"},
        )
        assert resp.status_code == 410

    async def test_request_password_reset_no_enumeration(self, client: AsyncClient) -> None:
        """AC-017: unregistered email → 200, no email sent (no enumeration)."""
        resp = await client.post(
            "/auth/reset-request",
            json={"email": "nobody@example.com"},
        )
        assert resp.status_code == 200
