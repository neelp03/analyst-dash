# Analyst Dash

Polyglot monorepo: Next.js 14 frontend (`frontend/`) + FastAPI backend (`backend/`).

## Project facts

### Frontend (`frontend/`)
| Task | Command |
|------|---------|
| Install | `npm install` |
| Dev server | `npm run dev` |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Tests | **None configured** — see gaps below |

### Backend (`backend/`)
| Task | Command |
|------|---------|
| Install | `pip install -r requirements.txt` |
| Dev server | `uvicorn main:app --reload` |
| Syntax check | `python3 -m py_compile $(git diff --name-only HEAD \| grep '\.py$')` |
| Lint | **Not configured** (ruff not installed) |
| Typecheck | **Not configured** (mypy/pyright not installed) |
| Tests | **None configured** — see gaps below |

## Gaps (action required)

1. **No frontend tests** — add Jest or Vitest + React Testing Library.
2. **No backend tests** — add pytest (`pip install pytest pytest-asyncio httpx`).
3. **No Python linter/formatter** — add ruff (`pip install ruff`), then add `ruff check` and `ruff format` to the workflow.
4. **No CI** — recommended starter (`.github/workflows/ci.yml`):
   ```yaml
   on: [push, pull_request]
   jobs:
     frontend:
       runs-on: ubuntu-latest
       defaults:
         run:
           working-directory: frontend
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: npm }
         - run: npm ci
         - run: npx tsc --noEmit
         - run: npm run lint
         - run: npm run build
     backend:
       runs-on: ubuntu-latest
       defaults:
         run:
           working-directory: backend
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-python@v5
           with: { python-version: "3.11" }
         - run: pip install -r requirements.txt
         # add: pip install ruff pytest && ruff check . && pytest
   ```

## Loop engineering

**The loop:** spec → build in small increments → verify against reality → iterate until green.

**Hard rules:**
- Never weaken, skip, or delete a check to make it pass.
- Never fake success with mock data or hardcoded returns.
- Stop and report after 3 identical consecutive failures — don't spin.
- Done means: all checks green + no debug leftovers + the feature actually meets the spec.

**Orchestration with subagents** (`.claude/agents/`):
- Subagents start blank — include file paths, specs, and constraints in every prompt you give them.
- Delegate open-ended research to keep the main context lean.
- `architect` plans only (never writes code); returns success criteria + ordered steps + files to touch.
- `implementer` builds one spec'd piece at a time, verifies each increment.
- `reviewer` reads `git diff HEAD` and reports CRITICAL/HIGH/MEDIUM/LOW with file:line — read-only.
- `test-runner` runs typecheck + tests and returns only failures, not passing output.
