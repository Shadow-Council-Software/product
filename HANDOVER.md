# Session handover — mechanistic interpreter / BMad planning

**Branches:** `product/mechanistic-interpreter-testing` (active work) · `release/mechanistic-interpreter-testing/v0` (frozen v0). Planned later: `develop` + `master` when products ship — see `PRODUCTS.md`.

**Date:** 2026-05-04

## What was completed

- **PRD** (`mechanistic-interpreter-testing/prd.md`): Full BMad create-PRD workflow through polish; phased (hosted-first, flagship workflow, G1–G3); FR1–FR58; NFRs including deferred-metrics table; document map; FR↔journey map; scientific computational assumptions; developer-tool language/install/examples sections.
- **Evidence matrix** (`mechanistic-interpreter-testing/evidence-decision-matrix.md`): E-001–E013, D-001–D003; **Linked journeys** column aligned with PRD journeys.
- **PRD validation** (`mechanistic-interpreter-testing/prd-validation-report.md`): Post-edit revalidation **Pass** / complete.
- **Edit workflow:** Validation-driven PRD edits applied; menu exits completed.
- **Architecture workflow started:** `mechanistic-interpreter-testing/architecture.md` created from template; **step 1** (`stepsCompleted: [1]`) only. **Next:** user replies **[C]** in a fresh architecture run to load **`bmad-create-architecture`** step `step-02-context.md` (do not skip step-01b if you resume mid-file—currently fresh after step 1).
- **Repo layout:** All product planning artifacts moved from `_bmad-output/planning-artifacts/` to **`mechanistic-interpreter-testing/`** (product-scoped folder). Empty `planning-artifacts` directory removed.
- **BMad config:** `planning_artifacts` → `{project-root}/mechanistic-interpreter-testing` in `_bmad/bmm/config.yaml` and **`_bmad/custom/config.toml`** (override survives installer).

## Explicit non-goals / not started

- No application code for the interpreter, gates, or hosting.
- **Implementation artifacts** path unchanged (`_bmad-output/implementation-artifacts`); consider product-scoping later.
- **`project_name`** in BMad config still `product`; rename only if you want display consistency with folder slug.

## Recommended next steps (order)

1. Continue **`bmad-create-architecture`** from `architecture.md` (confirm **[C]** after step-01, then follow steps through completion).
2. **`bmad-create-epics-and-stories`** after architecture.
3. **`bmad-check-implementation-readiness`** before heavy implementation.
4. Optional: second product → new sibling folder + switch `planning_artifacts` in `_bmad/custom/config.toml`.

## Paths quick reference

| Artifact | Path |
|----------|------|
| PRD | `mechanistic-interpreter-testing/prd.md` |
| Evidence matrix | `mechanistic-interpreter-testing/evidence-decision-matrix.md` |
| Validation report | `mechanistic-interpreter-testing/prd-validation-report.md` |
| Architecture (in progress) | `mechanistic-interpreter-testing/architecture.md` |

## Remote

- **Remote:** `origin` → `git@github.com:Shadow-Council-Software/product.git`
- **Product branch:** `product/mechanistic-interpreter-testing`
- **Release baseline:** `release/mechanistic-interpreter-testing/v0`
