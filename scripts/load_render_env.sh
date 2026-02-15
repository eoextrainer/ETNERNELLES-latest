#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${RENDER_ENV_FILE:-$ROOT_DIR/.render-deploy.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Render env file not found: $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

echo "Loaded Render deploy env from $ENV_FILE"
