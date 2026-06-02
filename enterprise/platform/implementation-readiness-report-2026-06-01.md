---
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
validationTarget: enterprise
overallReadiness: NEEDS WORK
assessor: BMad Implementation Readiness workflow
documentInventory:
  prd: enterprise/prd.md
  architecture: enterprise/architecture.md
  ux: enterprise/ux-design-specification.md
  uxSupporting:
    - enterprise/ux-design-directions.html
    - enterprise/sim-ux-specification.md
  epics: openspec-substitute
  epicsPaths:
    - enterprise/openspec/specs/
    - enterprise/openspec/changes/
    - enterprise/runtime/TRACKING.md
  supporting:
    - enterprise/prd-validation-report.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-06-01
**Project:** ENTERPRISE Main Computer

## Document inventory (confirmed 2026-06-01)

| Role | Path |
|------|------|
| PRD | `enterprise/prd.md` |
| Architecture | `enterprise/architecture.md` |
| UX (primary) | `enterprise/ux-design-specification.md` |
| UX (supporting) | `ux-design-directions.html`, `sim-ux-specification.md` |
| Implementation planning | OpenSpec `specs/` + `changes/` + `runtime/TRACKING.md` (BMAD epics substitute) |
| Supporting | `prd-validation-report.md` |

---

## PRD Analysis

Source: `enterprise/prd.md` (read complete). Frontmatter: `gateReadiness: blocked`, `prdValidation: pass`.

### Functional Requirements

**MVP + harness (55):** FR1–FR52, FR-H1–FR-H3  
**Growth/Vision (8):** FR-G1–FR-G8  

Full requirement text: `enterprise/prd.md` § Functional Requirements (lines 518–619).

| ID range | Count | Theme |
|----------|-------|--------|
| FR1–FR5 | 5 | Matter HVAC device plane |
| FR6–FR12 | 7 | Authority, coexistence, conflict |
| FR13–FR17 | 5 | LCARS console |
| FR18–FR23 | 6 | Identity, roles, policy |
| FR24–FR28 | 5 | Registry, scenes, Night Watch Lite, soak automation |
| FR29–FR32 | 4 | Hybrid bounds, degraded modes |
| FR33–FR37 | 5 | Observability, audit, soak sessions |
| FR38–FR39 | 2 | Onboarding |
| FR40–FR43 | 4 | Platform, secrets, fabric, deployment |
| FR44–FR52 | 9 | Alert FSM, Ops overview |
| FR-H1–H3 | 3 | CI harness |
| FR-G1–G8 | 8 | Growth/Vision (out of MVP IR scope) |

**Total FRs:** 63 (55 MVP-relevant + 8 Growth)

### Non-Functional Requirements

**MVP NFRs (32):** NFR-P1–P4, NFR-R1–R5, NFR-S1–S8, NFR-I1–I5, NFR-O1–O5, NFR-CAP1, NFR-C2–C3, NFR-UX1–UX6  
**Growth NFRs (5):** NFR-S9–S13, NFR-C1  

Full text: `enterprise/prd.md` § Non-Functional Requirements (lines 621–692).

### Additional Requirements

- **MVP gates G1–G5** (Success Criteria) — mapped in `openspec/gates.yaml`
- **Starship acceptance AC-S1–S3, AC-E1–E5** — UX/alert drill criteria
- **MVP Artifacts ART-01–ART-08** — externalized evidence (several stub/partial)
- **Domain/sovereign constraints** — Domain-Specific Requirements §
- **Phased scope T1–T12** — Project Scoping §

### PRD Completeness Assessment

**Strong:** Dense FR/NFR contract, traceability table, gates, phase tags, dual validation/gate status in frontmatter.  
**Gaps for implementation:** Artifact bodies incomplete; Growth FRs present but correctly phased; no classic epics file (OpenSpec used instead).

---

## Epic Coverage Validation

**Planning substitute:** OpenSpec baseline `specs/` + active change `sprint-2-live-environmental-loop` + `runtime/TRACKING.md` (no `*epic*.md`).

### OpenSpec-declared FR coverage

