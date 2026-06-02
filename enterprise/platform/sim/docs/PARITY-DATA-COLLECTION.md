# 100% parity — data collection playbook

This is the single workflow to turn **your real house** into **ENTERPRISE layout JSON → Unity/Unreal** without invented geometry.

> **MVP scope:** Layout/sim parity supports desk QA and engine fidelity. It does **not** close acceptance gates G1–G5 (coexistence, soak, HVAC KPIs, fabric restore). Trust the rack and ART evidence for ship decisions; use parity for *place*, not *operational proof*. See [`../../openspec/FR-COVERAGE.md`](../../openspec/FR-COVERAGE.md) (evidence class `desk` only).

## Tools map

| Tool | You provide | We get |
|------|-------------|--------|
| **Mortgage survey PDF** | Already in `layouts/sources/Scanned_20260524-1944.pdf` | Footprint 17.374 × 9.754 m, front = south |
| **`layouts/parity/measurements.json`** | Tape / laser numbers per room | Rectangular polygons → floor JSON |
| **Layout Studio** (`npm run layout-studio:dev`) | Drag vertices, align PDF | Irregular rooms, visual check |
| **`layouts/sources/photos/`** | Pixel 7 wide shots per doorway | Evidence + future KIRI mesh |
| **`layouts/sources/interior/`** | Any interior plan PDF/photo | Faster trace |
| **Matterport basement export** | OBJ when ready | Visual mesh aligned to basement polygons |
| **`node scripts/check-parity.mjs`** | — | % complete + blockers |
| **`node scripts/apply-measurements.mjs`** | — | Push confirmed rects into `floors/*.level.json` |

## Coordinate system (do not change lightly)

- **Origin:** front door center, south facade (Nest doorbell)
- **X:** east · **Z:** north · **Y:** up
- **Units:** meters (Unity 1 unit = 1 m)

## Room list (owner-confirmed program)

See `layouts/parity/house-program.json`.

| Level | Rooms |
|-------|--------|
| **Ground (`main`)** | entry, living, kitchen, stairs |
| **Upper (`upper`)** | 3 bedrooms, hall bath, master + ensuite, stairs |
| **Basement** | bedroom, laundry, stairs |
| **Garage** | garage |

## How to fill measurements (fast path)

Edit `layouts/parity/measurements.json` for each room:

1. Measure **length** and **width** (inside walls, clear floor).
2. Pick the **south-west corner** of the room on the floor plan (minimum X and Z of the room rectangle).
3. Set `cornerX`, `cornerZ`, `lengthM`, `widthM`, `ceilingHeightM`.
4. Set `"status": "confirmed"`.
5. Run:

```bash
cd enterprise/sim
node scripts/apply-measurements.mjs
node scripts/merge-layout-floors.mjs
node scripts/check-parity.mjs
node scripts/convert-layout-for-unity.mjs
```

Irregular rooms (L-shape, angled walls): leave `status: "pending"` and trace in **Layout Studio** instead.

## Evidence (required for sign-off)

Add entries to `measurements.json` → `evidence`:

```json
{
  "id": "photo-living-01",
  "type": "photo",
  "path": "photos/living-from-entry.jpg",
  "roomId": "living-room",
  "notes": "Wide shot from entry door"
}
```

Drop files under `layouts/sources/photos/` or `layouts/sources/interior/`.

## Parity definition

**100% parity** means:

- [ ] Every `requiredRooms` entry has `kind: "interior"` and polygon area > 0.05 m²
- [ ] Control dimensions within 2 cm of survey footprint
- [ ] No overlapping interior polygons (except stairs marked `gap`)
- [ ] Device anchors sit inside the correct room polygon
- [ ] You walked the real house against Unity top-down or Layout Studio canvas

## Session order (recommended)

1. **Site** — Layout Studio → main → align PDF → save alignment  
2. **Ground** — living + kitchen + entry measurements  
3. **Upper** — all bedrooms and baths  
4. **Basement** — bedroom + laundry (+ Matterport align)  
5. **Garage** — separate footprint if needed  
6. **Devices** — confirm thermostat room, doorbell, basement cam  
7. **Compile** — Layout Studio **Compile → Unity** or scripts above  

## What to paste in chat (batch format)

Copy this block filled in (meters or feet — say which):

```text
UNITS: meters
GROUND living: L= _ W= _ ceiling= _
GROUND kitchen: L= _ W= _ ceiling= _
UPPER bed1: L= _ W= _
UPPER bed2: L= _ W= _
UPPER bed3: L= _ W= _  (name: ___)
UPPER master: L= _ W= _
UPPER hall bath: L= _ W= _
UPPER master bath: L= _ W= _
BASEMENT bedroom: L= _ W= _ ceiling= _
BASEMENT laundry: L= _ W= _
GARAGE: L= _ W= _
STAIRS location: near ___ corner of house
THERMOSTAT: in ___ room, on ___ wall
```

Agent will enter values into `measurements.json`, run apply + parity report, and adjust Layout Studio as needed.
