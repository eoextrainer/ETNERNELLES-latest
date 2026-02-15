#!/usr/bin/env bash
set -euo pipefail

: "${RENDER_DATABASE_URL?Set RENDER_DATABASE_URL}"
: "${RENDER_BACKEND_DEPLOY_HOOK?Set RENDER_BACKEND_DEPLOY_HOOK}"
: "${RENDER_FRONTEND_DEPLOY_HOOK?Set RENDER_FRONTEND_DEPLOY_HOOK}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_DIR="$ROOT_DIR/tmp/web_1"
SCHEMA_FILE="$DB_DIR/schema.sql"
SEED_FILE="$DB_DIR/sample_data.sql"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found in PATH." >&2
  exit 1
fi

if [[ ! -f "$SCHEMA_FILE" ]]; then
  echo "Schema file not found: $SCHEMA_FILE" >&2
  exit 1
fi

if [[ ! -f "$SEED_FILE" ]]; then
  echo "Seed file not found: $SEED_FILE" >&2
  exit 1
fi

echo "Dropping and recreating public schema on Render database..."
psql "$RENDER_DATABASE_URL" -v ON_ERROR_STOP=1 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "Applying schema..."
psql "$RENDER_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SCHEMA_FILE"

echo "Applying seed data..."
psql "$RENDER_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SEED_FILE"

echo "Triggering backend deploy..."
curl -s -X POST "$RENDER_BACKEND_DEPLOY_HOOK" -o /tmp/render_backend_deploy.json
cat /tmp/render_backend_deploy.json

echo "Triggering frontend deploy..."
curl -s -X POST "$RENDER_FRONTEND_DEPLOY_HOOK" -o /tmp/render_frontend_deploy.json
cat /tmp/render_frontend_deploy.json

echo "Done."
