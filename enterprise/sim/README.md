# ENTERPRISE Digital Twin — House Simulation Harness

Software-only path for visualizing the house with ENTERPRISE systems running **without rack hardware or live Nest access**. Replaces Matter fabric with a spatial simulator; Unity renders the home; LCARS and the engine use the same APIs as production.

## Engine choice: Unity (recommended)

| Criterion | Unity | Unreal |
|-----------|-------|--------|
| Architectural measurement parity | Strong (ProBuilder, CAD import, unit system) | Strong, heavier pipeline |
| LCARS integration | WebView / side-by-side browser | WebBrowser widget, heavier |
| Iteration speed for UI + sim loop | Fast | Slower |
| LLM screenshot / capture pipeline | Simple (`ScreenCapture`, REST POST) | Render targets, more setup |
| Repo footprint / CI | LFS optional, scripts in git | Very large |

**Decision:** **Unity 2022 LTS+** as primary harness. Unreal remains supported via the same **Sim Bridge protocol** (JSON over HTTP/WS) if you later add `enterprise/sim/unreal/`.

## Architecture

```
┌─────────────────┐     WS/REST      ┌──────────────────┐
│  LCARS (web)    │◄────────────────►│  Engine (Fastify)│
└─────────────────┘                  │  MATTER_ADAPTER= │
                                     │  sim | mock | ohf│
┌─────────────────┐     REST/WS      └────────┬─────────┘
│  Unity Harness  │◄─────────────────────────┤
│  (3D house)     │                          │
└────────┬────────┘                          ▼
         │ POST /sim/visual-aid     ┌──────────────────┐
         └─────────────────────────►│  Sim Bridge      │
                                      │  spatial + layout│
                                      └──────────────────┘
                                              ▲
                                              │ house-layout.json
                                      ┌───────┴──────────┐
                                      │ Your floor plans │
                                      │ (coords + dims)  │
                                      └──────────────────┘
```

## Quick start (no hardware)

Terminal 1 — Sim Bridge:

```bash
cd enterprise/sim/bridge
npm install
npm run dev
```

Terminal 2 — Engine (`sim` adapter):

```bash
cd enterprise/runtime
MATTER_ADAPTER=sim SIM_BRIDGE_URL=http://127.0.0.1:3002 npm run dev:engine
```

Terminal 3 — LCARS:

```bash
npm run dev:lcars
```

Terminal 4 — Unity (see [unity/README.md](./unity/README.md)):

Open `enterprise/sim/unity/ENTERPRISE.HouseHarness` in Unity Hub, press Play.

## Layout ingestion (100% parity)

Provide house data as JSON validated against [house-layout.schema.json](./house-layout.schema.json). See [docs/LAYOUT-INGESTION.md](./docs/LAYOUT-INGESTION.md).

### Matterport scan path

After a Matterport house scan, order **Matterpak** and run the ingest CLI:

- [docs/MATTERPORT-INGESTION.md](./docs/MATTERPORT-INGESTION.md)
- [matterport-ingest/](./matterport-ingest/)

Aligns OBJ mesh to your survey PDF/JSON; Unity loads via `MatterportMeshLoader` + `GET /sim/geometry/manifest`.

Place your file at:

`enterprise/sim/layouts/house-layout.json` (gitignored until you add it — use `.example` as template)

## LLM visual aids

Unity captures frames + annotations and POSTs to the Sim Bridge. Agents read `GET /sim/visual-aid/latest` when assisting with LCARS. See [docs/LLM-VISUAL-AID.md](./docs/LLM-VISUAL-AID.md).

## OpenSpec

Change: `openspec/changes/digital-twin-harness/`

## Related

- Runtime mock adapter: `enterprise/runtime/engine/src/adapters/mock-matter-adapter.ts`
- W0 spike (real sidecar): `enterprise/spike/w0/` — use only when rack available
