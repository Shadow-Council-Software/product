# Rack-day bundle — gate manifest

**Purpose:** Single operator runbook for **live W0** + **G1 soak start** + **parity capture** (supporting only).  
**Traceability:** [`../openspec/FR-COVERAGE.md`](../openspec/FR-COVERAGE.md)  
**PRD gates:** G1 (soak), G2 (partial), G3 (live HVAC), G5 (fabric drill deferred same day unless time)

> **Sim vs live:** `docs/fixtures/w0-spike.certificate.yaml` with `operator: cursor-agent (simulate)` does **not** satisfy this bundle. Live run must update certificate with rack host, image digest, and `architectureUnblock: true` from **physical** Nest path.

## Go / no-go preconditions

| # | Check | Gate impact |
|---|-------|-------------|
| 1 | Nest controllable in Google Home | G2, G3 |
| 2 | Thread BR online on same LAN as rack | FR1 |
| 3 | Sidecar host = Linux rack (`network_mode: host`) | live-w0 |
| 4 | `gateReadiness: blocked` acknowledged — this bundle does not auto-flip PRD | honesty |
| 5 | Parity: optional photos/measurements only — **not** required for W0 pass | sim ≠ G1 |

## Manifest (ordered)

| Step | Action | Outputs | FR / gate |
|------|--------|---------|-----------|
| 1 | `cd enterprise/spike/w0 && docker compose up -d` | sidecar running | FR1, W0-1 |
| 2 | `npm install && node run-w0.mjs` (**no** `--simulate`) | console pass/fail | FR1–5, G3 |
| 3 | Copy `w0-results.template.yaml` → `w0-results.yaml`; fill from checklist | live certificate data | tasks 1.1–1.2 |
| 4 | Update `docs/fixtures/w0-spike.certificate.yaml` OR rack-local `w0-results.yaml` per spike README | evidence artifact | architecture unblock |
| 5 | Start ART-05 24h soak clock; enable ART-07 automation | soak log started | G1, FR28, FR36 |
| 6 | (Optional) Doorway photos → `sim/layouts/sources/photos/` | parity support | desk only |

**Normative W0 steps:** [`../spike/w0/w0-checklist.md`](../spike/w0/w0-checklist.md)  
**Coexistence source:** [`artifacts/art-01-coexistence-pack-v1.md`](artifacts/art-01-coexistence-pack-v1.md)

## Verification commands

```bash
# From repo root
cd enterprise/spike/w0
node run-w0.mjs
# Expect exit 0; certificate shows non-simulate operator and real image digest

cd ../../runtime
npm test
# Contract tests green

cd ../..
node enterprise/sim/scripts/check-parity.mjs
# Optional — parity % for desk; does NOT close G1–G5
```

## Success criteria (Amelia approval bar)

- [ ] `run-w0.mjs` exit 0 **without** `--simulate`
- [ ] `w0-results.yaml` or certificate lists real `host.platform` (not `simulate-local`)
- [ ] ART-05 soak log file created with start timestamp
- [ ] ART-07 automation ID noted in soak log
- [ ] FR-COVERAGE rows FR1–3, FR6–7, FR13 updated to `live-w0` + evidence path

## Rollback / abort

- `docker compose down` in `enterprise/spike/w0`
- Document blockers in certificate `blockers:` array
- Do not mark Sprint 2 tasks 1.1–1.2 complete without evidence paths above

## Post-rack updates

1. Update [`openspec/FR-COVERAGE.md`](../openspec/FR-COVERAGE.md) evidence column for closed FRs.  
2. Update [`docs/artifacts/README.md`](artifacts/README.md) gate checklist statuses.  
3. File GitHub evidence link in Sprint 2 task 1.1–1.2 issues.
