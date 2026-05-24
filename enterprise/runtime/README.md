# ENTERPRISE runtime

Monorepo for engine + LCARS web UI. Mock Matter adapter by default; live OHF sidecar for rack.

## Prerequisites

- Node.js ≥ 20.19
- npm 10+

## Install

```bash
cd enterprise/runtime
npm install
npm run build
```

## Development (mock)

Terminal 1 — engine (port 3001):

```bash
npm run dev:engine
```

Terminal 2 — LCARS (port 5173, proxies `/api` to engine):

```bash
npm run dev:lcars
```

Open http://localhost:5173

## Development (live OHF sidecar)

On Linux rack with Nest commissioned:

```bash
docker compose --profile sidecar up -d
MATTER_ADAPTER=ohf OHF_SIDECAR_URL=ws://127.0.0.1:5580/ws npm run dev:engine
npm run dev:lcars
```

Engine fails startup with explicit `UnableToComply` if sidecar is unreachable when `MATTER_ADAPTER=ohf`.

### Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `MATTER_ADAPTER` | `mock` | `mock` or `ohf` |
| `OHF_SIDECAR_URL` | `ws://127.0.0.1:5580/ws` | Sidecar WebSocket |
| `PORT` | `3001` | Engine listen port |
| `MOCK_FRESHNESS_MS` | `5000` | Mock attribute_updated interval |
| `FRESHNESS_STALE_MS` | `15000` | LCARS stale badge threshold |
| `ALLOW_TEST_HOOKS` | unset | Set `1` for conflict simulation in tests |
| `VITE_ENGINE_URL` | `` (proxy) | Engine base URL for LCARS |

## Tests

```bash
npm test
cd harness/art-01 && npm test
```

Contract tests: W-CT-01–05 in `engine/test/`.

## OpenSpec

Active change: `sprint-2-live-environmental-loop`

```bash
cd ../ && openspec validate --all --strict
```

## Docker

```bash
docker compose --profile dev up
docker compose --profile sidecar up   # OHF sidecar (rack)
```

## Tracking

- [TRACKING.md](./TRACKING.md)
- [TOKEN-AUDIT.md](./TOKEN-AUDIT.md)
