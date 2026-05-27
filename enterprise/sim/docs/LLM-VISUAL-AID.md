# LLM visual aid protocol

Agents use Sim Bridge visual aids to **see** the house state while helping you operate LCARS.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/sim/visual-aid/latest` | Latest capture metadata + spatial snapshot |
| GET | `/sim/visual-aid/history?limit=10` | Recent captures for session context |
| POST | `/sim/visual-aid` | Unity posts new capture (multipart or JSON + base64) |

## Capture payload (JSON)

```json
{
  "captureId": "uuid",
  "timestamp": 1710000000000,
  "camera": {
    "position": [2.1, 1.6, 4.0],
    "rotationEuler": [15, -90, 0],
    "fov": 60
  },
  "focus": {
    "stationId": "env.nest.primary",
    "roomId": "living-room"
  },
  "spatialStateHash": "sha256-prefix",
  "annotations": [
    {
      "screenPoint": [640, 360],
      "worldPoint": [2.1, 1.2, 4.0],
      "stationId": "env.nest.primary",
      "label": "Nest — 21.5°C",
      "freshness": "fresh"
    }
  ],
  "imageBase64": "... optional PNG ...",
  "lcarsCorrelation": {
    "alertPhase": "Normal",
    "conflictActive": false
  }
}
```

## Agent usage

1. Before suggesting LCARS actions, fetch `GET /sim/visual-aid/latest`.
2. Reference `focus.roomId` and `annotations` in operator-facing copy.
3. When user asks "what do you see?", cite capture timestamp and station readings.
4. Store `captureId` in GitHub issue token-audit blocks when applicable.

## Storage

Captures persist under `enterprise/sim/captures/` (gitignored). Configure retention via `SIM_CAPTURE_RETENTION` (default 50).

## Unity

`VisualAidCapture.cs` posts on interval (default 5s) and on station events.
