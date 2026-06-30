#!/usr/bin/env bash
# Runs typecheck + lint for the frontend and syntax check for the backend.
# On failure, emits a block decision to force the session to continue fixing.
# Guards against infinite loops via STOP_HOOK_ACTIVE.
set -uo pipefail

REPO_ROOT="/Users/neelp03/Desktop/projects/analyst-dash"

# Prevent infinite loop: if verify triggered a Stop that triggered verify again, skip.
if [[ "${STOP_HOOK_ACTIVE:-}" == "1" ]]; then
  exit 0
fi
export STOP_HOOK_ACTIVE=1

FAILURES=""

# ── Frontend: TypeScript ────────────────────────────────────────────────────
if [[ -d "$REPO_ROOT/frontend" ]]; then
  tsc_out="$(cd "$REPO_ROOT/frontend" && npx tsc --noEmit 2>&1 | tail -30)"
  if [[ $? -ne 0 ]] || echo "$tsc_out" | grep -qE "error TS"; then
    FAILURES="${FAILURES}\n[frontend/tsc]\n${tsc_out}\n"
  fi
fi

# ── Frontend: ESLint ────────────────────────────────────────────────────────
if [[ -d "$REPO_ROOT/frontend" ]]; then
  lint_out="$(cd "$REPO_ROOT/frontend" && npm run lint 2>&1 | tail -30)"
  lint_exit=$?
  if [[ $lint_exit -ne 0 ]]; then
    FAILURES="${FAILURES}\n[frontend/lint]\n${lint_out}\n"
  fi
fi

# ── Backend: Python syntax check ────────────────────────────────────────────
if [[ -d "$REPO_ROOT/backend" ]]; then
  py_files="$(find "$REPO_ROOT/backend" -name '*.py' | head -50)"
  if [[ -n "$py_files" ]]; then
    py_out="$(echo "$py_files" | xargs python3 -m py_compile 2>&1)"
    if [[ $? -ne 0 ]]; then
      FAILURES="${FAILURES}\n[backend/py_compile]\n${py_out}\n"
    fi
  fi
fi

# ── Result ───────────────────────────────────────────────────────────────────
if [[ -n "$FAILURES" ]]; then
  reason="Checks failed — fix before finishing:$(echo -e "$FAILURES" | head -60)"
  # Escape for JSON
  reason_json="$(echo "$reason" | jq -Rs '.')"
  echo "{\"decision\":\"block\",\"reason\":${reason_json}}"
  exit 0
fi

# All green — let the session stop normally
exit 0
