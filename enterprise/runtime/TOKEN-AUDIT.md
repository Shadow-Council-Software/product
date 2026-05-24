# Token audit — ENTERPRISE Sprint 1

Instructions for recording agent token spend per GitHub issue so sprint cost reports have sufficient resolution.

## Per-issue workflow

1. **Before work:** Note the OpenSpec task ID and issue number from [TRACKING.md](./TRACKING.md).
2. **During agent session:** Record the Cursor/agent session ID (transcript UUID or session label).
3. **After completion:**
   - Update the issue body JSON block (`agent_sessions`, `actual_tokens`, `completed_at`).
   - Close the issue with a comment summarizing deliverables.
   - Update Project fields **Actual Tokens**, **Agent Sessions**, **Status → Done** (after project setup).
4. **On PR merge:** Link PR number in TRACKING.md and reference `Closes #NNN` in PR body.

## Issue body JSON schema

```json
{
  "agent_sessions": ["89bbe1aa-83e8-4eb0-ba41-e55528cd3be1"],
  "estimated_tokens": null,
  "actual_tokens": null,
  "completed_at": "2026-05-24T23:00:00Z",
  "story_points": 1
}
```

## Sprint rollup formula

```
sprint_total_tokens = Σ(actual_tokens) for all closed issues labeled sprint-1 + token-audit
sprint_story_points = Σ(story_points) = 26 (tasks 1.1–6.2)
cost_per_point      = sprint_total_tokens / sprint_story_points
cost_per_contract   = Σ(actual_tokens WHERE label W-CT-*) / count(W-CT issues)
```

## Where to read token counts

| Source | Use |
|--------|-----|
| Cursor usage dashboard | Actual tokens per session |
| GitHub Project **Token audit** view | Filter `label:token-audit`, sort by Actual Tokens |
| Milestone burndown | Open vs closed issue count (proxy for work remaining) |
| Epic #1 checklist | Child issue completion |

## Audit comment template (on close)

```markdown
## Sprint 1 completion audit

- **OpenSpec task:** X.Y
- **Agent session(s):** `<session-id>`
- **Actual tokens:** `<number or TBD>`
- **Deliverables:** `<files/tests>`
- **Verification:** `npm test` / `openspec validate --strict`
```

## Blocked / deferred

| Task | Issue | Reason |
|------|-------|--------|
| 6.2 Archive OpenSpec | #27 | Post-merge `/opsx:archive` only |
| Live W0 rack | — | Parallel; not sprint 1 blocker |

## Project setup (required for field-level audit)

```bash
gh auth refresh -s project,read:project
bash .github/scripts/setup-sprint-1-project.sh
```

Custom fields: OpenSpec Task ID, W-CT Contract, Gate, Token Audit Unit, Estimated/Actual Tokens, Agent Sessions, Status, Story Points, Component.
