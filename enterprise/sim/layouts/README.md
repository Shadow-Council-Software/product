# Onimurasame residence layout

Official owner-provided floor plan ingested **2026-05-24**.

| Field | Value |
|-------|--------|
| **Source PDF** | [sources/Scanned_20260524-1944.pdf](./sources/Scanned_20260524-1944.pdf) |
| **Layout JSON** | [onimurasame-residence-2026-05-24.json](./onimurasame-residence-2026-05-24.json) |
| **Envelope** | 57 ft × 32 ft (17.37 m × 9.75 m) |
| **Origin** | Front entrance center, south facade |
| **Units in JSON** | meters (converted from feet on plan) |

## Rooms (from labeled plan)

| Room | Plan size |
|------|-----------|
| Home Office | 10′ × 10′ |
| Living Room | 13′ × 8′ |
| Master Bedroom | 14′ × 11′ |
| Kitchen / Dining | 10′ × 13′ |
| Second Bedroom | 9′ × 11′ |
| Shared Bathroom | 4′ × 8′ |
| Mechanical Room | 12′ × 7′ |
| Hall Closet | 5′ × 2′ |

Hallways (`entry-hall`, `hall-to-master`, `central-hall`) are inferred from circulation gaps; refine in Unity against the scan overlay.

## Simulated Nest

`env.nest.primary` is placed in the **living room** on the south wall (typical install height 1.45 m). **Confirm** actual thermostat room/wall if different.

## Verification

```bash
cd enterprise/sim/bridge
npm run validate-layout ../layouts/onimurasame-residence-2026-05-24.json
SIM_LAYOUT_PATH=../layouts/onimurasame-residence-2026-05-24.json npm run dev
```

## Unity

Copy layout to `StreamingAssets/house-layout.json` or set `SIM_LAYOUT_PATH` before starting Sim Bridge.

Scale check: longest exterior wall in Unity should measure **17.37 m** (57 ft).
