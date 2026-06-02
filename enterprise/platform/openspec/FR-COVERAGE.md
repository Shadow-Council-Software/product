# FR coverage matrix — ENTERPRISE Main Computer

**Purpose:** Bidirectional traceability PRD → OpenSpec → sprint → gate → evidence.  
**Normative FR text:** [`../prd.md`](../prd.md) § Functional / Non-Functional Requirements.  
**Gate registry:** [`gates.yaml`](./gates.yaml).  
**Last updated:** 2026-06-01

## How to read this matrix

| Column | Meaning |
|--------|---------|
| **Evidence class** | `sim` = CI/mock only · `desk` = operator desk QA · `live-w0` = rack W0 spike · `field` = production home · `ci` = automated merge pipeline |
| **Status** | `done` · `partial` · `planned` · `deferred` (Growth) |
| **Gate** | G1–G5 or `—` |

**Coverage (MVP FR1–FR52, FR-H1–H3):** 55 FRs — **spec-traced: 55/55** (every row has owning spec). **Evidence-closed: 12/55** (~22%). Target for gate unblock: close all rows with gate G1–G5 at `live-w0` or `field` + artifact link.

---

## Matter device plane

| FR | Spec | Sprint | Gate | Evidence class | Status | Evidence / verification |
|----|------|--------|------|----------------|--------|-------------------------|
| FR1 | matter-adapter | sprint-2 | G3 | live-w0 | partial | ART-01 §2; W0-2 path A; `run-w0.mjs` |
| FR2 | matter-adapter, lcars-environmental | sprint-2 | G3 | live-w0 | partial | setpoint API + LCARS panel |
| FR3 | matter-adapter, lcars-environmental | sprint-2 | G3 | ci+field | partial | NFR-P2; subscription freshness |
| FR4 | matter-adapter, tng-outcomes | sprint-1 | — | ci | partial | timeout outcomes in engine |
| FR5 | matter-adapter | sprint-2 | — | live-w0 | planned | reconnect policy 2.3 |
| FR6 | coexistence-matter | sprint-2 | G2 | live-w0 | partial | ART-01; FR-H2 harness T1-01 |
| FR-H1 | matter-adapter | sprint-1 | — | ci | partial | mock commissioner in harness |
| FR-H2 | coexistence-matter | sprint-2 | G2 | ci | partial | `runtime/harness/art-01/` |
| FR-H3 | station-api | sprint-1 | — | ci | done | event envelope contract tests |

## Authority, coexistence, conflict

| FR | Spec | Sprint | Gate | Evidence class | Status | Evidence / verification |
|----|------|--------|------|----------------|--------|-------------------------|
| FR7 | coexistence-matter | sprint-2 | G2 | live-w0 | partial | authority indicator LCARS |
| FR8 | lcars-conflict | sprint-2 | G2 | ci | partial | ART-02; engine stub |
| FR9 | lcars-conflict | sprint-2 | G2 | ci | partial | ART-03; reconcile modal |
| FR10 | lcars-conflict | sprint-2 | — | ci | partial | W-CT-05 |
| FR11 | coexistence-matter | sprint-2 | G5 | field | planned | fabric desync runbook |
| FR12 | station-api | sprint-1 | — | ci | partial | audit log tests |

## LCARS console

| FR | Spec | Sprint | Gate | Evidence class | Status | Evidence / verification |
|----|------|--------|------|----------------|--------|-------------------------|
| FR13 | lcars-environmental | sprint-2 | G3 | live-w0 | partial | env.subsystem panel |
| FR14 | station-api, alert-fsm | sprint-1 | — | ci | partial | ops.overview landing |
| FR15 | tng-outcomes | sprint-1 | — | ci | done | outcome grammar tests |
| FR16 | lcars-conflict | sprint-2 | — | ci | partial | conflict banner expand |
| FR17 | lcars-conflict | sprint-2 | G2 | ci | partial | coexistence diagnostics |

## Identity & policy

