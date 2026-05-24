# Onimurasame residence layout

Official owner-provided floor plan ingested **2026-05-24**.

| Field | Value |
|-------|--------|
| **Source PDF** | [sources/Scanned_20260524-1944.pdf](./sources/Scanned_20260524-1944.pdf) |
| **Layout JSON** | [onimurasame-residence-2026-05-24.json](./onimurasame-residence-2026-05-24.json) |
| **Envelope** | 57 ft × 32 ft (17.37 m × 9.75 m) main level |
| **Coverage UX** | [../docs/COVERAGE-UX.md](../docs/COVERAGE-UX.md) |

## Nest / security devices

| Device | Status | Notes |
|--------|--------|-------|
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
cd enterprise/sim/bridge
npm run validate-layout ../layouts/onimurasame-residence-2026-05-24.json
curl http://127.0.0.1:3002/sim/coverage/report
```
