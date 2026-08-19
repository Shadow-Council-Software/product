# W0 Spike — Matter Sidecar Pre-Architecture Proof

Validates [ART-01 §6](../../docs/artifacts/art-01-coexistence-pack-v1.md) before `architecture.md` sign-off.

| Step | What | Automation |
|------|------|------------|
| **All W0** | Full orchestrator | `npm run run-w0:simulate` (agent/CI) or `npm run run-w0:live` (rack) |
| **W0-1** | Sidecar up, WS connect | `docker compose up -d` + verify, or mock in simulate mode |
| **W0-2** | Path A Google share + T1-01 | Manual live — [w0-checklist.md](./w0-checklist.md); auto in `--simulate --agent` |
| **W0-3** | Subscription within window | Included in `run-w0.mjs` |
| **W0-4** | `read_attribute` ±1°F | Included in `run-w0.mjs` |

## Quick start

**Agent / CI (no Docker or Nest required):**

```bash
cd enterprise/spike/w0
npm install
npm run run-w0:simulate
```

**Operator rack (live Nest):**

```bash
cd enterprise/spike/w0
npm run run-w0:live
# Complete Google share when prompted, or --skip-manual if already shared
```

See [operator-agent.md](./operator-agent.md) for agent execution instructions.

## Manual steps (legacy)

```bash
cd enterprise/spike/w0
mkdir -p data
docker compose up -d
npm install
npm run verify          # W0-1; after W0-2 also W0-4
npm run verify:watch    # W0-3 — change setpoint during wait
```

Copy [w0-results.template.yaml](./w0-results.template.yaml) → `w0-results.yaml`, complete [w0-checklist.md](./w0-checklist.md), promote to `docs/fixtures/w0-spike.certificate.yaml` on full PASS.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `MATTER_WS_URL` | `ws://127.0.0.1:5580/ws` | Sidecar WebSocket |
| `NODE_ID` | auto-detect | Force specific Nest node |

## Platform notes

- **Linux + `network_mode: host`:** Required for mDNS/Thread discovery ([python-matter-server docker.md](https://github.com/home-assistant-libs/python-matter-server/blob/main/docs/docker.md)).
- **Docker Desktop (Mac/Windows):** Host networking differs; use for W0-1 smoke only. Run full W0 on operator rack with Nest on LAN.
- **Self-managed Docker:** Not officially HA-supported for Thread — acceptable for rack-of-one with operator runbook.

## After W0

Resume architecture workflow Step 03 with W0 certificate as input. Research confidence on Nest commissioning upgrades from **Medium → High** when Path A passes on golden hardware.
