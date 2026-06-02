# Layout Studio

Web workflow to **review and edit** per-floor room polygons against owner scans, then **compile** validated layouts for the Unity harness.

Auto-traced rooms in `layouts/floors/*.level.json` are **assist only** — not ground truth until you save from this tool.

## Quick start

```bash
cd enterprise/sim/layout-studio
npm install
npm run dev
```

Open **http://127.0.0.1:3098** (API server proxies to Vite in dev).

Production (single process, no Vite):

```bash
npm run build
npm start
```

From sim root:

```bash
cd enterprise/sim
npm run layout-studio:dev   # requires layout-studio npm install first
npm run layout-studio       # serves dist/ on :3098
```

## Workflow

1. **Ingest sources** — place PDFs and photos in `layouts/sources/`. Register them in `layouts/sources/manifest.json` (type, path, `levelId`, notes).
2. **Align underlay** — select floor tab; adjust opacity, scale, offset X/Z sliders; **Save alignment** (writes manifest).
3. **Trace / edit rooms** — compare scan to envelope and room polygons:
   - Select room in sidebar; drag vertices on canvas
   - **Add room** → draw polygon (click vertices, double-click or Enter to finish)
   - Set **kind**: `interior` | `gap` | `placeholder` | `virtual`
   - New rooms default to label **Room (untitled)** — rename before marking interior
4. **Save floor** — writes `layouts/floors/<levelId>.level.json`
5. **Compile → Unity** — runs:
   - `scripts/merge-layout-floors.mjs`
   - `scripts/convert-layout-for-unity.mjs`
   - Output: `unity/ENTERPRISE.HouseHarness/Assets/StreamingAssets/house-layout.json`
6. **Unity** — open harness project, press Play (`HouseLayoutLoader` extrudes saved polygons)

## Floors

| Tab | File |
|-----|------|
| Main level | `floors/main.level.json` |
| Basement | `floors/basement.level.json` |
| Garage | `floors/garage.level.json` |
| Exterior | `floors/exterior.level.json` |

Coordinates: **meters**, XZ plane, **south = bottom** of canvas (front facade), Z increases north.

## API (port 3098)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/floors` | List all floor JSON |
| GET | `/api/floors/:levelId` | One floor |
| PUT | `/api/floors/:levelId` | Save floor (basic validation) |
| GET | `/api/sources` | Manifest + directory listing |
| PUT | `/api/sources/manifest.json` | Save manifest |
| GET | `/api/sources/pdf/:filename` | PDF for pdf.js |
| GET | `/api/sources/file/:filename` | Image underlay |
| POST | `/api/compile` | Merge + Unity convert |
| GET | `/api/pdf-preview.png?file=` | Optional server PNG (needs `pdftoppm`) |

## Manifest schema

```json
{
  "sources": [
    {
      "id": "scan-main-2026-05-24",
      "type": "pdf",
      "path": "Scanned_20260524-1944.pdf",
      "levelId": "main",
      "notes": "",
      "alignment": {
        "scale": 1,
        "offsetX": 0,
        "offsetZ": 0,
        "rotationDeg": 0,
        "opacity": 0.55
      }
    }
  ]
}
```

## Related

- Per-floor docs: [../layouts/floors/README.md](../layouts/floors/README.md)
- Schema: [../house-layout.schema.json](../house-layout.schema.json)
- Legacy read-only preview: [../poc/serve-preview.mjs](../poc/serve-preview.mjs) (deprecated for editing)
