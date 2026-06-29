#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$REPO_ROOT"

echo "Stopping Meal Forge..."
docker compose down

echo "Done. Volumes are preserved. Use 'docker compose down -v' to also remove data."
