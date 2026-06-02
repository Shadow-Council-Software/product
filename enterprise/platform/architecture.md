---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
  - step-05-patterns
  - step-06-structure
  - step-07-validation
  - step-08-complete
inputDocuments:
  - enterprise/prd.md
  - enterprise/prd-validation-report.md
  - enterprise/ux-design-specification.md
  - enterprise/tng-interaction-contract.md
  - enterprise/lcars-screen-inventory.md
  - enterprise/matter-research-sources.md
  - enterprise/research/technical-matter-adapter-enterprise-mvp-research-2026-05-19.md
  - enterprise/docs/artifacts/art-01-coexistence-pack-v1.md
  - enterprise/docs/artifacts/art-02-conflict-taxonomy.md
  - enterprise/docs/artifacts/art-03-conflict-resolution-matrix.md
  - enterprise/docs/artifacts/art-04-hybrid-automation-bounds.md
  - enterprise/docs/artifacts/art-05-wan-down-soak-v0.md
  - enterprise/docs/artifacts/art-06-degraded-mode-matrix.md
  - enterprise/docs/artifacts/art-07-soak-reference-automation.md
  - enterprise/docs/artifacts/art-08-alert-condition-matrix.md
  - enterprise/docs/fixtures/w0-spike.certificate.yaml
  - enterprise/index.md
workflowType: architecture
project_name: ENTERPRISE Main Computer
user_name: Onimurasame
date: '2026-05-22'
lastStep: step-08-complete
status: complete
completedAt: '2026-05-22'
w0Spike:
  status: pass-simulate
  kit: enterprise/spike/w0/
  certificate: enterprise/docs/fixtures/w0-spike.certificate.yaml
  note: Live rack W0 required before production ship; simulate unblocks D-01
---

# Architecture Decision Document — ENTERPRISE Main Computer

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines **63 functional requirements** spanning orchestration, Matter integration, LCARS console, alert FSM, authority/conflict, rituals, and Growth-phase voice/combadge (deferred). MVP (P0 Hybrid Control Loop) concentrates on:

| Domain | Key FRs | Architectural implication |
|--------|---------|---------------------------|
| **Environmental control** | FR1–FR3, FR13 | Matter adapter + engine registry; setpoint command path with outcome grammar |
| **Authority & conflict** | FR7–FR12, FR16–FR17 | Engine-core policy before Verified; dual-writer detection (ART-02/03) |
| **Alert FSM** | FR44–FR52 | Engine-owned state machine; LCARS renders; Battle Stations non-skippable (NFR-UX6) |
| **Coexistence** | FR6, FR-H2 | Multi-fabric Matter; Google + ENTERPRISE parallel control |
| **Health & diagnostics** | FR28, FR32–FR36 | Staleness metadata; degraded-mode matrix (ART-06); WAN-down behavior |
| **Clearance & audit** | FR19–FR22, FR34–FR35 | RBAC middleware; append-only audit sink |
| **Station API** | FR-H3, optional bridge | REST snapshot + event stream envelope v1 |

No epics/stories file exists yet — architecture precedes story breakdown. Technical research (D-12) and UX spec (Steps 01–14 complete) supply implementation constraints.

**Non-Functional Requirements:**

**42 NFRs** drive hard architectural choices:

| Category | MVP-critical NFRs | Architecture driver |
|----------|-------------------|---------------------|
| **Performance** | NFR-P1 (≤3s p95 Matter), NFR-P2 (≤15s UI freshness), NFR-P3 (5s health strip) | Event push (WS/SSE), not poll; localhost sidecar IPC |
| **Reliability** | NFR-R1 (99.5% uptime), NFR-R2 (24h WAN-down G1), NFR-R3 (60s reconnect) | Sidecar circuit breaker; LAN-persistent subscriptions |
| **Security** | NFR-S1–S8 | TLS LAN; clearance in engine; no cloud LLM in core path |
| **Integration** | NFR-I1–I5, NFR-I3 (ART-01 100% CI) | Matter 1.4+ sidecar; coexistence harness |
| **UX** | NFR-UX1–UX6 | ≥1024px LCARS; alert ≤1s transition; Battle Stations contract tests |
| **Operations** | NFR-O1–O5 | Docker Compose rack-of-one; version skew rejection |

