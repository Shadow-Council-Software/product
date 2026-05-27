# Proposal: Matterport → digital twin ingest

## Problem

Manual PDF tracing yields correct **logical** layout (rooms, stations) but not photorealistic **mesh** parity. Matterport scans provide OBJ geometry; we need a repeatable path to align that mesh to the existing survey (`onimurasame-residence-2026-05-24.json`) and feed Unity/Unreal.

## Solution

1. `@enterprise/matterport-ingest` CLI — discover Matterpak, publish assets, merge `geometry` into `house-layout.json`, emit parity report.
2. Schema extension — `geometry` block on `house-layout.schema.json`.
3. Sim Bridge — `GET /sim/geometry/manifest` for engine-agnostic consumers.
4. Unity — `MatterportMeshLoader` (bounds proxy MVP; full OBJ importer follow-up).

## Out of scope

- Matterport Model API auto-download (documented; implement when API token available).
- Unreal project scaffold (protocol only).
- Replacing survey polygons with mesh-only spatial truth (stations stay on traced layout).

## Success criteria

- Operator can ingest Matterpak from `layouts/matterport/inbox/` with alignment manifest.
- Parity report PASS/FAIL with ≤1 cm wall tolerance targets.
- Unity harness reads geometry via Sim Bridge or StreamingAssets.
