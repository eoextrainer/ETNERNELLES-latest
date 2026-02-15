#!/bin/bash
# save_stage_commit_push_rollback.sh
# Usage: ./save_stage_commit_push_rollback.sh "commit message"

set -e

# Save all changes
if [[ -n $(git status --porcelain) ]]; then
  echo "Saving all changes..."
  git add .
  git commit -m "${1:-Stable: all changes saved on $(date '+%Y-%m-%d %H:%M:%S')}"
else
  echo "No changes to commit."
fi

# Tag as stable
TAG_NAME="stable-$(date '+%Y%m%d-%H%M%S')"
echo "Tagging current commit as $TAG_NAME"
git tag $TAG_NAME

echo "Pushing commits and tags to remote..."
git push && git push --tags

# Rollback function
git_rollback_to_latest_stable() {
  echo "Rolling back to latest stable tag..."
  LATEST_STABLE=$(git tag --list 'stable-*' | sort | tail -n 1)
  if [[ -z "$LATEST_STABLE" ]]; then
    echo "No stable tag found."
    exit 1
  fi
  git reset --hard "$LATEST_STABLE"
  echo "Rolled back to $LATEST_STABLE."
}

# Uncomment to test rollback:
# git_rollback_to_latest_stable

echo "Workflow complete."
