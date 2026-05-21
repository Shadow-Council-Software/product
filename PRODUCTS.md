# Products and branches

This monorepo holds **shared methodology on `main`** and **one git branch per product**. Product folders are not merged to `main` unless explicitly promoted as org-wide assets.

## Branch layout

| Branch | Product folder | Status |
|--------|----------------|--------|
| `main` | _(none — BMAD Method, `.agents/skills`, `docs/`)_ | Shared baseline |
| `product/mechanistic-interpreter-testing` | `mechanistic-interpreter-testing/` | AOIS v0 closed — see `V0-RELEASE.md` on branch |
| `product/enterprise` | `enterprise/` | Planning in progress |

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

## Legacy

`feature/initial` mixed the first product with shared repo setup. Use **`product/mechanistic-interpreter-testing`** instead.
