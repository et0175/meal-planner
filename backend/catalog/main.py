"""FastAPI application factory for the Product Catalog service."""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from auth_middleware import _identity_client
from authoring.router import router as authoring_router
from db.engine import get_engine, reset_engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
        _scheduler.shutdown(wait=True)
    await _identity_client.aclose()
    engine = get_engine()
    await engine.dispose()
    reset_engine()


_cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app = FastAPI(title="Product Catalog Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query_router)
app.include_router(authoring_router)
app.include_router(weekflag_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
