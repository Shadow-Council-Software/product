# Design: Sprint 2 — live Environmental loop

## Context

Sprint 1 established hexagonal engine + LCARS with `MockMatterAdapter`. Architecture (ADR-MA-01–05) mandates sidecar isolation — credentials never in engine/LCARs. Sprint 2 connects the real adapter without breaking mock CI.

## Goals / Non-Goals

**Goals:**
- Live read/write on Nest via OHF sidecar WebSocket
- Setpoint command path end-to-end with TNG outcomes
- Environmental UI with W-CT-04/05 contract coverage
- ART-01 harness entry point for coexistence CI

**Non-Goals:**
- Ops overview hero grid
- Production sidecar HA / multi-node

## Decisions

### D-S2-01: OhfSidecarAdapter implementation

**Decision:** Wrap `@matter-server/ws-client` 0.7.x in `OhfSidecarAdapter` implementing `MatterAdapterPort`. Connection URL from `OHF_SIDECAR_URL` (default `ws://127.0.0.1:5580/ws`).

**Rationale:** Matches W0 spike (`verify-sidecar.mjs`) and architecture normative port.

**Alternatives:** Direct HTTP to sidecar REST — rejected; WS is canonical for subscriptions (G3).

### D-S2-02: Dual adapter CI strategy

**Decision:** CI continues `MATTER_ADAPTER=mock`. Nightly or manual workflow job runs `MATTER_ADAPTER=ohf` against docker sidecar profile when rack unavailable.

**Rationale:** Sprint 1 CI stability; live path validated on rack + optional workflow.

### D-S2-03: Setpoint command route

**Decision:** `POST /api/v1/commands/setpoint` body: `{ stationId, path, value }`. Clearance Crew+. Delegates to `adapter.writeAttribute`. Returns `OutcomePayload`.

**Rationale:** Closes station-api sprint 1 stub requirement; aligns with MatterAdapterPort.

### D-S2-04: Environmental LCARS layout

**Decision:** Extend sprint 1 console with dedicated Environmental panel: current temp, target setpoint slider (Crew+), freshness badge from `freshnessTs`, QuickEnvPin for Green-only width (W-CT-04).

**Rationale:** UX spec phased delivery — sprint 2 completes Environmental surface.

### D-S2-05: Conflict UX

**Decision:** Engine emits `ConflictDetected` envelope when authority divergence detected (stub rule sprint 2: Google vs enterprise write within 30s window). LCARS shows `ConflictReconcile` modal; commands disabled in CONFLICT (W-CT-05).

**Rationale:** ART-02/03 implementation start; full algorithm refined post-field.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Mock/live behavior drift | Shared contract tests on MatterAdapterPort; W0 certificate gate |
| Sidecar unavailable in dev | Mock default; docker compose sidecar profile |
| Nest attribute map wrong | W0 live run refines paths before merge |

## Migration Plan

1. Live W0 on rack → update certificate + sidecar digest
2. Implement OhfSidecarAdapter behind feature flag
3. Setpoint route + Environmental UI
4. W-CT-04/05 tests
5. ART-01 harness T1-01 in CI

## Open Questions

- Exact Nest 4th gen attribute map after rack commission
- Nightly oh f workflow vs manual only until G2 green
