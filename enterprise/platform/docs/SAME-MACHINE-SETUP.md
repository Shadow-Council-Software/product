# Same-machine ENTERPRISE setup (operator PC = runtime host)

**Goal:** Run engine + LCARS + (optional) Matter sidecar on the **same Windows PC** that is on your home Wi‑Fi as Nest devices.

**Read this first:** MVP ENTERPRISE controls **one Matter thermostat** (HVAC Environmental loop). Your **Nest Doorbell** and **Nest Camera** are in the house program for layout/sim, but **not** in the live runtime UI or adapter yet.

| Device | PRD tier | ENTERPRISE today |
|--------|----------|------------------|
| Nest Learning Thermostat 4th gen | B (MVP P0) | **Supported** — `OhfSidecarAdapter`, Environmental LCARS |
| Nest Doorbell (3rd gen) | Layout / future Tactical | **Not in runtime** — may appear in Matter fabric; no LCARS panel |
| Nest Camera | C (cloud-heavy) | **Deferred (Growth)** — video plane / Frigate, not Matter MVP |

You can still use this guide to **run ENTERPRISE locally** and **discover** what Matter sees on your LAN.

---

## Phase 0 — Prerequisites (this PC)

| Tool | Required | Notes |
|------|----------|-------|
| Node.js | ≥ 20.19 | `node -v` |
| npm | 10+ | `npm -v` |
| Docker Desktop | For live Matter | WSL2 backend recommended |
| Same Wi‑Fi as Nest | Yes | Phone with Google Home app |

**Windows caveat:** `enterprise/spike/w0/docker-compose.yml` uses `network_mode: host` (Linux-oriented). On this PC use **`enterprise/runtime/docker-compose.yml`** sidecar with port `5580:5580` instead.

---

## Device roster MVP (2026-06-01)

LCARS now shows a **Device roster** panel listing every Matter node the adapter sees (thermostat, doorbell, camera when on fabric).

| Mode | Command | What you see |
|------|---------|----------------|
| Mock household | `enterprise/scripts/dev-local-mock.ps1` | 3 labeled mock devices |
| Live | `enterprise/scripts/dev-local-live.ps1` | Real nodes from sidecar after commissioning |

API: `GET /api/v1/system/status` and `GET /api/v1/stations`.

---

## Phase 1 — Mock ENTERPRISE (no Nest, 5 minutes)

Proves engine + LCARS on this machine.

```powershell
cd enterprise/runtime
npm install
npm run build
npm run dev:engine
```

New terminal:

```powershell
cd enterprise/runtime
npm run dev:lcars
```

Open http://localhost:5173 — mock thermostat station `env.nest.primary`.

**Automated UX check (no manual eyeballing):**

```powershell
cd enterprise/scripts
.\ux-verify.ps1
```

Uses Playwright at 1280×720; see `enterprise/runtime/e2e/README.md` and skill **`enterprise-ux-tester`**.

---

## Phase 2 — Sim bridge (doorbell + cam in layout, no Google)

Uses your house JSON including `sec.nest.doorbell.main` — **spatial sim only**, not live Google devices.

```powershell
cd enterprise/runtime
docker compose --profile sim up --build
```

Or local: `MATTER_ADAPTER=sim` per `runtime/README.md`.

---

## Phase 3 — Live Matter sidecar (discovery)

### 3a. Start sidecar (Windows-friendly ports)

```powershell
cd enterprise/runtime
docker compose --profile sidecar up -d
```

WebSocket: `ws://127.0.0.1:5580/ws`

### 3b. Commissioning (Google Home)

ENTERPRISE joins devices as **secondary Matter admin** (coexistence). Normative steps: [ART-01](./artifacts/art-01-coexistence-pack-v1.md) §2–§3.

1. Devices must already work in **Google Home**.  
2. Use Matter Server UI / HA-style commissioning flow exposed by python-matter-server (browser on `http://127.0.0.1:5580` when enabled) or CLI per upstream docs.  
3. **Thermostat:** required for MVP LCARS setpoint path.  
4. **Doorbell:** if Matter-capable on your model, it may list as a node — expect **no ENTERPRISE control UI** yet.  
5. **Camera:** likely **not** controllable via this Matter path; PRD treats Nest cams as Tier C (cloud).

### 3c. Run engine against sidecar

```powershell
cd enterprise/runtime
$env:MATTER_ADAPTER="ohf"
$env:OHF_SIDECAR_URL="ws://127.0.0.1:5580/ws"
npm run dev:engine
```

```powershell
cd enterprise/runtime
npm run dev:lcars
```

Engine **fails fast** if sidecar is down (`MATTER_ADAPTER=ohf`).

### 3d. Verify

```powershell
curl http://localhost:3001/api/v1/stations
```

Expect at least one station if a thermostat node was picked. Adapter currently selects the first Nest/thermostat-like node ([`ohf-sidecar-adapter.ts`](../runtime/engine/src/adapters/ohf-sidecar-adapter.ts)).

---

## Phase 4 — W0 spike (optional, after sidecar works)

From repo root:

```powershell
cd enterprise/spike/w0
npm install
npm run run-w0:live
```

On Windows, prefer runtime sidecar (Phase 3) over W0 compose host networking. Record results in `w0-results.yaml`.

---

## What “connect doorbell + camera” means next

| Ask | Realistic now | Product work |
|-----|---------------|--------------|
| See them in Google Home | Already true | — |
| See doorbell on house sim map | `sim` profile | Done in layout |
| Matter-commission doorbell to sidecar | **Try Phase 3** | Document node id |
| Ring/Live view in LCARS | **No** | Growth video (FR-G4) |
| Doorbell events in alert FSM | **No** | New OpenSpec: `tactical-doorbell` |
| Camera clips / RTSP | **No** | Frigate / Tier C track |

**Recommended product sequence:** thermostat live loop (MVP) → doorbell Matter events (Tactical) → camera LAN/RTSP (Growth).

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Sidecar won’t discover devices | Same LAN; Windows firewall; try WSL2 Docker |
| Engine starts but no stations | Nothing commissioned; wrong node picked |
| Setpoint fails | Guest clearance; need Captain in LCARS |
| Only mock data | `MATTER_ADAPTER` still `mock` |

---

## Links

- Rack-day (when treating this PC as “the rack”): [RACK-DAY-BUNDLE.md](./RACK-DAY-BUNDLE.md)  
- FR traceability: [../openspec/FR-COVERAGE.md](../openspec/FR-COVERAGE.md)  
- Runtime dev: [../runtime/README.md](../runtime/README.md)
