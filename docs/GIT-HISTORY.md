---
title: Git commit groups
updated: 2026-05-21
---

# Git commit groups

Product work was imported in **ordered commit groups (G1–G11)** on release branches so history stays reviewable by topic. No product is release-ready yet; groups are archival structure on **`release/*`**, not a shipping claim.

## Current branch roles

| Branch | Role |
|--------|------|
| `main` | Shared BMAD Method, `.agents/skills`, repo docs (becomes **`master`** when org-wide promotion starts) |
| `product/<slug>` | Active development for one product |
| `release/<slug>/<version>` | Frozen baseline to fork feature branches without cross-product noise |

**Removed:** `initial` (temporary grouped snapshot; deleted after `release/*` existed). **`feature/initial`** is legacy—delete when convenient.

## Planned (when a product is ready to ship)

| Branch | Role |
|--------|------|
| `master` | Promoted shared assets usable by all products (rename from `main`) |
| `develop` | Integration line for product work before promotion to `master` |
| `product/<slug>` | Continues per-product isolation until merge to `develop` |

Until then, stay on **`product/*`** and **`release/*`**; do not open `develop` prematurely.

## Group index

Groups **G2–G9** live on `release/mechanistic-interpreter-testing/v0`. **G10** lives on `release/enterprise/planning-v0`. **G1** is on `main`.

| Group | Original SHA | Subject | Scope |
|-------|--------------|---------|--------|
| **G1** | `b9d813b` | Branch-per-product layout | `PRODUCTS.md`, root `README.md` |
| **G2** | `6dd6022` | Mechanistic PRD foundation | PRD, evidence matrix, validation report, architecture start |
| **G3** | `0be5001` | Readiness elicitation | `readiness-elicitation-session.md` |
| **G4** | `6959853` | Architecture & ontology | Glossary, epics, open decisions, claim template |
| **G5** | `53b0217` | Trace v0 core | Schemas, fixtures, `validate_trace.py` |
| **G6** | `e5e8b1c` | Certificate & replay | Freeze, binding, divergence classifier |
| **G7** | `f2e8601` | Trace-47 falsification | Prereg, ablation, NSHR gates |
| **G8** | `2ae7f2f` | AOIS v0 closure | Bytecode stub, expert packets, `V0-RELEASE.md` |
| **G9** | `2aae386` | Brainstorming lineage | `_bmad-output/brainstorming/` |
| **G10** | `2e2051d` | Enterprise planning | `enterprise/` PRD, UX, artifacts art-01–art-08 |
| **G11** | `632c1d9` | History manifest | This file and branch layout docs (snapshot branch, now removed) |

Cherry-picked SHAs on release lines may differ; use `git log --grep="group G"` on the release branch to inspect.

## Release branch anchors

| Release branch | Includes groups | Excludes |
|----------------|-----------------|----------|
| `release/mechanistic-interpreter-testing/v0` | G1–G9 | G10 (enterprise) |
| `release/enterprise/planning-v0` | G1 + G10 | G2–G9 |

## Forking new work

```bash
git fetch origin
git checkout -b feature/my-work origin/release/mechanistic-interpreter-testing/v0
# or
git checkout -b feature/my-work origin/release/enterprise/planning-v0
```

## Verify mechanistic v0

See `mechanistic-interpreter-testing/V0-RELEASE.md` on `release/mechanistic-interpreter-testing/v0` or `product/mechanistic-interpreter-testing`.
