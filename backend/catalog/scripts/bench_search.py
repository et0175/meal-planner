"""NFR-002 / NFR-010 scale benchmark: search p95 at 10k products per language.

Seeds `--target` synthetic products per locale (en + de, source='scale_bench'),
measures the p95 response time of the real `GET /products` search endpoint against
the running Catalog API (so the pg_trgm index and full query path are exercised),
prints the result against the 200 ms NFR-002 threshold, then removes the bench rows.

Usage (Catalog API running on :8002, DATABASE_URL pointing at the same DB):
    python -m scripts.bench_search --target 10000 --iterations 40
    python -m scripts.bench_search --keep    # leave bench rows in place

This is a benchmark harness, not test data — bench rows are tagged source='scale_bench'
and deleted at the end unless --keep is passed.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import statistics
import time

import asyncpg
import httpx

BENCH_SOURCE = "scale_bench"


def _pg_dsn() -> str:
    url = os.environ.get(
        "DATABASE_URL", "postgresql+asyncpg://catalog:catalog@localhost:5436/catalog"
    )
    # asyncpg wants a plain postgresql:// DSN
    return url.replace("postgresql+asyncpg://", "postgresql://")


async def _cleanup(conn: asyncpg.Connection) -> int:
    return int(
        (await conn.execute(f"DELETE FROM products WHERE source = '{BENCH_SOURCE}'")).split()[-1]
    )


async def _seed(conn: asyncpg.Connection, target: int) -> None:
    await _cleanup(conn)
    # Products (one INSERT ... SELECT — fast bulk load)
    await conn.execute(
        """
        INSERT INTO products (owner_id, name, category, diet_tags, is_deleted, source, external_id)
        SELECT NULL, 'Benchmark Food ' || g || ' zeta', 'Benchmark', '[]'::json, false, $1,
               'bench-' || g
        FROM generate_series(1, $2) g
        """,
        BENCH_SOURCE,
        target,
    )
    await conn.execute(
        """
        INSERT INTO nutrition_per_100g (product_id, calories, protein_g, fat_g, carbs_g)
        SELECT id, 200, 10, 5, 20 FROM products WHERE source = $1
        """,
        BENCH_SOURCE,
    )
    # English name = canonical; German name distinct but shares the 'zeta' token
    await conn.execute(
        """
        INSERT INTO product_translations (product_id, locale, name)
        SELECT id, 'en', name FROM products WHERE source = $1
        """,
        BENCH_SOURCE,
    )
    await conn.execute(
        """
        INSERT INTO product_translations (product_id, locale, name)
        SELECT id, 'de', 'Testprodukt ' || external_id || ' zeta'
        FROM products WHERE source = $1
        """,
        BENCH_SOURCE,
    )
    await conn.execute("ANALYZE products")
    await conn.execute("ANALYZE product_translations")


async def _per_locale_counts(conn: asyncpg.Connection) -> dict[str, int]:
    rows = await conn.fetch(
        "SELECT locale, count(*) c FROM product_translations GROUP BY locale ORDER BY locale"
    )
    return {r["locale"]: r["c"] for r in rows}


async def _measure(api: str, term: str, locale: str, iterations: int) -> tuple[float, float, int]:
    times_ms: list[float] = []
    total = 0
    async with httpx.AsyncClient(base_url=api, timeout=30.0) as client:
        # warm up
        await client.get("/products", params={"search": term, "locale": locale, "limit": 50})
        for _ in range(iterations):
            start = time.perf_counter()
            resp = await client.get(
                "/products", params={"search": term, "locale": locale, "limit": 50}
            )
            elapsed = (time.perf_counter() - start) * 1000
            resp.raise_for_status()
            total = resp.json()["total"]
            times_ms.append(elapsed)
    times_ms.sort()
    p95 = times_ms[min(len(times_ms) - 1, int(round(0.95 * (len(times_ms) - 1))))]
    return statistics.median(times_ms), p95, total


async def _explain(conn: asyncpg.Connection, term: str, locale: str) -> str:
    plan = await conn.fetch(
        """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
        SELECT p.id, coalesce(t.name, p.name) rn
        FROM products p
        LEFT JOIN product_translations t ON t.product_id = p.id AND t.locale = $2
        WHERE p.is_deleted = false AND coalesce(t.name, p.name) ILIKE '%' || $1 || '%'
        ORDER BY coalesce(t.name, p.name) LIMIT 50
        """,
        term,
        locale,
    )
    return "\n".join(r["QUERY PLAN"] for r in plan)


async def _run(args: argparse.Namespace) -> None:
    conn = await asyncpg.connect(_pg_dsn())
    try:
        print(f"seeding {args.target} bench products (en + de) ...")
        await _seed(conn, args.target)
        counts = await _per_locale_counts(conn)
        print("per-language product_translations:", counts)
        for loc in ("en", "de"):
            ok = counts.get(loc, 0) >= args.target
            print(f"  {loc}: {counts.get(loc, 0)} {'>=' if ok else '<'} {args.target} target")

        print(f"\nmeasuring search p95 over {args.iterations} iterations (limit=50) ...")
        print(f"{'scenario':<34}{'total':>8}{'median':>10}{'p95':>10}   NFR-002")
        for label, term, locale in [
            ("broad 'zeta' @ de (matches all)", "zeta", "de"),
            ("broad 'zeta' @ en (matches all)", "zeta", "en"),
            ("selective '4242' @ de", "4242", "de"),
        ]:
            median, p95, total = await _measure(args.api, term, locale, args.iterations)
            verdict = "PASS" if p95 <= 200 else "FAIL"
            print(f"{label:<34}{total:>8}{median:>8.1f}ms{p95:>8.1f}ms   {verdict} (<=200ms)")

        print("\nquery plan (broad 'zeta' @ de):")
        print(await _explain(conn, "zeta", "de"))
    finally:
        if not args.keep:
            removed = await _cleanup(conn)
            print(f"\ncleaned up {removed} bench rows (source='{BENCH_SOURCE}')")
        else:
            print(f"\n--keep set: bench rows left in place (source='{BENCH_SOURCE}')")
        await conn.close()


def main() -> None:
    p = argparse.ArgumentParser(description="NFR-002 search p95 benchmark at 10k/language")
    p.add_argument("--target", type=int, default=10000, help="bench products per locale")
    p.add_argument("--iterations", type=int, default=40)
    p.add_argument("--api", default="http://localhost:8002")
    p.add_argument("--keep", action="store_true", help="do not delete bench rows afterwards")
    asyncio.run(_run(p.parse_args()))


if __name__ == "__main__":
    main()
