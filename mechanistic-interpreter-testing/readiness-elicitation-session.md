# Readiness elicitation session

Consolidated output from BMad Advanced Elicitation (Pre-mortem Analysis, Comparative Analysis Matrix) and party-mode discussion of implementation readiness and John’s three prompts.

## Readiness framing: John’s three prompts

**Purpose:** These are not paperwork—they are **tripwires** before epics and sprint planning. Each answer should be **citable** (PRD § / architecture § / validation), not remembered.

1. **First shippable slice (one sentence)** — *Who*, *when*, *what changes for them*; smallest outcome a stranger could infer without opening the PRD. Anchors UX scope and backlog decomposition.

2. **Non-negotiables (≤3)** — Invariants that would **stop the line** if violated; map to explicit PRD or decision-record language; ideally one row each in the traceability matrix (requirement → architecture → validation).

3. **Open risks** — Uncomfortable gaps: PRD vs architecture, validation waivers, coverage holes in the matrix, assumption risks not yet validated. Short list with owners/timeboxes for planning.

**Cross-cutting:** Missing **UX artifact**, **epics/stories**, **implementation readiness report**, and **sprint home** means you are **ready to finish prep**, not **ready to hand off build**—unless scope is explicitly narrowed.

## Pre-mortem (failure → causes → prevention)

**Imagined failure:** Implementation starts without locking slice, invariants, and risks; builds are green but **do not prove the mechanistic interpreter claim**; PRD/architecture diverge under pressure; UX trails APIs; the evidence matrix no longer matches shipped behavior; re-plan wipes much of the sprint work.

**Causes:** No falsifiable slice; implicit “non-negotiables”; unnamed PRD/arch/validation tensions; UX/workflow ambiguity; weak versioned traceability into stories and tests.

**Prevention:** Treat the slice sentence as the **anti–scope-creep** device; only count as non-negotiable what would **halt release**; maintain a **risk stub** with PRD/arch version IDs before calling implementation readiness or sprint planning done.

## Comparative analysis: first-slice strategies

**Options evaluated:** (A) Synthetic lab, (B) One vertical slice, (C) Platform/observability first, (D) UX-first with mocked backend.

**Criteria (weighted):** mechanistic proof (×3), low PRD/arch drift (×2), time to falsifiable evidence (×2), stakeholder/UX credibility (×1).

**Result:** **B — One vertical slice** scores highest for the default path; **A** is acceptable if the PRD explicitly defines success as **fixture-level only**; **C** or **D alone** are weak if the mechanistic claim never gets exercised on a real path.

**Action:** Rename A–D to project-specific candidates, re-score in a short session, then **freeze the winner** as the official one-liner slice and align non-negotiables to that choice.

## Suggested next steps (BMad Method)

- Freeze slice one-liner, non-negotiables, and top risks (with PRD/arch version references).
- `bmad-create-epics-and-stories` → `bmad-check-implementation-readiness` → `bmad-sprint-planning`.
