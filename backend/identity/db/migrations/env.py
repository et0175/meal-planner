import asyncio
from logging.config import fileConfig
from os import environ

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import target_metadata from models once the schema is implemented (CARD-001).
# Until then, auto-generate is disabled (target_metadata = None).
target_metadata = None


def run_migrations_offline() -> None:
    url = environ["DATABASE_URL"]
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def _do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def _run_async_migrations() -> None:
    url = environ["DATABASE_URL"]
    engine = create_async_engine(url)
    async with engine.connect() as connection:
        await connection.run_sync(_do_run_migrations)
    await engine.dispose()


def run_migrations_online() -> None:
    # asyncio.run() is correct here: alembic is always invoked from the CLI
    # (never from inside a running event loop), so there is no loop conflict.
    asyncio.run(_run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
