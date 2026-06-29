#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$REPO_ROOT"

# If a service name is passed, tail only that service; otherwise tail all.
SERVICE="${1:-}"
docker compose logs -f --tail=50 $SERVICE
