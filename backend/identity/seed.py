"""Seed script — inserts test accounts into the identity database.

Idempotent: existing emails are skipped, not duplicated.

Run inside the container:
    docker exec mealplanner_new_1-identity-1 python seed.py

Or against a local DB (from backend/identity/):
    python seed.py
"""

from __future__ import annotations

import asyncio

import bcrypt
from db.engine import get_engine, get_session_factory
from db.models import Account, RoleEnum
from sqlalchemy import select

_BCRYPT_ROUNDS = 10

SEED_ACCOUNTS = [
    {"email": "alice@example.com", "password": "test1234"},
    {"email": "bob@example.com",   "password": "test1234"},
]


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=_BCRYPT_ROUNDS)).decode()


async def seed() -> None:
    factory = get_session_factory()
    async with factory() as session:
        for entry in SEED_ACCOUNTS:
            existing = await session.scalar(
                select(Account).where(Account.email == entry["email"])
            )
            if existing is not None:
                print(f"  skip  {entry['email']} (already exists)")
                continue

            account = Account(
                email=entry["email"],
                password_hash=_hash(entry["password"]),
                role=RoleEnum.user,
            )
            session.add(account)
            await session.commit()
            print(f"  added {entry['email']}")

    await get_engine().dispose()


if __name__ == "__main__":
    print("Seeding identity database...")
    asyncio.run(seed())
    print("Done.")
