# Products and branches

This monorepo holds **shared methodology on `main`** and **one git branch per product**. Product folders are not merged to `main` unless explicitly promoted as org-wide assets. **No product is release-ready yet.**

## Branch layout (now)

| Branch | Product folder | Status |
|--------|----------------|--------|
| `main` | _(none — BMAD Method, `.agents/skills`, `docs/`)_ | Shared baseline |
| `product/mechanistic-interpreter-testing` | `mechanistic-interpreter-testing/` | Active development (from release v0) |
| `product/enterprise` | `enterprise/` | Active development (from planning release) |
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

## Adding a new product

1. `git checkout main && git pull`
2. `git checkout -b product/<new-slug>`
3. Create `<new-slug>/` with `index.md`
4. Point `planning_artifacts` at that folder in both BMad config files
5. When stable, add `release/<new-slug>/<version>` from that line
6. Push `product/<new-slug>` — do not merge product docs to `main` by default

## Removed / legacy

| Branch | Status |
|--------|--------|
| `initial` | **Deleted** — grouped snapshot; content lives on `release/*` |
| `feature/initial` | Legacy; safe to delete on remote |
