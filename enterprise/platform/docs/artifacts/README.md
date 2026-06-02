# MVP Artifacts (ENTERPRISE Main Computer)

Stable IDs referenced by [prd.md](../../prd.md). Expand each file before implementation gates G1–G5.

> **PRD validation Pass ≠ acceptance gates ready.** `prd.md` frontmatter `gateReadiness: blocked` until every row below is `ready` with evidence linked.

## Gate readiness checklist

| Gate | Name | ART / spec | Evidence required | Status |
|------|------|------------|-------------------|--------|
| G1 | 24h WAN-down soak pass | ART-05, ART-07 | 24h soak log; ART-07 normative; automation in audit | blocked |
| G2 | Coexistence conformance pack 100% CI | ART-01 | Full T1/T2 harness green in CI | blocked |
| G3 | HVAC success ≥99%; freshness ≤15s (7d) | — | Live W0 cert; 7-day field metrics | blocked |
| G4 | Degraded-mode fault-injection CI pass | ART-06 | CI matrix pass on rack or harness | blocked |
| G5 | Fabric restore drill completed once | — | Signed operator drill record | blocked |

Update **Status** to `ready` only when evidence is linked (CI run URL, soak log path, drill log). See [openspec/gates.yaml](../../openspec/gates.yaml).

**Rack day:** [RACK-DAY-BUNDLE.md](../RACK-DAY-BUNDLE.md) · **FR matrix:** [openspec/FR-COVERAGE.md](../../openspec/FR-COVERAGE.md)

| ART | Status (2026-06-01) |
|-----|---------------------|
| ART-01 | Partial — runbook normative; harness growing |
| ART-06 | Normative v0.1 — CI FI scenarios; fill `art06_run` evidence |
| ART-07 | Normative v0.1 — AUTO-SOAK-01; fill `art07_run` on soak |

| ID | File |
|----|------|
| ART-01 | [art-01-coexistence-pack-v1.md](./art-01-coexistence-pack-v1.md) |
| ART-02 | [art-02-conflict-taxonomy.md](./art-02-conflict-taxonomy.md) |
| ART-03 | [art-03-conflict-resolution-matrix.md](./art-03-conflict-resolution-matrix.md) |
| ART-04 | [art-04-hybrid-automation-bounds.md](./art-04-hybrid-automation-bounds.md) |
| ART-05 | [art-05-wan-down-soak-v0.md](./art-05-wan-down-soak-v0.md) |
| ART-06 | [art-06-degraded-mode-matrix.md](./art-06-degraded-mode-matrix.md) |
| ART-07 | [art-07-soak-reference-automation.md](./art-07-soak-reference-automation.md) |
| ART-08 | [art-08-alert-condition-matrix.md](./art-08-alert-condition-matrix.md) |
