"""CLI: bulk-import global products from a USDA FoodData Central CSV export.

Usage (run from backend/catalog, with DATABASE_URL set for a real DB):
    python -m importer --dir docs/data/FoodData_Central_foundation_food_csv_2026-04-30
    python -m importer --dir <sr_legacy_csv_dir>   # re-run to add SR Legacy (idempotent)

Options:
    --dir DIR         Directory containing the FDC CSVs (food.csv, food_nutrient.csv, ...)
    --source NAME     Provenance source tag (default: usda_fdc)
    --locale LOCALE   Locale for the imported names (default: en)
    --batch-size N    Rows per commit (default: 1000)
    --limit N         Import only the first N records (for smoke tests)
"""

from __future__ import annotations

import argparse
import asyncio

from db.engine import get_session_factory
from importer.loader import DEFAULT_LOCALE, DEFAULT_SOURCE, load_records
from importer.usda import parse_usda


async def _run(args: argparse.Namespace) -> None:
    records = parse_usda(args.dir)
    if args.limit:
        records = records[: args.limit]
    print(f"parsed {len(records)} records from {args.dir}")

    factory = get_session_factory()
    async with factory() as db:
        stats = await load_records(
            db,
            records,
            source=args.source,
            locale=args.locale,
            batch_size=args.batch_size,
        )
    print(f"done: {stats.inserted} inserted, {stats.updated} updated ({stats.total} total)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Import global products from USDA FDC CSVs")
    parser.add_argument("--dir", required=True, help="Directory containing the FDC CSVs")
    parser.add_argument("--source", default=DEFAULT_SOURCE)
    parser.add_argument("--locale", default=DEFAULT_LOCALE)
    parser.add_argument("--batch-size", type=int, default=1000)
    parser.add_argument("--limit", type=int, default=0)
    asyncio.run(_run(parser.parse_args()))


if __name__ == "__main__":
    main()
