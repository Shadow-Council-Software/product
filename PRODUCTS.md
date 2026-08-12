# Products and branches

This monorepo holds **shared methodology on `main`** and **one git branch per product**. Product folders are not merged to `main` unless explicitly promoted as org-wide assets; `enterprise/` has been promoted (runtime sprints merged via PRs #28 and #54). **No product is release-ready yet.**

## Branch layout (now)

| Branch | Product folder | Status |
|--------|----------------|--------|
| `main` | `enterprise/` (promoted) — plus BMAD Method, `.agents/skills`, `docs/` | Shared baseline |
| `product/clipforge` | `clipforge/` | Active development — editor-simulation platform (POC exit evidence complete, pending review) |
| `product/enterprise` | `enterprise/` | Active development (from planning release; includes Matterport ingest via PR #57) |
| `enterprise` | `enterprise/` (restructured into `platform/` + `ux/` workspaces) | Active development — **diverged from `product/enterprise`; consolidation pending** |
| `product/mechanistic-interpreter-testing` | `mechanistic-interpreter-testing/` | Active development (from release v0) |
| `release/mechanistic-interpreter-testing/v0` | `mechanistic-interpreter-testing/` | Frozen AOIS v0 baseline |
| `release/enterprise/planning-v0` | `enterprise/` | Frozen planning baseline |

Commit groups **G2–G11** are documented in [`docs/GIT-HISTORY.md`](docs/GIT-HISTORY.md) (imported via release branches).

## Planned (when a product ships)

| Branch | Role |
|--------|------|
| `master` | Promoted shared assets for all products (today: `main`) |
| `develop` | Integration branch before promotion to `master` |

Product branches merge into `develop` first; only vetted shared assets reach `master`. Until a product is ready, keep working on **`product/*`** and **`release/*`** only.

## Working on a product

```bash
git fetch origin
git checkout product/<slug>
```

BMad `planning_artifacts` is scoped per branch in `_bmad/custom/config.toml` and `_bmad/bmm/config.yaml`. Do not commit product A’s folder while on product B’s branch.

## Product isolation guard (CI-enforced)

The one-product-per-branch rule is enforced by CI, not just convention: the
**Product isolation** workflow (`.github/workflows/product-isolation.yml`)
fails any PR whose diff touches more than one folder registered in
`.github/product-dirs.txt`, and blocks unregistered product-like folders
(new top-level directories containing `index.md`) until they are registered.

Why: in May 2026, commit `d4fdfb8` mixed `enterprise/` work into the
clipforge product branch; the Matterport ingest pipeline was stranded there
for months and recovered only by audit (PR #57). The guard makes that class
of mistake fail fast.

## Adding a new product

1. `git checkout main && git pull`
2. `git checkout -b product/<new-slug>`
3. Create `<new-slug>/` with `index.md`
4. Register `<new-slug>` in `.github/product-dirs.txt` (the isolation guard blocks unregistered product folders)
5. Point `planning_artifacts` at that folder in both BMad config files
6. Add the product to the branch table in this file
7. When stable, add `release/<new-slug>/<version>` from that line
8. Push `product/<new-slug>` — do not merge product docs to `main` by default

## Removed / legacy

| Branch | Status |
|--------|--------|
| `initial` | **Deleted** — grouped snapshot; content lives on `release/*` |
| `feature/initial` | Legacy; safe to delete on remote |
| `wip/clipforge-enterprise-handoff-2026-05-29` | **Deleted 2026-08-12** — handoff snapshot; unique content recovered via PR #57 |
| `wip/enterprise-lcars-ux-uncommitted-backup` | Safety snapshot of uncommitted enterprise UX work found 2026-08-12; delete once the work lands properly |
