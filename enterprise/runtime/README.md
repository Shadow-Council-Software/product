# ENTERPRISE runtime — Sprint 1

Monorepo for engine + LCARS web UI. Mock Matter adapter by default.

## Prerequisites

- Node.js ≥ 20.19
- npm 10+

## Install

```bash
cd enterprise/runtime
npm install
npm run build
```

## Development

Terminal 1 — engine (port 3001):

```bash
npm run dev:engine
```

Terminal 2 — LCARS (port 5173, proxies `/api` to engine):

```bash
npm run dev:lcars
```

Open http://localhost:5173

### Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `MATTER_ADAPTER` | `mock` | `mock` or `ohf` (stub) |
| `PORT` | `3001` | Engine listen port |
| `MOCK_FRESHNESS_MS` | `5000` | Mock attribute_updated interval |
| `VITE_ENGINE_URL` | `` (proxy) | Engine base URL for LCARS |

## Tests

```bash
npm test
```

Contract tests: W-CT-01, W-CT-02, W-CT-03 in `engine/test/`.

## OpenSpec

From `enterprise/`:

```bash
openspec validate --all --strict
```

## Docker (stub)

```bash
docker compose --profile dev up
```

Sidecar profile (rack only): `docker compose --profile sidecar up`

## Tracking

- GitHub epic: https://github.com/Shadow-Council-Software/product/issues/1
- Task map: [TRACKING.md](./TRACKING.md)
- Token audit: [TOKEN-AUDIT.md](./TOKEN-AUDIT.md)
