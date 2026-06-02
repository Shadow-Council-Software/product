# ENTERPRISE Platform workspace — agent charter

**Workspace root:** `enterprise/platform/`  
**Lead:** **Captain Jean-Luc Picard** (engineering crew chair)  
**Mission:** Orchestration engine, Matter adapter, OpenSpec requirements, digital twin, W0 spike, gate artifacts.

---

## Engineering crew

| Agent | Role | Spec |
|-------|------|------|
| **Captain Picard** | Chair, synthesis, command ethics | [docs/agents/captain-picard.md](./docs/agents/captain-picard.md) |
| **Geordi La Forge** | Engineering truth, feasibility | [docs/agents/lt-commander-la-forge.md](./docs/agents/lt-commander-la-forge.md) |
| **Lt. Commander Data** | Schema, automation, holodeck | [docs/agents/lt-commander-data.md](./docs/agents/lt-commander-data.md) |
| **Lieutenant Worf** | Security, clearance, audit | [docs/agents/lieutenant-worf.md](./docs/agents/lieutenant-worf.md) |

Roster: [docs/agents/engineering-roster.yaml](./docs/agents/engineering-roster.yaml)  
**Senior staff:** [docs/agents/process-senior-staff-meeting.md](./docs/agents/process-senior-staff-meeting.md)

**Do not** own LCARS pixels — escalate visual changes to `enterprise/ux/` council.

---

## Normative docs

| Doc | Purpose |
|-----|---------|
| [prd.md](./prd.md) | FR/NFR, gates G1–G5 |
| [architecture.md](./architecture.md) | Technical design D-01 |
| [openspec/](./openspec/) | Deterministic specs |
| [docs/artifacts/](./docs/artifacts/) | ART-01–ART-08 |
| [sim/](./sim/) | Digital twin + Unity harness |

---

## Code ownership

| Path | Package |
|------|---------|
| `runtime/engine/` | `@enterprise/engine` — Fastify, FSM, Station API |
| `runtime/packages/` | matter-port, event-envelope, tng-outcomes |
| `sim/` | Sim Bridge, Unity, layouts |
| `spike/w0/` | Rack W0 sidecar spike |

---

## Commands

```powershell
cd enterprise/platform/runtime
npm install
$env:MATTER_ADAPTER='mock'; $env:ALERT_STORE='memory'
npm run dev:engine           # :3001
npm test
npm run validate:openspec
```

```powershell
cd enterprise/platform/scripts
.\dev-local-mock.ps1         # engine + notes for LCARS
```

---

## UX boundary

LCARS runs in **`enterprise/ux/runtime/lcars-web`**. Platform supplies **API + event stream only**. Contract tests: `openspec/specs/station-api`, `lcars-*` specs — implement in engine; render in UX workspace.
