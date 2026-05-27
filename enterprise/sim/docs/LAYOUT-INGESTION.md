# Layout ingestion — measured house parity

## Objective

Import **official documentation, coordinates, and real measurements** so the Unity harness matches the physical house at 1:1 scale (within documented tolerance).

## Steps

1. **Choose units** — `meters` recommended (Unity 1 unit = 1 meter).
2. **Set origin** — pick a fixed reference point (e.g. front door center, ground level). All coordinates are relative to `metadata.origin.position`.
3. **Trace rooms** — for each room, supply a closed `floorPolygon` in XZ (clockwise when viewed from above).
4. **Place stations** — map each Matter station (`env.nest.primary`, etc.) to `roomId` + `position` + `matterNodeId`.
5. **Attach sources** — list blueprints, survey PDFs, or CAD exports in `metadata.sources` with `scaleVerified: true` when confirmed.

## File location

```text
enterprise/sim/layouts/house-layout.json   ← your data (gitignored)
enterprise/sim/layouts/house-layout.example.json
```

## Validation

```bash
cd enterprise/sim/bridge
npm run validate-layout
```

## Unity import

On Play, `HouseLayoutLoader` reads the JSON path from `SIM_LAYOUT_PATH` env var or `StreamingAssets/house-layout.json`.

## Tolerance checklist

- [ ] Longest wall length matches documentation within 1 cm
- [ ] Door widths match specification
- [ ] Thermostat height above floor documented
- [ ] Station `stationId` matches engine registry (`env.nest.primary` for MVP)

## What to send

When ready, provide:

- Floor plan PDF/CAD with dimension strings
- Room name → polygon vertices or wall lengths + angles
- Device locations (Nest, sensors) with height and room
- Preferred world origin

The schema accepts incremental updates — start with one floor and expand.

## Matterport photogrammetry (optional)

For **1:1 mesh parity** from a Matterport scan (OBJ Matterpak), use the dedicated pipeline:

- [MATTERPORT-INGESTION.md](./MATTERPORT-INGESTION.md)
- CLI: `enterprise/sim/matterport-ingest`

Survey JSON remains authoritative for **stations and room IDs**; Matterport mesh is aligned via `geometry` + `alignment-manifest.json` and verified by `parity-report.json`.
