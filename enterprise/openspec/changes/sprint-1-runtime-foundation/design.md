# Design: Sprint 1 runtime foundation

## Context

Baseline specs live in `openspec/specs/`. Architecture locks hexagonal engine + sidecar (ADR-MA-01–05). W0 simulate passed; live rack W0 before production.

## Goals

- Runnable `enterprise/runtime/` monorepo on developer machine
- Engine serves station snapshot + event stream with `MockMatterAdapter`
- LCARS renders sprint 1 security composites; W-CT-01–03 testable

## Non-Goals

- Production sidecar compose on Mac dev host
- Full Ops overview grid (sprint 2)
- OAuth / remote access

## Decisions

### Monorepo layout

**Decision:** npm workspaces at `enterprise/runtime/` with `engine`, `lcars-web`, `packages/matter-port`, `packages/event-envelope`, `packages/tng-outcomes`.

**Rationale:** Matches architecture.md; shared types prevent LCARS/engine drift.

### Engine framework

**Decision:** Fastify 5 + `@fastify/websocket` for `/api/v1/events/stream`.

**Alternatives:** Hono (lighter but less plugin ecosystem for WS).

### Adapter selection

**Decision:** `MATTER_ADAPTER=mock|ohf` env var; default `mock` in dev/CI.

**Rationale:** TR sprint 1 unblocker; OhfSidecarAdapter stub only (connect no-op) until sprint 2.

### Alert FSM

**Decision:** XState v5 machine in engine; LCARS reads snapshot via REST — no client-side FSM authority.

**Rationale:** ADR-MA-05, NFR-UX6 enforcement in engine.

## Risks

| Risk | Mitigation |
|------|------------|
| Mock diverges from real Nest | OhfSidecarAdapter sprint 2; ART-01 harness D-13 |
| OpenSpec drift from code | `openspec validate --strict` in CI; archive change on merge |

## Migration Plan

1. Scaffold monorepo
2. Land mock adapter + engine API
3. LCARS security components + tests
4. Archive OpenSpec change → merge spec deltas

## Open Questions

- Exact Fastify vs Hono pin at scaffold time (either acceptable if WS works)
- Playwright vs Vitest for W-CT E2E split
