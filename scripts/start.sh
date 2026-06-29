#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$REPO_ROOT"

echo "Starting Meal Forge..."
docker compose up --build -d

echo "Waiting for services to be healthy..."
docker compose ps
echo ""
echo "Services are up. Ports:"
echo "  Identity  → http://localhost:8001"
echo "  Catalog   → http://localhost:8002"
echo "  Planning  → http://localhost:8003"
echo "  Shopping  → http://localhost:8004"
echo "  Frontend  → http://localhost:3000"
echo ""
echo "Run 'scripts/logs.sh' to tail logs, or 'scripts/stop.sh' to stop."
