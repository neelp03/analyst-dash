# Ship Feature

End-to-end loop for implementing a feature in Analyst Dash.

## Steps

1. **Spec** — Clarify the feature with the user until you have: what it does, what "done" looks like, and any constraints (API shape, UI location, performance).

2. **Architect** — Delegate to the `architect` subagent with the full spec. Get back: success criteria, ordered steps, files to touch.

3. **Confirm criteria** — Show the success criteria to the user. Get a go-ahead before writing any code.

4. **Implement** — Delegate each step to the `implementer` subagent, one step at a time. Pass the step spec + success criteria + relevant file paths. Wait for confirmation before moving to the next step.

5. **Verify** — Delegate to `test-runner`. If it returns failures, route back to `implementer` with the failure output. Cap at 3 rounds; if still failing, stop and report.

6. **Review** — Delegate to `reviewer`. If it returns CRITICAL or HIGH findings, fix them before continuing.

7. **Report** — Tell the user: what was built, which files changed, check results (green/red), and any remaining gaps or follow-up work.

## Rules

- Never skip architect → confirm → implement → verify → review.
- Never declare done when checks are red.
- Never weaken a check to make a feature ship.
- Gaps (no tests, no linter) are reported, not silently accepted.
