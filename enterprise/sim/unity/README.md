# Unity House Harness

Unity **2022.3 LTS** or newer. Import this folder as a project or copy scripts into your own Unity project.

## Setup

1. Install [Unity Hub](https://unity.com/download) + Unity 2022.3 LTS with **WebGL/Standalone** module.
2. Open `enterprise/sim/unity/ENTERPRISE.HouseHarness` (create empty 3D URP project if folder is scripts-only).
3. Copy `Assets/Scripts/**` into your project's Assets tree.
4. Copy `enterprise/sim/layouts/house-layout.example.json` → `Assets/StreamingAssets/house-layout.json` (or set `SIM_LAYOUT_PATH`).
5. Add empty GameObjects:
   - `SimBridgeClient` → attach `SimBridgeClient.cs`
   - `HouseBuilder` → attach `HouseLayoutLoader.cs`
   - `HealthStripPlate` → attach `HealthStripRenderer.cs`
   - `Main Camera` → attach `VisualAidCapture.cs` (set `focusRoomId` to `central-hall`)

## Configuration (Inspector / env)

| Field | Default | Description |
|-------|---------|-------------|
| Sim Bridge URL | `http://127.0.0.1:3002` | Spatial + visual aid API |
| Engine URL | `http://127.0.0.1:3001` | Optional LCARS correlation |
| Capture interval | 5s | Visual aid POST frequency |

## Play mode

1. Start Sim Bridge + Engine (`MATTER_ADAPTER=sim`).
2. Press Play — rooms extrude from layout polygon; thermostat markers appear at station positions.
3. `HealthStripRenderer` polls `GET /api/v1/alerts` — escalate/de-escalate in LCARS web; strip updates ≤1s (SIM-AC-02).
4. Position camera ~3 m from central-hall plate anchor `[8.839, 1.45, 3.45]` for legibility review (SIM-AC-04).
5. Captures write to Sim Bridge → agents read `/sim/visual-aid/latest`.

**Quick bootstrap:** Add empty GameObject `Harness` → attach `HarnessAutoBootstrap.cs` only (creates SimBridgeClient, HouseBuilder, HealthStripPlate, camera + VisualAidCapture).

## Sprint 1 proof checklist

| Step | Artifact | Gate |
|------|----------|------|
| Capabilities manifest | `renderer-capabilities-descriptor.yaml` | SIM-AC-01 |
| HealthStrip vs live FSM | `HealthStripRenderer.cs` + engine running | SIM-AC-02 |
| central-hall anchor | layout `env.nest.primary` @ `[8.839, 1.45, 3.45]` | SIM-AC-03 |
| Engine parity cert | `engine-parity.certificate.yaml` (`okudaAudit: PENDING` until capture) | C-SIM-04 |

CLI verification (no Unity required for scaffold checks):

```bash
node enterprise/sim/scripts/verify-sprint1-proof.mjs
```

## Packages (recommended)

- **ProBuilder** — refine room meshes from measurements
- **TextMeshPro** — station labels
- **Newtonsoft Json** — Unity package `com.unity.nuget.newtonsoft-json` for layout parse

## Unreal alternative

Same Sim Bridge REST/WS protocol. Blueprint nodes call identical endpoints; see `enterprise/sim/docs/LLM-VISUAL-AID.md`.

## Next steps when you provide layout

Replace `house-layout.json` with measured polygons and station positions. Re-run `npm run validate-layout` in bridge.
