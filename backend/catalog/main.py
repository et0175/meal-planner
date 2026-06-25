"""FastAPI application factory for the Product Catalog service."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from authoring.router import router as authoring_router
from db.engine import get_engine, reset_engine
from fastapi import FastAPI
from query.router import router as query_router
from scheduler.jobs import run_weekly_rollover
from weekflag.router import router as weekflag_router

_scheduler: AsyncIOScheduler | None = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    global _scheduler
    # Startup: initialise the DB engine and start the scheduler
    get_engine()

    _scheduler = AsyncIOScheduler()
    # ADR-0009: Monday 00:00 UTC rollover
    _scheduler.add_job(
        run_weekly_rollover,
        CronTrigger(day_of_week="mon", hour=0, minute=0, timezone="UTC"),
        id="weekly_flag_rollover",
        replace_existing=True,
    )
    _scheduler.start()

    yield

    # Shutdown
    if _scheduler is not None and _scheduler.running:
        _scheduler.shutdown(wait=False)
    engine = get_engine()
    await engine.dispose()
    reset_engine()


app = FastAPI(title="Product Catalog Service", lifespan=lifespan)

app.include_router(query_router)
app.include_router(authoring_router)
app.include_router(weekflag_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
