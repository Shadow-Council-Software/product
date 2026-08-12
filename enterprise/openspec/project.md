# ENTERPRISE Main Computer — OpenSpec Project Context

**Product:** Home starship operations center (LCARS) — Hybrid Control Loop MVP (P0)  
**Planning docs:** [`../index.md`](../index.md) · [`../architecture.md`](../architecture.md) · [`../prd.md`](../prd.md)

## Tech stack (implementation)

| Tier | Choice |
|------|--------|
| Runtime | Node.js 24 LTS, TypeScript 5+ ESM |
| Engine | Fastify, SQLite, XState v5 (alert FSM mirror in LCARS only) |
| LCARS | Vite 8, React, TanStack Query, Radix/React Aria |
| Matter | OHF sidecar (Docker), `@matter-server/ws-client`, `MatterAdapterPort` |
| Deploy | Docker Compose on operator Linux rack |

Monorepo target: `enterprise/runtime/` (not yet scaffolded).

## Domain language (use in all specs)

| Term | Meaning |
|------|---------|
| **Main Computer** | ENTERPRISE orchestration engine + experience pack |
| **Station** | Registered Matter or sensor endpoint (e.g. `env.nest.primary`) |
| **Fabric** | Matter administrative domain (Google, ENTERPRISE) |
| **Hybrid Mode** | Google + Main Computer parallel control; honest coexistence |
| **Clearance** | App RBAC tier: Captain, Crew, Guest |
| **OutcomeType** | TNG command result: Acknowledged, Pending, Verified, Denied, UnableToComply, Warning |
| **AlertPhase** | Green, Yellow, RedAlert, BattleStations, StandDownSummary |
| **HealthStrip** | Persistent chrome showing posture, staleness, hybrid indicator |
| **Experience pack** | TNG copy/tokens — never device truth |
| **Sidecar** | OHF Matter Server process — sole Matter fabric credential holder |

Normative copy grammar: [`../tng-interaction-contract.md`](../tng-interaction-contract.md)

## Gate registry

Gates are **acceptance barriers**. Spec requirements tagged `[Gate:Gn]` or `[Contract:W-CT-nn]` MUST pass before ship.

See [`gates.yaml`](./gates.yaml) for spec → gate mapping and verification method.

## Spec conventions

1. Requirements use **SHALL** / **MUST** (RFC 2119).
2. Scenarios use **WHEN** / **THEN** / **GIVEN** (OpenSpec format).
3. Prefix requirement titles with gate or contract tags when applicable: `[Gate:G3]`, `[Contract:W-CT-03]`.
4. Link to ART/FR in requirement body where traceability helps.
5. Deltas in `changes/*/specs/` use ADDED/MODIFIED/REMOVED sections only.

## Precedence

1. MVP gates G1–G5 and Starship MVP ACs ([`../prd.md`](../prd.md))
2. OpenSpec `openspec/specs/` (this tree)
3. [`../architecture.md`](../architecture.md)
4. [`../ux-design-specification.md`](../ux-design-specification.md)