**Scale & Complexity:**

- **Primary domain:** Full-stack local-first — TypeScript engine + React LCARS web + Python/TS Matter sidecar
- **Complexity level:** **Medium** (PRD classification) — solo-builder MVP on rack-of-one; high north-star depth deferred
- **Estimated architectural components:** ~8 runtime units (engine, sidecar, lcars-web, SQLite, event bus, alert FSM module, MatterAdapterPort, ExperiencePackPort)

### Technical Constraints & Dependencies

| Constraint | Source | Impact |
|------------|--------|--------|
| **Integrate-not-fork (F-06)** | PRD | OHF Matter sidecar, not embedded connectedhomeip |
| **HA Lovelace non-goal (R-06)** | PRD | No HA-as-primary-app architecture |
| **Hybrid Mode honesty** | PRD + UX | Google parallel fabric; no sovereign marketing in MVP |
| **Nest 4th gen partial Matter** | Matter Survey (~55% Thermostat) | Capability profile in engine registry |
| **Google-first commissioning** | ART-01 + TR | Path A share primary; Path B fallback |
| **Phone viewport out of scope** | UX spec | Desktop/tablet ≥1024px only for MVP |
| **D-01 blocker** | Index | This document required before sprint 1 |
| **Mock adapter sprint 1** | TR Step 5 | LCARS W-CT-01–03 without live Nest |

**Pre-decided from technical research (Option A):** Hexagonal TypeScript engine + OHF Matter sidecar; `MatterAdapterPort`; `@matter-server/ws-client`; ADR-MA-01–05 draft ready for normative lock in Step 4.

### Cross-Cutting Concerns Identified

1. **Truth ownership** — Engine holds device/FSM truth; experience pack holds copy/tokens only
2. **Outcome grammar** — All operator commands resolve to TNG interaction contract types
3. **Alert FSM** — Single owner (engine); drives banner, layout mode, Battle Stations gate
4. **Freshness & staleness** — Subscription events → read model; fail-closed OFFLINE tiles
5. **Dual-writer conflict** — Google + ENTERPRISE actuation races before Verified outcomes
6. **Event envelope v1** — Backward-compatible stream for LCARS and future bridge-station
7. **Clearance RBAC** — Captain/Crew/Guest enforced before Matter writes
8. **Audit append-only** — Commands, denials, conflicts, alert transitions
9. **Degraded modes** — ART-06 fail-closed/read-only per subsystem
10. **CI contract tests** — W-CT-01–10, ART-01 harness (D-13), visual LCARS CI (F-07)

---

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack local-first:** TypeScript monorepo — Node orchestration engine + React LCARS SPA + external Matter sidecar (Docker).

No single off-the-shelf starter covers all three tiers. **Selected approach:** npm workspaces monorepo with two scaffolded apps and shared packages.

### Starter Options Considered

| Option | Fit | Verdict |
|--------|-----|---------|
| **T3 stack** | Full-stack Next.js + tRPC + Prisma | Reject — SSR/Postgres overkill; LCARS is LAN SPA |
| **create-vite react-ts** | LCARS web tier | **Adopt** for `lcars-web/` |
| **Fastify + tsx** | Engine REST/WS | **Adopt** — lightweight, schema validation, solo-builder friendly |
| **NestJS** | Engine | Defer — ceremony vs MVP scope |
| **HA add-on only** | Matter | Reject — R-06 Lovelace non-goal |

### Selected Foundation

**Monorepo root:** `enterprise/runtime/` (implementation tree; planning docs remain in `enterprise/`)

**Initialization commands (first implementation story):**

