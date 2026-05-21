---
title: Git commit groups (initial branch)
updated: 2026-05-21
branch: initial
---

# Git commit groups

The **`initial`** branch records all product work in **ordered commit groups (G1–G11)** so history is reviewable by topic. **`main`** holds shared BMAD assets only. **`product/*`** is the active development line per product. **`release/*`** is the stable fork point for further feature branches.

## Branch roles

| Branch | Role |
|--------|------|
| `main` | Shared BMAD Method, `.agents/skills`, `PRODUCTS.md` |
| `initial` | Full monorepo snapshot — all groups G1–G11 |
| `product/<slug>` | Ongoing work for one product (BMad path scoped to that folder) |
| `release/<slug>/<version>` | Frozen baseline to branch features without cross-product noise |

## Group index (initial branch)

| Group | Commit | Subject | Scope |
|-------|--------|---------|--------|
| **G1** | `b9d813b` | Branch-per-product layout | `PRODUCTS.md`, root `README.md` (from `main`) |
| **G2** | `6dd6022` | Mechanistic PRD foundation | `HANDOVER.md`, `mechanistic-interpreter-testing/prd.md`, evidence matrix, validation report, architecture start, BMad → `mechanistic-interpreter-testing/` |
| **G3** | `0be5001` | Readiness elicitation | `readiness-elicitation-session.md` |
| **G4** | `6959853` | Architecture & ontology | Glossary, epics, open decisions, claim template, full architecture, university sources, index |
| **G5** | `53b0217` | Trace v0 core | `trace-v0` / `certificate-v0` schemas, calculator + trace-47 fixtures, `validate_trace.py` |
| **G6** | `e5e8b1c` | Certificate & replay | `freeze_certificate.py`, binding verify, replay divergence classifier + demo logs |
| **G7** | `f2e8601` | Trace-47 falsification | Prereg, protocol, ablation scripts/fixtures, NSHR + promotion integrity gates |
| **G8** | `2ae7f2f` | AOIS v0 closure | Bytecode stub, expert packets, ADRs, `V0-RELEASE.md`, README golden path, E-014 evidenced |
| **G9** | `2aae386` | Brainstorming lineage | `_bmad-output/brainstorming/` session + atomic wins backlog |
| **G10** | `2e2051d` | Enterprise planning | `enterprise/` PRD, UX, LCARS inventory, artifacts art-01–art-08 |
| **G11** | _(this doc)_ | History manifest | `docs/GIT-HISTORY.md`, `initial` branch README notes |

## Release branch anchors

| Release branch | Tip commit | Includes groups | Excludes |
|----------------|------------|-----------------|----------|
| `release/mechanistic-interpreter-testing/v0` | `2aae386` | G1–G9 | G10 (enterprise) |
| `release/enterprise/planning-v0` | G10 on `main` | G1 + G10 | G2–G9 mechanistic implementation |

## Forking new work

```bash
# Mechanistic feature after v0
git fetch origin
git checkout -b feature/my-work origin/release/mechanistic-interpreter-testing/v0

# Enterprise feature after planning drop
git checkout -b feature/my-work origin/release/enterprise/planning-v0
```

## Legacy

| Branch | Notes |
|--------|--------|
| `feature/initial` | Pre-grouped history; superseded by `initial` + `release/*` |

## Verify mechanistic v0 (on release or initial through G8+)

See `mechanistic-interpreter-testing/V0-RELEASE.md`.
