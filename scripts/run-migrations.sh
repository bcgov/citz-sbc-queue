#!/usr/bin/env bash
set -euo pipefail

echo "Entrypoint: waiting for database host postgres:5432"
max_wait=${DB_WAIT_SECONDS:-60}
count=0
until bash -c "</dev/tcp/postgres/5432" >/dev/null 2>&1; do
  count=$((count+1))
  if [ $count -gt $max_wait ]; then
    echo "Timed out waiting for postgres:5432 after ${max_wait}s" >&2
    exit 1
  fi
  sleep 1
done

echo "Database reachable — running DB generation and migrations"
# Run migrations; tolerate failures to avoid crashing if commands are missing
if command -v npm >/dev/null 2>&1; then
  npx prisma generate || echo "npx prisma generate failed or not defined"
  npx prisma migrate dev || echo "npx prisma migrate dev failed or not defined"
else
  echo "npm not available in image; skipping migrations"
fi

echo "Starting app"
exec "$@"