```bash
cd enterprise/runtime
npm init -y
# workspaces in package.json: engine, lcars-web, packages/*

npm create vite@latest lcars-web -- --template react-ts
cd engine && npm init -y && npm i fastify @fastify/websocket better-sqlite3 xstate @matter-server/ws-client ws
cd ../packages/matter-port && npm init -y
```

**Verified versions (May 2026):**

| Package | Version | Source |
|---------|---------|--------|
| Node.js | **24.x LTS** (24.16.0) | Active LTS Krypton |
| Vite | **8.0.x** | [vite.dev](https://vite.dev) — requires Node 20.19+ |
| create-vite | **9.0.x** | Scaffold CLI |
| @matter-server/ws-client | **0.7.x** | W0 spike validated |
| python-matter-server image | **stable** (pin digest post live W0) | ART-01 |

**Architectural decisions from starter:**

| Area | Choice |
|------|--------|
| Language | TypeScript 5+ strict, ESM |
| LCARS bundler | Vite 8 + `@vitejs/plugin-react` |
| Engine runtime | Node 24 LTS, `tsx` dev / compiled `dist` prod |
| Sidecar | External Docker — not in npm workspace |
| DB | SQLite file (`better-sqlite3`) — engine-owned |

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical (block sprint 1):**

- Hexagonal engine + OHF Matter sidecar (Option A)
- `MatterAdapterPort` interface (D-12)
- Alert FSM in engine core (ADR-MA-05)
- LCARS → engine only (ADR-MA-04)
- Mock adapter sprint 1; live Nest sprint 2

**Important:**

- REST + WebSocket event stream to LCARS
- SQLite station registry + audit log
- Clearance RBAC middleware
- Google-fabric-share commissioning (ART-01 Path A)

**Deferred post-MVP:**

- matterjs-server migration eval
- HA headless spike (Option B)
- OAuth / Headscale remote access
- bridge-station adapter

### Architecture Decision Records

| ID | Decision |
|----|----------|
| **ADR-MA-01** | Matter plane isolated in OHF-certified sidecar process |
| **ADR-MA-02** | Engine depends on `MatterAdapterPort`; adapters swappable |
| **ADR-MA-03** | Sidecar protocol = python-matter-server WS semantics (matterjs-server compatible) |
| **ADR-MA-04** | LCARS never connects to sidecar directly |
| **ADR-MA-05** | Alert FSM ownership in engine core; maps to ART-08 + NFR-UX4–UX6 |

### Data Architecture

| Store | Owner | Contents |
|-------|-------|----------|
| Sidecar `chip.json` | Matter sidecar | Fabric credentials, node membership — **Matter source of truth** |
| Engine SQLite | Orchestration engine | Station registry, capability profiles, alert FSM snapshot, conflict records, append-only audit |
| Experience pack manifest | Pack config | TNG tokens/copy — **no device truth** |
| In-memory read model | Engine | Last-known attributes + `freshnessTs` for HealthStrip |

**Nest capability profile:** Seed from [Matter Survey — Nest 4th gen](https://www.matter-survey.org/device/nest-learning-thermostat-4th-gen-24582-13); block UI from unsupported Matter features.

**CQRS-lite:** Commands via REST POST; queries from read model fed by sidecar subscription events — not live Matter read per tile request.

### Authentication & Security

| Layer | MVP rule |
|-------|----------|
| App RBAC | Captain / Crew / Guest clearance in engine middleware (FR19–22, W-CT-01) |
| Matter fabric | CASE + ACL in sidecar only |
| Sidecar WS | `127.0.0.1` bind — not WAN-exposed |
| LCARS | HTTPS on LAN; MVP single-operator session |
| Audit | Append-only command/denial/conflict/alert log (NFR-S5) |
| Break-glass | Growth — stub interface only in MVP |

### API & Communication Patterns

**External (LCARS → engine):**

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/stations` | Station snapshot (HealthStrip, tiles) |
| `GET /api/v1/stations/:id` | Environmental drill-down |
| `POST /api/v1/commands/*` | Outcome-typed commands |
| `GET /api/v1/alerts` | Alert FSM snapshot |
| `WS /api/v1/events/stream` | Domain events (FR-H3 envelope v1) |

**Internal (engine → sidecar):** WebSocket JSON RPC via `@matter-server/ws-client`.

**Domain events (engine bus):** `StationUpdated`, `SetpointCommanded`, `ConflictDetected`, `AlertPhaseChanged` — same bus feeds FSM and LCARS stream.

### Frontend Architecture

| Concern | Decision |
|---------|----------|
| State | TanStack Query for REST snapshot; native WebSocket for events |
| Alert FSM UI | XState v5 machine **mirrors** engine snapshot — engine is authority |
| Components | UX spec sprint order; W-CT-01–03 sprint 1 |
| Routing | React Router — default `ops.overview` |
| A11y | Radix/React Aria headless, LCARS-styled (NFR-UX2) |
| Viewport | ≥1024px only MVP |

### Infrastructure & Deployment

**MVP unit:** Docker Compose on operator Linux rack.

```yaml
services:
  matter-server:
    image: ghcr.io/home-assistant-libs/python-matter-server:stable
    network_mode: host
    volumes: [matter-data:/data]
  enterprise-engine:
    build: ./engine
    environment:
      MATTER_WS_URL: ws://127.0.0.1:5580/ws
      DATABASE_PATH: /data/enterprise.db
  lcars-web:
    build: ./lcars-web
    depends_on: [enterprise-engine]
```

**CI:** Mock `MatterAdapterPort`; Playwright 1280×720 + 1024×768 (F-07); contract tests W-CT-01–03 sprint 1.

---

## MatterAdapterPort (Normative — D-12)

```typescript
/** Attribute path: endpoint_id/cluster_id/attribute_id e.g. "1/513/0" */
export type AttributePath = string;

export interface CommandReceipt {
  receiptId: string;
  pending: boolean;
  outcomeType?: 'Acknowledged' | 'Pending' | 'Verified' | 'Denied' | 'UnableToComply' | 'Warning';
}

export interface StationSnapshot {
  stationId: string;       // e.g. env.nest.primary
  nodeId: number;
  available: boolean;
  attributes: Record<AttributePath, unknown>;
  freshnessTs: number;
  authority: 'enterprise' | 'google' | 'shared' | 'unknown';
}

export type MatterNodeEvent =
  | { type: 'attribute_updated'; nodeId: number; path: AttributePath; value: unknown }
  | { type: 'node_added'; nodeId: number }
  | { type: 'node_removed'; nodeId: number }
  | { type: 'sidecar_disconnected'; reason: string }
  | { type: 'sidecar_reconnected' };

export interface CommissioningPayload {
  pairingCode?: string;
  manualCode?: string;
}

export interface MatterAdapterPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getStations(): Promise<StationSnapshot[]>;
  readAttribute(stationId: string, path: AttributePath): Promise<unknown>;
  writeAttribute(stationId: string, path: AttributePath, value: unknown): Promise<CommandReceipt>;
  subscribe(handler: (event: MatterNodeEvent) => void): () => void;
  openCommissioningWindow(nodeId: number): Promise<CommissioningPayload>;
}
```

**Adapters:**

| Adapter | Sprint | Role |
|---------|--------|------|
| `MockMatterAdapter` | 1 | W-CT-01–03; synthetic Nest events |
| `OhfSidecarAdapter` | 2+ | `@matter-server/ws-client` → sidecar |

**Sidecar reconnect:** Exponential backoff; engine marks stations PENDING; resubscribe on recovery (NFR-R3).

---

## Renderer Ports (Normative — C-SIM-06)

Sim and in-wall LCARS panel rollout depends on five renderer ports defined in [sim-ux-specification.md](./sim-ux-specification.md). These extend the L5 renderer contract; they do **not** duplicate experience-pack tokens or alert FSM ownership (engine remains FSM authority per ADR-MA-05).

| Port | Contract | Owner |
|------|----------|-------|
| **`RendererTransportPort`** | Push finalized frame buffers or stream deltas to dumb 2D clients; heartbeat + reconnect semantics | Engine orchestration + panel firmware |
| **`RendererCapabilitiesDescriptorPort`** | Per-engine manifest: max resolution, color space, touch, audio — published as `renderer-capabilities-descriptor.yaml` | Renderer harness / firmware (Sprint 1: Unity) |
| **`DistanceAwareCompositePort`** | Scale L3 composites for `viewingDistanceM` (default **3.0** m); no engine-shader TNG hardcoding | Experience pack + renderer adapter |
| **`PanelAttestationPort`** | Bind `panelId`, `screenId`, `clearanceProfile`, `hostedVerbs`, `nfrUx6Reachable` before attestation | Engine middleware |
| **`EngineParityCertificatePort`** | Chain `engine-parity.certificate.yaml` → parent [visual-foundation-freeze.certificate.yaml](./docs/fixtures/visual-foundation-freeze.certificate.yaml); CI gate on okudaAudit | CI / release |

**L1 token portability:** Shared renderer token artifacts MAY live under the experience pack as `packages/renderer-tokens/` (La Forge council naming) — same L1 schema as web LCARS; sim/panel renderers consume manifest bindings, not duplicated palette constants.

**Sprint 1 deliverables:** `enterprise/sim/unity/engine-parity.certificate.yaml`, `enterprise/sim/unity/renderer-capabilities-descriptor.yaml`, Unity HealthStrip proof against live `GET /api/v1/alerts` (SIM-AC-01–02).

---

## Implementation Patterns & Consistency Rules

### Naming

| Layer | Convention | Example |
|-------|------------|---------|
| Station IDs | `{dept}.{vendor}.{role}` | `env.nest.primary` |
| Screen IDs | `{area}.{name}` | `ops.overview` |
| REST paths | kebab-case, `/api/v1/` prefix | `/api/v1/events/stream` |
| TS files | kebab-case | `matter-adapter-port.ts` |
| SQLite tables | snake_case | `audit_log` |
| Domain events | PascalCase past tense | `AlertPhaseChanged` |

### API Response Shape

All operator-facing command responses use **TNG outcome grammar** ([tng-interaction-contract.md](./tng-interaction-contract.md)):

```json
{
  "outcomeType": "Verified",
  "message": "Setpoint acknowledged.",
  "cause": null,
  "remediation": null,
  "receiptId": "uuid",
  "freshnessTs": 1716380000000
}
```

Errors: HTTP 4xx/5xx **with outcome body** — never bare status codes to LCARS.

### Event Envelope v1 (FR-H3)

```json
{
  "schemaVersion": 1,
  "eventId": "uuid",
  "type": "StationUpdated",
  "timestamp": 1716380000000,
  "payload": { }
}
```

### Agent Implementation Rules

1. **Engine owns truth** — LCARS never caches authoritative FSM state without `freshnessTs`.
2. **No sidecar imports in lcars-web** — only engine HTTP/WS client.
3. **Battle Stations gate** — engine enforces; not configurable via pack (NFR-UX6).
4. **Conflict before Verified** — dual-writer check per ART-02/03 before `outcomeType: Verified`.
5. **Fail closed** — sidecar disconnect → PENDING/OFFLINE tiles; no silent stale-as-Green.
6. **One writer for actuation** — policy gate before any `writeAttribute`.

---

## Project Structure & Boundaries

```
enterprise/
  architecture.md          # this document
  prd.md, ux-design-specification.md, …
  docs/artifacts/          # ART-01–08
  docs/fixtures/           # freeze + W0 certificates
  spike/w0/                # W0 spike kit (pre-impl)
  runtime/                 # ← implementation monorepo (create sprint 1)
    package.json           # npm workspaces
    docker-compose.yml
    engine/
      src/
        domain/            # alert-fsm, conflict, policy, outcomes
        ports/             # matter-adapter-port.ts, experience-pack-port.ts
        adapters/
          mock-matter-adapter.ts
          ohf-sidecar-adapter.ts
        api/               # fastify routes + ws stream
        persistence/       # sqlite registry, audit
        index.ts
      test/
    lcars-web/
      src/
        components/        # AlertBanner, BattleStationsConfirm, …
        screens/           # ops.overview, env.subsystem, …
        hooks/             # use-station-stream, use-clearance
        tokens/            # Okuda CSS variables
    packages/
      matter-port/         # shared types + MatterAdapterPort
      event-envelope/      # FR-H3 schema
      tng-outcomes/        # outcome type guards
```

### FR → Component Mapping

| FR domain | Runtime location |
|-----------|------------------|
| Environmental FR1–3, FR13 | `engine/adapters/*` + `lcars-web/screens/env.*` |
| Authority/conflict FR7–12 | `engine/domain/conflict/` |
| Alert FSM FR44–52 | `engine/domain/alert-fsm/` + `lcars-web/components/Alert*` |
| Clearance FR19–22 | `engine/api/middleware/clearance.ts` |
| Audit FR34–35 | `engine/persistence/audit.ts` |
| Night Watch Lite FR26–27 | `engine/domain/night-watch/` |
| Station API FR-H3 | `engine/api/` + `packages/event-envelope/` |

### Integration Boundaries

```
┌─────────────┐   REST/WS    ┌──────────────────┐   MatterAdapterPort   ┌──────────────┐
│  lcars-web  │ ───────────► │ enterprise-engine │ ◄──── WS localhost ───► │ matter-sidecar│
│  (browser)  │              │  (Node monolith)  │                       │  (Docker)     │
└─────────────┘              └──────────────────┘                       └──────────────┘
                                      │
                                      ▼
                               SQLite (registry,
                               audit, FSM state)
```

---

## Architecture Validation

### Coherence

| Check | Status |
|-------|--------|
| UX spec ADR-CS-* ↔ engine FSM ownership | Pass — engine authority, LCARS renders |
| TR Option A ↔ ADR-MA-01–05 | Pass — locked |
| ART-01 Path A ↔ commissioning flow | Pass — `openCommissioningWindow` on port |
| W0 spike ↔ OhfSidecarAdapter wire format | Pass — `@matter-server/ws-client` 0.7.x |
| NFR-UX6 ↔ engine middleware | Pass — not pack-configurable |

### Requirements Coverage (MVP gates)

| Gate | Architectural support |
|------|-------------------------|
| **G1** WAN-down | Engine + sidecar + LCARS shell local; ART-05 protocol |
| **G2** Coexistence | ART-01 harness → `OhfSidecarAdapter` + D-13 CI |
| **G3** Freshness ≤15s | Event push; subscription-driven read model |
| **G4** Degraded modes | ART-06 matrix in engine policy layer |
| **G5** Fabric restore | Sidecar `/data` volume backup runbook |

### Open Items (non-blocking D-01)

| Item | Owner | When |
|------|-------|------|
| Nest exact attribute map refinement | Sprint 2 live W0 | After rack commission |
| Conflict detection algorithm detail | Sprint 2 | ART-02/03 implementation |
| Sidecar image digest pin | Live W0 | Pre-sprint 2 |
| Live W0 on golden hardware | Operator | Before production ship |

---

## Implementation Handoff

**D-01 status:** Complete — normative architecture for sprint 1.

**Recommended next steps:**

1. **`/opsx:apply sprint-1-runtime-foundation`** — implement tasks in [`openspec/changes/sprint-1-runtime-foundation/`](openspec/changes/sprint-1-runtime-foundation/)
2. **Live W0 on rack** — confirm Path A on real Nest before sprint 2 merge
3. **ART-01 CI harness (D-13)** — post-sprint-1

**Normative specs:** [`openspec/specs/`](openspec/specs/) · **Gates:** [`openspec/gates.yaml`](openspec/gates.yaml)

**Sprint 1 exit criteria:** Engine boots with `MockMatterAdapter`; LCARS renders `BattleStationsConfirm` + `ClearanceOverlay`; W-CT-01–03 green.

