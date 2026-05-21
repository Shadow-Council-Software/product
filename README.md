# Shadow Council Software — Product

Org-level product workspace. Methodology and AI agent skills are provided by [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) (installed under `_bmad/` with Cursor skills in `.agents/skills/`).

## BMAD

- **Update / reconfigure:** `npx bmad-method install` (from this directory)
- **Headless example:** `npx bmad-method install --yes --directory . --modules bmm --tools cursor`

Artifact outputs default to `_bmad-output/` and `docs/` per installer configuration.

## Products (branch-per-product)

Each product lives on its own branch (`product/<slug>`). **`main`** keeps BMAD Method and shared agent skills only.

See **[PRODUCTS.md](./PRODUCTS.md)** for branch table and workflow. When a product is ready to ship, the repo will add **`develop`** (integration) and **`master`** (promoted shared assets); until then, use **`product/*`** and **`release/*`** only.
