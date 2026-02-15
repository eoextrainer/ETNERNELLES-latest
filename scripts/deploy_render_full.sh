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

: "${RENDER_DATABASE_URL?Set RENDER_DATABASE_URL}"
: "${RENDER_BACKEND_DEPLOY_HOOK?Set RENDER_BACKEND_DEPLOY_HOOK}"
: "${RENDER_FRONTEND_DEPLOY_HOOK?Set RENDER_FRONTEND_DEPLOY_HOOK}"

COMMIT_MESSAGE="${1:-Stable release $(date +%Y-%m-%d)}"
TAG_NAME="${2:-stable-$(date +%Y%m%d-%H%M)}"

cd "$ROOT_DIR"

if [[ "${RENDER_DEPLOY_GIT_ADD_ALL:-false}" == "true" ]]; then
  git add -A
else
  git add -u
fi

git reset -- .render-deploy.env >/dev/null 2>&1 || true

if ! git diff --cached --quiet; then
  git commit -m "$COMMIT_MESSAGE"
fi

git tag -f "$TAG_NAME"

git push

git push --force origin "$TAG_NAME"

bash "$ROOT_DIR/scripts/deploy_render_local.sh"

printf "\nDeploy complete. Tag: %s\n" "$TAG_NAME"
