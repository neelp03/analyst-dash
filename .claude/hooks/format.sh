#!/usr/bin/env bash
# Formats the file that was just written or edited.
# Always exits 0 — a formatter crash must never halt the session.
set -uo pipefail

REPO_ROOT="/Users/neelp03/Desktop/projects/analyst-dash"

input="$(cat)"
file_path="$(echo "$input" | jq -r '.tool_input.file_path // ""')"

if [[ -z "$file_path" ]]; then
  exit 0
fi

ext="${file_path##*.}"

case "$ext" in
  ts|tsx)
    if [[ -x "$REPO_ROOT/frontend/node_modules/.bin/prettier" ]]; then
      "$REPO_ROOT/frontend/node_modules/.bin/prettier" --write "$file_path" 2>/dev/null || true
    fi
    ;;
  js|jsx|mjs|cjs)
    if [[ -x "$REPO_ROOT/frontend/node_modules/.bin/prettier" ]]; then
      "$REPO_ROOT/frontend/node_modules/.bin/prettier" --write "$file_path" 2>/dev/null || true
    fi
    ;;
  py)
    # Format with ruff if available; no-op otherwise
    if command -v ruff &>/dev/null; then
      ruff format "$file_path" 2>/dev/null || true
    fi
    ;;
  json)
    if command -v jq &>/dev/null; then
      tmp="$(mktemp)"
      jq '.' "$file_path" > "$tmp" 2>/dev/null && mv "$tmp" "$file_path" || rm -f "$tmp"
    fi
    ;;
esac

exit 0
