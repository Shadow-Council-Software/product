# Onimurasame residence layout

Official owner-provided floor plan ingested **2026-05-24**.

| Field | Value |
|-------|--------|
| **Source PDF** | [sources/Scanned_20260524-1944.pdf](./sources/Scanned_20260524-1944.pdf) |
| **Per-floor edits** | [floors/](./floors/) — **edit here first** |
| **Merged JSON** | [onimurasame-residence-2026-05-24.json](./onimurasame-residence-2026-05-24.json) (generated) |
| **Devices** | [devices.registry.json](./devices.registry.json) |
| **Preview** | `node enterprise/sim/poc/serve-preview.mjs` → http://127.0.0.1:3099 |

## Nest / security devices

| Device | Status | Notes |
|--------|--------|-------|
| Nest Learning Thermostat (latest gen) | Installed | Central hall — adjacent to kitchen, faces front (`env.nest.thermostat.primary` / `env.nest.primary`) |
| Nest Doorbell 3rd gen | Installed | Main door (`sec.nest.doorbell.main`) |
| Nest — basement | Installed | Confirm cam vs Protect model |
| Nest + rain lights | Planned | Garage top (`sec.nest.garage.floodlight`) |
| Garage indoor cam | Planned | `sec.nest.garage.indoor` |
| Full exterior wrap | Planned | Use Unity coverage report to place additional `devices[]` |

## Pending measured input

- Basement room outline (currently full-footprint placeholder)
- Garage dimensions and position relative to main house
- Lot line for accurate `exterior-perimeter` polygon
- Any additional Nest cam positions as you plan coverage

## Commands

```bash
# Preview (per-floor tabs)
node enterprise/sim/poc/serve-preview.mjs

# After editing layouts/floors/*.level.json
node enterprise/sim/scripts/merge-layout-floors.mjs
cd enterprise/sim/bridge
npm run validate-layout ../layouts/onimurasame-residence-2026-05-24.json
```
