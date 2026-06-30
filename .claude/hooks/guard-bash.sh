#!/usr/bin/env bash
# Blocks destructive shell commands before they run.
set -euo pipefail

input="$(cat)"
command="$(echo "$input" | jq -r '.tool_input.command // ""')"

# Patterns to block
BLOCKED_PATTERNS=(
  'rm -rf /'
  'rm -rf \*'
  'git push --force'
  'git push -f'
  'git reset --hard'
  'git clean -f'
  'git clean -fd'
  'git clean -fx'
  'chmod -R 777'
  'dd if='
  '> /dev/sd'
  'mkfs\.'
  'DROP TABLE'
  'DROP DATABASE'
  'truncate /'
  ':(){:|:&};:'
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$command" | grep -qE "$pattern"; then
    echo "{\"decision\":\"block\",\"reason\":\"Destructive command blocked by guard-bash: matched pattern '$pattern'. Confirm with the user before running.\"}"
    exit 0
  fi
done

# Allow
echo '{"decision":"approve"}'