| Spec / change | FRs explicitly claimed |
|---------------|------------------------|
| `coexistence-matter` | FR6, FR-H2; gates G1, G2, G5 |
| `matter-adapter` | ADR port; gate G3 scenarios |
| `station-api` | FR-H3; gates G1, G3 |
| `tng-outcomes` | FR15 |
| `lcars-security` | FR19–FR22; NFR-UX1, UX3 |
| `alert-fsm` | FR44–FR52; NFR-UX4–UX6; gate G4 |
| `lcars-environmental` | W-CT-04; implies FR2–FR3, FR13 |
| `lcars-conflict` | W-CT-05; ART-02/03; implies FR8–FR10 |
| Sprint 2 proposal | FR2–FR3, FR13, FR8–FR10 (partial), G2/G3 |

### FR coverage summary (MVP FR1–FR52, FR-H1–H3)

| Status | FRs | Notes |
|--------|-----|-------|
| **Spec-traced** | ~22 | Named in OpenSpec purpose or gate tags |
| **Implemented, weak spec trace** | ~15 | Sprint 1 runtime (registry, events, security, ops shell) — code exists, not all FR IDs in specs |
| **Not traced / not started** | ~18 | FR1, FR4–FR5, FR11, FR24–FR27, FR29, FR33–FR37, FR38–FR39, FR40–FR41, FR-H1 |

### Missing FR coverage (critical for BMad traceability)

| FR | Requirement (abbrev) | Recommendation |
|----|---------------------|----------------|
| FR1 | Commission Matter HVAC | Add scenarios to `matter-adapter` or `coexistence-matter` |
| FR24–FR27 | Registry, Night Watch Lite | New OpenSpec capability or sprint-3 change |
| FR28, FR36 | Soak sessions | Link `station-api` + ART-05/07 scenarios |
| FR33–FR35 | Health strip, audit, events | `runtime-monorepo` / `station-api` spec gaps |
| FR38–FR39 | Onboarding | Dedicated change before MVP ship |
| FR40–FR41 | Secrets, fabric backup | Platform epic; gate G5 partial |
| FR-H1 | Simulated commissioner CI | `matter-adapter` harness spec |

### Coverage statistics

- **Total MVP FRs:** 55  
- **FRs with OpenSpec ID trace:** ~22 (40%)  
- **FRs with code partial but no spec ID:** ~15 (27%)  
- **FRs without clear implementation path:** ~18 (33%)  
- **Coverage percentage (strict spec trace):** **~40%**  
- **Coverage percentage (code + spec):** **~67%** (Sprint 1–2 landed; gaps remain)

**Growth FR-G1–G8:** Correctly deferred — not scored against MVP readiness.

---

## UX Alignment Assessment

### UX document status

**Found:** `ux-design-specification.md` (complete, step 14). Supporting: `ux-design-directions.html`, `sim-ux-specification.md`.

### UX ↔ PRD alignment

| Check | Status |
|-------|--------|
| LCARS / Environmental primary job | Aligned (PRD FR13–FR17, NFR-UX1–UX6) |
| Alert FSM / Ops overview | Aligned (FR44–FR52, AC-S1–E5, ART-08) |
| TNG interaction grammar | Aligned (`tng-interaction-contract.md` cited) |
| NFR-UX1–UX6 in PRD | Added post-validation — matches UX spec |
| Sim UX | Separate doc; correctly scoped to digital twin |

**Minor gap:** `sim-ux-specification.md` not cross-linked from PRD Document Map (informational only).

### UX ↔ architecture alignment

| Check | Status |
|-------|--------|
| LCARS never talks to Matter sidecar directly | Aligned (ADR, OpenSpec boundary) |
| Alert FSM owned by engine | Aligned (ADR-MA-05, `alert-fsm` spec) |
| W0 simulate vs live | Architecture notes live rack required — UX should show live vs simulated (party mode recommendation) |

### Warnings

None critical. UX is not missing; UI is extensively specified.

---

## Epic Quality Review (OpenSpec as epics)

Validated against create-epics-and-stories principles, applied to OpenSpec changes + GitHub TRACKING.

### Sprint 1 (archived `2026-05-24-sprint-1-runtime-foundation`)

| Criterion | Assessment |
|-----------|------------|
| User value | **Pass** — operator can use LCARS shell, clearance, mock environmental path |
| Independence | **Pass** — standalone foundation |
| Story sizing | **Pass** — 1.1–6.2 atomic tasks in TRACKING |
| Forward dependencies | **Pass** |
| FR traceability | **Major issue** — tasks map to contracts (W-CT-*) more than FR IDs |

