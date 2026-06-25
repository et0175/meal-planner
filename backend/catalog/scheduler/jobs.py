"""Scheduled jobs for the Catalog service.

ADR-0009: Monday 00:00 UTC rollover — promotes next_week → this_week, clears old flags.
"""

from __future__ import annotations

import logging

from db.engine import get_session_factory
from weekflag.service import rollover_week_flags

logger = logging.getLogger(__name__)


async def run_weekly_rollover() -> None:
    """Execute the Monday 00:00 week flag rollover.

    ADR-0009: next_week flags are promoted to this_week; stale this_week flags are cleared.
    EVT-010 emitted (logged).
    """
    factory = get_session_factory()
    async with factory() as db:
        promoted = await rollover_week_flags(db)
        logger.info(
            "EVT-010: weekly flag rollover complete — %d flags promoted next_week → this_week",
            promoted,
        )
