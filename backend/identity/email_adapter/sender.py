"""Email sender stub for the Identity service.

In dev (EMAIL_BACKEND=stdout), all emails are printed to stdout.
Real SMTP wiring is deferred to a future card.
"""

from __future__ import annotations

import os


def send_password_reset_email(to_address: str, reset_token: str) -> None:
    """Send a password-reset email.

    In dev mode prints the reset link to stdout so it can be retrieved in tests
    without an SMTP server.
    """
    backend = os.environ.get("EMAIL_BACKEND", "stdout")
    reset_url = f"https://example.com/reset?token={reset_token}"
    if backend == "stdout":
        print(  # noqa: T201
            f"[EMAIL] To: {to_address} | Subject: Password Reset | "
            f"Reset link: {reset_url}"
        )
    # Future: elif backend == "smtp": ...
