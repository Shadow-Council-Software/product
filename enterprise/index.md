# ENTERPRISE Main Computer — Program hub

**Product:** Home starship operations center (LCARS) + orchestration platform  
**Branch:** `product/enterprise` (see [../PRODUCTS.md](../PRODUCTS.md))

---

## Workspaces (open the right folder in Cursor)

| Workspace | Path | Lead |
|-----------|------|------|
| **UX / LCARS** | [ux/](./ux/) · [enterprise-ux.code-workspace](../enterprise-ux.code-workspace) | Okudas + Gene Roddenberry |
| **Platform** | [platform/](./platform/) · [enterprise-platform.code-workspace](../enterprise-platform.code-workspace) | Captain Picard engineering crew |
| **Shared** | [shared/](./shared/) | Cross-surface contracts |

Full guide: [WORKSPACES.md](./WORKSPACES.md)

---

## Canonical entry points (by concern)

| Concern | Document |
|---------|----------|
| LCARS strict law | [ux/lcars-ui-authoritative-spec.md](./ux/lcars-ui-authoritative-spec.md) |
| UX specification | [ux/ux-design-specification.md](./ux/ux-design-specification.md) |
| Screen IA | [ux/lcars-screen-inventory.md](./ux/lcars-screen-inventory.md) |
| PRD / gates | [platform/prd.md](./platform/prd.md) |
| Architecture | [platform/architecture.md](./platform/architecture.md) |
| OpenSpec | [platform/openspec/](./platform/openspec/) |
| TNG copy | [shared/tng-interaction-contract.md](./shared/tng-interaction-contract.md) |
| Sim / Unity | [platform/sim/](./platform/sim/) |
| Sim panel UX | [ux/sim-ux-specification.md](./ux/sim-ux-specification.md) |

---

## Precedence (conflict resolution)

1. Gates **G1–G5** and FR/NFR in [platform/prd.md](./platform/prd.md)
2. [platform/openspec/specs/](./platform/openspec/specs/)
3. [ux/lcars-ui-authoritative-spec.md](./ux/lcars-ui-authoritative-spec.md) for UI mutation law
4. [ux/ux-design-specification.md](./ux/ux-design-specification.md) for LCARS UX
5. [platform/architecture.md](./platform/architecture.md) for technical design

---

## Agent charters

- **UX council:** [ux/AGENTS.md](./ux/AGENTS.md)
- **Engineering crew:** [platform/AGENTS.md](./platform/AGENTS.md)
