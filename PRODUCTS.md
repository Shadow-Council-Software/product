# Products and branches

This monorepo holds **shared methodology on `main`** and **one git branch per product**. Product folders are not merged to `main` unless explicitly promoted as org-wide assets.

## Branch layout

| Branch | Product folder | Status |
|--------|----------------|--------|
| `main` | _(none — BMAD Method, `.agents/skills`, `docs/`)_ | Shared baseline |
| `initial` | `mechanistic-interpreter-testing/` + `enterprise/` + brainstorming | Full snapshot; grouped commits — see [`docs/GIT-HISTORY.md`](docs/GIT-HISTORY.md) |
| `product/mechanistic-interpreter-testing` | `mechanistic-interpreter-testing/` | Active development (fork from release v0) |
| `product/enterprise` | `enterprise/` | Active development (fork from planning release) |
| `release/mechanistic-interpreter-testing/v0` | `mechanistic-interpreter-testing/` | Frozen AOIS v0 baseline (G1–G9) |
| `release/enterprise/planning-v0` | `enterprise/` | Frozen planning baseline (G1 + G10) |

## Working on a product

```bash
git fetch origin
git checkout product/<slug>
```

BMad planning output path is set per branch in `_bmad/custom/config.toml` and `_bmad/bmm/config.yaml` (`planning_artifacts`). Do not commit product A’s folder while on product B’s branch.

## Adding a new product

1. `git checkout main && git pull`
2. `git checkout -b product/<new-slug>`
3. Create `<new-slug>/` (or agreed folder name) with `index.md`
4. Point `planning_artifacts` at that folder in both BMad config files
5. Push `product/<new-slug>` — do not merge product docs to `main` by default

## Commit groups on `initial`

All work is applied in labeled groups **G2–G10** (plus **G1** from `main`). Full SHA table: [`docs/GIT-HISTORY.md`](docs/GIT-HISTORY.md).

## Legacy

| Branch | Replacement |
|--------|-------------|
| `feature/initial` | `initial` (grouped history) + `release/*` / `product/*` |
