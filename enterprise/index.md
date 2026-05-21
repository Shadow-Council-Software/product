# ENTERPRISE Main Computer — Document Index

Canonical entry points for planning, requirements, UX, and gate-backed implementation artifacts.

**Product:** ENTERPRISE Main Computer — **home starship operations center** (LCARS)  
**MVP:** Hybrid Control Loop (P0) — Environmental station (Nest 4th gen), whole-ship skeleton UI, alert FSM, Google coexistence  
**Related product (out of scope):** Bridge Physical Environment (`enterprise-bridge/`)

---

## Canonical Entry Points

| Document | Role |
|----------|------|
| [prd.md](./prd.md) | Product requirements — capability contract (FR/NFR), journeys, gates G1–G5 |
| [ux-design-specification.md](./ux-design-specification.md) | LCARS UX spec — through Step 06 (design system + hybrid CI gate); Ops overview, alert model |
| [tng-interaction-contract.md](./tng-interaction-contract.md) | TNG interaction grammar — copy patterns, outcomes, clearance messaging |
| [lcars-screen-inventory.md](./lcars-screen-inventory.md) | LCARS screen IA — hero `ops.overview`, station navigation |
| [matter-research-sources.md](./matter-research-sources.md) | Matter protocol research (PRD input) |
| [prd-validation-report.md](./prd-validation-report.md) | PRD validation record (Pass, 2026-05-16) |
| [docs/artifacts/](./docs/artifacts/) | Gate-backed specs ART-01–ART-08 |

**Planned (not yet created):**

| Document | Role |
|----------|------|
| `architecture.md` | Normative technical design |

---

## Precedence Order (Conflict Resolution)

1. MVP Acceptance Gates **G1–G5**, **Starship MVP ACs**, normative FR/NFR in [prd.md](./prd.md)
2. Gate artifacts **ART-01–ART-08** where referenced
3. [ux-design-specification.md](./ux-design-specification.md) for LCARS layout, alert visual law, Ops overview
4. [tng-interaction-contract.md](./tng-interaction-contract.md) for user-facing copy and outcome grammar
5. [lcars-screen-inventory.md](./lcars-screen-inventory.md) for screen IDs and navigation
6. [architecture.md](./architecture.md) when present
7. [matter-research-sources.md](./matter-research-sources.md) — domain context

---

## Reader Start Paths

### Operator / builder

1. [index.md](./index.md)
2. [ux-design-specification.md](./ux-design-specification.md) — Executive Summary → Ops Overview
3. [prd.md](./prd.md) — MVP Acceptance Gates → Starship MVP ACs
4. [lcars-screen-inventory.md](./lcars-screen-inventory.md)

### UX / design

1. [ux-design-specification.md](./ux-design-specification.md) — includes **UX Review Council**; **State of the Art Review (May 2026)** for build vs integrate
2. [lcars-screen-inventory.md](./lcars-screen-inventory.md)
3. [ART-08](./docs/artifacts/art-08-alert-condition-matrix.md)
4. [tng-interaction-contract.md](./tng-interaction-contract.md)

### Implementer / LLM agent

1. [index.md](./index.md)
2. [prd.md](./prd.md) — FR44–FR52, FR48–FR52, NFR-UX4–UX6
3. [docs/artifacts/](./docs/artifacts/)
4. [architecture.md](./architecture.md) when created

---

## MVP Gate Artifacts

| ID | File | Gate / role |
|----|------|-------------|
| ART-01 | [art-01-coexistence-pack-v1.md](./docs/artifacts/art-01-coexistence-pack-v1.md) | G2 |
| ART-02 | [art-02-conflict-taxonomy.md](./docs/artifacts/art-02-conflict-taxonomy.md) | — |
| ART-03 | [art-03-conflict-resolution-matrix.md](./docs/artifacts/art-03-conflict-resolution-matrix.md) | — |
| ART-04 | [art-04-hybrid-automation-bounds.md](./docs/artifacts/art-04-hybrid-automation-bounds.md) | — |
| ART-05 | [art-05-wan-down-soak-v0.md](./docs/artifacts/art-05-wan-down-soak-v0.md) | G1 |
| ART-06 | [art-06-degraded-mode-matrix.md](./docs/artifacts/art-06-degraded-mode-matrix.md) | G4 |
| ART-07 | [art-07-soak-reference-automation.md](./docs/artifacts/art-07-soak-reference-automation.md) | G1 |
| ART-08 | [art-08-alert-condition-matrix.md](./docs/artifacts/art-08-alert-condition-matrix.md) | Alert FSM / UX |

---

## Maintenance Rule

Update this index when canonical paths change. UX spec and PRD should stay version-aligned (see PRD risk register UX/PRD drift).
