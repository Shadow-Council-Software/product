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
   - `Main Camera` → attach `VisualAidCapture.cs`

## Configuration (Inspector / env)

| Field | Default | Description |
|-------|---------|-------------|
| Sim Bridge URL | `http://127.0.0.1:3002` | Spatial + visual aid API |
| Engine URL | `http://127.0.0.1:3001` | Optional LCARS correlation |
| Capture interval | 5s | Visual aid POST frequency |

## Play mode

1. Start Sim Bridge + Engine (`MATTER_ADAPTER=sim`).
2. Press Play — rooms extrude from layout polygon; thermostat markers appear at station positions.
3. Captures write to Sim Bridge → agents read `/sim/visual-aid/latest`.

## Packages (recommended)

- **ProBuilder** — refine room meshes from measurements
- **TextMeshPro** — station labels
- **Newtonsoft Json** — Unity package `com.unity.nuget.newtonsoft-json` for layout parse

## Unreal alternative

Same Sim Bridge REST/WS protocol. Blueprint nodes call identical endpoints; see `enterprise/sim/docs/LLM-VISUAL-AID.md`.

## Next steps when you provide layout

Replace `house-layout.json` with measured polygons and station positions. Re-run `npm run validate-layout` in bridge.