| FR | Spec | Sprint | Gate | Evidence class | Status | Evidence / verification |
|----|------|--------|------|----------------|--------|-------------------------|
| FR18 | lcars-security | sprint-1 | — | ci | done | hybrid auth flow |
| FR19 | lcars-security | sprint-1 | — | ci | done | W-CT-01 guest |
| FR20 | lcars-security | sprint-1 | — | ci | done | clearance denial |
| FR21 | lcars-security | sprint-1 | — | ci | partial | policy interface |
| FR22 | lcars-security | sprint-1 | — | ci | partial | audit review |
| FR23 | lcars-security | sprint-1 | — | ci | planned | break-glass |

## Orchestration & Night Watch

| FR | Spec | Sprint | Gate | Evidence class | Status | Evidence / verification |
|----|------|--------|------|----------------|--------|-------------------------|
| FR24 | domain-vocabulary, station-api | sprint-1 | — | ci | partial | device registry |
| FR25 | alert-fsm | sprint-1 | — | ci | partial | minimal scene |
| FR26 | alert-fsm | sprint-1 | — | ci | partial | Night Watch Lite |
| FR27 | alert-fsm | sprint-1 | — | ci | partial | no cloud assistant path |
| FR28 | station-api | sprint-2 | G1 | field | planned | ART-07 + ART-05 soak log |

## Hybrid & degraded

| FR | Spec | Sprint | Gate | Evidence class | Status | Evidence / verification |
|----|------|--------|------|----------------|--------|-------------------------|
| FR29 | lcars-security | sprint-1 | — | desk | planned | onboarding copy |
| FR30 | matter-adapter | sprint-2 | — | desk | partial | ART-04 bounds |
| FR31 | matter-adapter | sprint-2 | — | ci | planned | override path |
| FR32 | matter-adapter, alert-fsm | sprint-2 | G4 | ci | partial | ART-06 matrix |

## Observability & soak

| FR | Spec | Sprint | Gate | Evidence class | Status | Evidence / verification |
|----|------|--------|------|----------------|--------|-------------------------|
| FR33 | station-api | sprint-1 | — | ci | partial | health strip API |
| FR34 | station-api | sprint-1 | — | ci | partial | audit append tests |
| FR35 | station-api | sprint-1 | — | ci | done | event envelope |
| FR36 | station-api | sprint-2 | G1 | field | planned | soak session API + log |
| FR37 | station-api | sprint-2 | G1 | field | planned | soak abort |

## Onboarding & platform

| FR | Spec | Sprint | Gate | Evidence class | Status | Evidence / verification |
|----|------|--------|------|----------------|--------|-------------------------|
| FR38 | coexistence-matter | sprint-2 | — | live-w0 | planned | first-time onboarding |
| FR39 | coexistence-matter | sprint-2 | — | live-w0 | planned | rollback flow |
| FR40 | runtime-monorepo | sprint-1 | — | desk | partial | secrets doc |
| FR41 | coexistence-matter | sprint-2 | G5 | field | planned | fabric backup drill log |
| FR42 | runtime-monorepo | sprint-1 | — | desk | done | deployment bundle doc |
| FR43 | station-api | sprint-1 | — | ci | partial | Station API stub |

## Alert FSM & Ops overview

| FR | Spec | Sprint | Gate | Evidence class | Status | Evidence / verification |
|----|------|--------|------|----------------|--------|-------------------------|
| FR44–FR52 | alert-fsm | sprint-1 | G4 | ci | partial | ART-08; contract tests |

*(FR44–FR52 detailed in alert-fsm spec; one row for matrix density.)*

## Growth (deferred — out of MVP gate scope)

| FR | Spec | Sprint | Gate | Status |
|----|------|--------|------|--------|
| FR-G1–G8 | — | post-dogfood | — | deferred |

---

## Unmapped FRs

**None** for MVP scope — all FR1–FR52 and FR-H1–H3 assign an owning spec.

## Waivers

| Item | Rationale |
|------|-----------|
| Sim parity (`check-parity.mjs`) | Supports **desk** layout evidence only; does **not** close G1–G5 |

## Related operator docs

- Rack day: [`../docs/RACK-DAY-BUNDLE.md`](../docs/RACK-DAY-BUNDLE.md)
- Artifacts: [`../docs/artifacts/README.md`](../docs/artifacts/README.md)
- W0 checklist: [`../spike/w0/w0-checklist.md`](../spike/w0/w0-checklist.md)
