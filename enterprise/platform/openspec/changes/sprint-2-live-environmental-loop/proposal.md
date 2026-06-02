# Proposal: Sprint 2 — live Environmental loop

## Why

Sprint 1 delivered mock-backed runtime foundation (merged PR #28). Sprint 2 closes the hybrid control loop on real Matter fabric: live sidecar adapter, setpoint command path, Environmental LCARS surface, and G3 freshness proof — unblocking coexistence gates G2/G3 field validation.

## What Changes

- Implement `OhfSidecarAdapter` using `@matter-server/ws-client` (W0 live certificate required)
- Add `POST /api/v1/commands/setpoint` with clearance + outcome envelopes (closes sprint 1 spec gap)
- Build Environmental LCARS: setpoint adjust UI, freshness indicators, QuickEnvPin (W-CT-04)
- Add conflict reconcile UX stub (W-CT-05) aligned with ART-02/03
- Pin sidecar image digest after live W0 on rack
- ART-01 harness scaffold (D-13) for CI coexistence scenarios T1-01+

## Capabilities

### New Capabilities

- `lcars-environmental` — Environmental loop UI, QuickEnvPin, freshness rendering
- `lcars-conflict` — ConflictReconcile composite, CONFLICT state UX

### Modified Capabilities

- `matter-adapter` — OhfSidecarAdapter live connect, reconnect policy, Nest attribute map
- `station-api` — setpoint command endpoint, command receipt streaming
- `coexistence-matter` — authority labels, conflict detection hooks (ART-02/03)

## Impact

- Code under `enterprise/runtime/engine/` and `enterprise/runtime/lcars-web/`
- Requires live W0 on rack (`w0-spike.certificate.yaml` with `architectureUnblock: true` from rack, not simulate-only)
- Sprint 1 mock path remains default for CI; live adapter gated behind `MATTER_ADAPTER=ohf` + sidecar profile

## Gates & contracts in scope

| Tag | Scope |
|-----|--------|
| G2 | Partial — ART-01 T1-01 automated in CI |
| G3 | Live Nest freshness ≤15s p95 (field + CI soak) |
| W-CT-04 | QuickEnvPin Green-only width |
| W-CT-05 | ConflictReconcile no Command during CONFLICT |

## Non-goals

- Full Ops overview grid (HealthStrip, SubsystemGrid — sprint 3)
- WAN-down soak field run (G1 — separate milestone)
- Fabric restore drill (G5)

## Dependencies

- Sprint 1 archived (`2026-05-24-sprint-1-runtime-foundation`)
- Live W0 rack run (`enterprise/spike/w0/`)
- Sidecar image digest from W0 results