### Sprint 2 (active `sprint-2-live-environmental-loop`)

| Criterion | Assessment |
|-----------|------------|
| User value | **Pass** — live setpoint, environmental panel |
| Independence | **Pass** — builds on Sprint 1 |
| Story sizing | **Pass** — tasks 1.1–8.2 |
| Forward dependencies | **Pass** |
| Acceptance criteria | **Major issue** — tasks 1.1–1.2 OPEN (live W0); many tasks checked but gate evidence missing |
| Technical-milestone smell | **Minor** — task 1.3 “pin sidecar digest” is ops, acceptable |

### 🔴 Critical violations

1. **No BMAD epics document** — FR→epic→story chain is implicit; 33% MVP FRs lack spec trace.  
2. **Sprint 2 “done” vs gates** — Task checkboxes ahead of G1–G5 evidence (`gateReadiness: blocked`).

### 🟠 Major issues

1. OpenSpec specs cover ~40% of MVP FR IDs explicitly.  
2. ART stubs undermine FR8–9, FR28–32, FR36 acceptance criteria.  
3. Conflict path stub (engine) vs UX spec completeness mismatch.

### 🟡 Minor concerns

1. GitHub TRACKING uses task IDs not FR IDs.  
2. Consider `bmad-create-epics-and-stories` output OR FR coverage matrix in `openspec/project.md`.

---

## Summary and Recommendations

### Overall readiness status

**NEEDS WORK**

Planning artifacts (PRD, UX, architecture) are **implementation-grade**. The **implementation planning layer** (epics/stories as OpenSpec) is **in progress** and **not fully traceable** to all MVP FRs. **Execution** has started (Sprint 1 complete, Sprint 2 active) while **acceptance gates remain blocked**.

### Critical issues requiring immediate action

1. **Close Sprint 2 tasks 1.1–1.2** with live W0 certificate — unblocks honest G3/coexistence path.  
2. **Expand OpenSpec FR coverage map** — at minimum add FR IDs to each spec Purpose block for FR1–FR5, FR24–FR41, FR-H1.  
3. **Flesh ART-01, ART-06, ART-07** — FRs reference “documented *” artifacts that are stub/partial.

### Recommended next steps

1. Apply **`all`** simple fixes if not already done (`gateReadiness`, artifacts checklist) — done 2026-06-01.  
2. Add `openspec/FR-COVERAGE.md` matrix: FR → spec → sprint → gate (one afternoon).  
3. Run **`/opsx:apply sprint-2-live-environmental-loop`** through live rack verification only.  
4. Optional: **`bmad-create-epics-and-stories`** for formal epic file, or accept OpenSpec-only with coverage matrix.  
5. Do **not** start Sprint 3 scope until G2/G3 have CI+field evidence.

### Final note

This assessment identified **12+ issues** across traceability, epic substitute quality, and gate/evidence alignment. **Proceed with implementation** on the current OpenSpec path is reasonable for a brownfield solo build, but **MVP ship readiness** requires gate evidence and FR spec trace — not additional PRD validation.

**Assessor:** BMad Implementation Readiness · **Date:** 2026-06-01

---

## Post-assessment deliverables (2026-06-01)

| Item | Path | Agent review |
|------|------|----------------|
| FR coverage matrix | `openspec/FR-COVERAGE.md` | Mary ~58% structural; evidence columns added |
| Rack-day gate manifest | `docs/RACK-DAY-BUNDLE.md` | Winston: sim/live separation enforced |
| ART-06 expanded | `docs/artifacts/art-06-degraded-mode-matrix.md` | Amelia: fill `art06_run` on CI/rack |
| ART-07 expanded | `docs/artifacts/art-07-soak-reference-automation.md` | John: requires soak execution |
| OpenSpec Purpose FR IDs | `openspec/specs/*/spec.md` | 10 specs updated |
| Parity scope line | `sim/docs/PARITY-DATA-COLLECTION.md` | (prior session) |

**Supervisor consensus:** Proceed with **rack-day execution**; do not mark gates ready until evidence YAML blocks filled.
