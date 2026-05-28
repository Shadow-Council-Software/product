# Per-floor layout files

Edit **one floor at a time** in **[Layout Studio](../layout-studio/)** (recommended) or by hand in JSON.

## Layout Studio (primary)

```bash
cd enterprise/sim/layout-studio
npm install
npm run dev
```

Open http://127.0.0.1:3098 — align scan underlay, edit polygons, **Save floor**, **Compile → Unity**.

See [layout-studio/README.md](../layout-studio/README.md).

## Files

| File | Purpose | Status |
|------|---------|--------|
| [main.level.json](./main.level.json) | Main level interior + **gap zones** to verify | In progress |
| [basement.level.json](./basement.level.json) | Basement — placeholder until plan provided | TBD |
| [garage.level.json](./garage.level.json) | Garage — placeholder | TBD |
| [exterior.level.json](./exterior.level.json) | Doorbell zone + perimeter coverage band | Virtual only |

Device anchors: [../devices.registry.json](../devices.registry.json)

## Workflow (manual JSON)

If not using Layout Studio:

1. Edit the matching `*.level.json`
2. Merge + validate:

```bash
node enterprise/sim/scripts/merge-layout-floors.mjs
cd enterprise/sim/bridge && npm run validate-layout ../layouts/onimurasame-residence-2026-05-24.json
```

3. Compile for Unity:

```bash
node enterprise/sim/scripts/convert-layout-for-unity.mjs
```

Legacy read-only preview: `node enterprise/sim/poc/serve-preview.mjs` → http://127.0.0.1:3099

## Room kinds

| `kind` | Meaning |
|--------|---------|
| `interior` | Confirmed room from scan |
| `gap` | Orange on preview — **you must rename/split** once verified |
| `placeholder` | Whole floor TBD (basement/garage) |
| `virtual` | Not walkable — coverage UX only |

## Main level gaps (owner input needed)

These zones were **missing from the first trace** and are marked `kind: "gap"`:

- `scan-gap-north-center` — NE of central hall / north of kitchen
- `scan-gap-east-upper` — east upper between bedroom 2 and closet
- `scan-gap-east-strip` — sliver east of mechanical

Replace each gap with real room id/label once confirmed, or merge into adjacent room polygons.

## Coordinates

- Units: **meters**
- Origin: front entrance center (south facade), Z increases **north**
- Envelope: 17.374 × 9.754 m (57′ × 32′) on main level

## Unity

After main floor is verified:

```bash
node enterprise/sim/scripts/convert-layout-for-unity.mjs
```

Unity POC uses **main level interior only** by default.
