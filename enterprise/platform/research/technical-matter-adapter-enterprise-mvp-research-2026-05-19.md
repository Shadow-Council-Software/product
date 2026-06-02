---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - enterprise/prd.md
  - enterprise/matter-research-sources.md
  - enterprise/ux-design-specification.md
  - enterprise/docs/artifacts/art-01-coexistence-pack-v1.md
  - enterprise/docs/artifacts/art-04-hybrid-automation-bounds.md
  - enterprise/docs/agents/process-party-mode.md
lastStep: 6
workflowStatus: complete
workflowType: research
research_type: technical
research_topic: Matter adapter architecture for ENTERPRISE Main Computer MVP
research_goals: >-
  Evaluate integration approaches (Home Assistant integrate-not-fork vs custom Matter
  commissioner vs hybrid) for Nest Learning Thermostat (4th gen) control with Google
  coexistence; produce evidence-backed recommendations to inform architecture.md (D-01)
  and Matter adapter interface lock (D-12) before implementation sprint 1.
user_name: Onimurasame
date: 2026-05-19
web_research_enabled: true
source_verification: true
---

# Matter Adapter Architecture for ENTERPRISE MVP — Technical Research

**Date:** 2026-05-19  
**Author:** Onimurasame  
**Research Type:** technical  
**Status:** Complete (Steps 1–6)

---

## Research Overview

This research evaluates Matter integration architecture for ENTERPRISE Main Computer MVP — specifically how to control the Nest Learning Thermostat (4th gen) under Google coexistence while honoring **integrate-not-fork** constraints (F-06), local-first operation, and the completed UX specification (alert FSM, W-CT security contracts, Environmental station).

Six workflow steps analyzed technology stack, integration patterns, architectural patterns, and implementation adoption using web-verified sources (OHF Matter Server, Home Assistant CSA certification, Matter Survey device data, field reports on Nest commissioning). **Primary recommendation:** hexagonal TypeScript orchestration engine + CSA-certified OHF Matter sidecar, with `MatterAdapterPort` abstraction and Google-fabric-share commissioning as the critical path for ART-01.

Full executive summary, table of contents, and strategic conclusions appear in **Research Synthesis** below. Detailed step analyses precede it in this document.

---

## Technical Research Scope Confirmation

**Research Topic:** Matter adapter architecture for ENTERPRISE Main Computer MVP

**Research Goals:** Evaluate integration approaches (Home Assistant integrate-not-fork vs custom Matter commissioner vs hybrid) for Nest Learning Thermostat (4th gen) control with Google coexistence; produce evidence-backed recommendations to inform `architecture.md` (D-01) and Matter adapter interface lock (D-12) before implementation sprint 1.

**Technical Research Scope:**

- Architecture Analysis — design patterns, frameworks, system architecture
- Implementation Approaches — development methodologies, coding patterns
- Technology Stack — languages, frameworks, tools, platforms
- Integration Patterns — APIs, protocols, interoperability
- Performance Considerations — scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-05-19

---

<!-- Content will be appended sequentially through research workflow steps -->

## Technology Stack Analysis

*Step 2 — web-verified 2026-05-19. Tailored to ENTERPRISE Matter adapter (D-12) and PRD Architecture Preview layers.*

### Programming Languages

**Dominant languages in the Matter controller ecosystem:**

| Language | Role in Matter stack | ENTERPRISE relevance |
|----------|----------------------|----------------------|
| **Python 3.12+** | Open Home Foundation **python-matter-server** — CSA-certified controller server wrapping official connectedhomeip SDK bindings; WebSocket API for clients | **High** for integrate-not-fork path: run certified server as sidecar; engine client in Python or any WS-capable language |
| **TypeScript / JavaScript (Node ≥20.19)** | **matter.js** full Matter implementation; **matterjs-server** (2025+) as python-matter-server successor; aligns with web LCARS console stack | **High** for unified TypeScript engine + adapter if building custom sidecar; active migration target per OHF |
| **C++** | **connectedhomeip** reference SDK; **chip-tool** CLI commissioner for lab/commissioning diagnostics | **Medium** — diagnostics, CI interop probes, not primary app language for ENTERPRISE MVP |

_Popular Languages:_ Python and TypeScript dominate **production Matter controller servers** in open source (Home Assistant ecosystem). C++ remains the reference SDK language.

_Emerging Languages:_ TypeScript via **matter.js** is gaining share as **matterjs-server** replaces python-matter-server for new features ([python-matter-server README](https://github.com/matter-js/python-matter-server) states maintenance mode; new development on matter.js).

_Language Evolution:_ 2025–2026 inflection — certified **Python server** (stable) → **TypeScript matterjs-server** (alpha/beta rollout in HA add-on v8.2+). Custom greenfield commissioners should assume **TS migration path**, not Python-only long-term.

_Performance Characteristics:_ Python/C++ bound server handles subscription I/O and fabric crypto; latency-sensitive UX (≤15s freshness G3) depends on **subscription model + LAN**, not language choice alone. **Confidence: High** for stack roles; **Medium** for ENTERPRISE-specific p95 until lab measurement.

_Sources:_
- [python-matter-server (GitHub)](https://github.com/matter-js/python-matter-server)
- [matter.js (GitHub)](https://github.com/matter-js/matter.js/)
- [connectedhomeip chip-tool guide](https://github.com/project-chip/connectedhomeip/blob/master/docs/development_controllers/chip-tool/chip_tool_guide.md)
- [Python CHIP Controller docs](https://project-chip.github.io/connectedhomeip-doc/development_controllers/matter-repl/python_chip_controller_building.html)

### Development Frameworks and Libraries

**Major frameworks (Matter controller plane):**

| Component | Description | MVP fit |
|-----------|-------------|---------|
| **Open Home Foundation Matter Server** (python-matter-server) | CSA-certified standalone controller; WebSocket protocol; used by HA as add-on — **cannot be embedded in HA Core** per certification isolation | **Option A (integrate-not-fork):** Run as **sidecar process**; ENTERPRISE engine speaks WS client protocol |
| **matterjs-server** | TypeScript Matter server on matter.js; positioned as drop-in replacement; Matter **1.4.2** support; legacy `chip.json` import | **Option B (forward-looking):** Same sidecar pattern; better alignment if engine is Node/TS |
| **Home Assistant Matter integration** | Certified UI component; `MatterClient` from matter_server / matter-python-client; device discovery, commissioning services, multi-fabric | **Option C (integrate-not-fork HA):** HA as device plane; ENTERPRISE consumes HA REST/WS — conflicts with F-06 if HA becomes primary UI (PRD non-goal) but valid as **headless engine substrate** |
| **matter.js `@matter/main`** | Library for custom commissioners/controllers in TS | **Option D (custom):** Full ownership; highest build cost; needed only if sidecar protocols insufficient |

_Major Frameworks:_ **Sidecar Matter Server + thin engine client** is the dominant certified open-source pattern (HA model), not embedding SDK in application core.

_Micro-frameworks:_ **chip-tool** (commissioning/debug), **matter-repl** (Python interactive commissioner), community **HACS Nest helpers** (e.g. [hacs-nest-matters](https://github.com/adamj29/hacs-nest-matters)) — useful for discovery, not normative for ENTERPRISE engine.

_Evolution Trends:_ HA **Feb 2026** migration toward **matter-python-client** library ([PR #163704](https://github.com/home-assistant/core/pull/163704)); parallel **matterjs-server** alpha/beta track. Adapter interface (D-12) should **abstract server transport**, not hard-code python-matter-server wire format.

_Ecosystem Maturity:_ Highest maturity = **python-matter-server + HA** (CSA certified March 2025). matterjs-server **lower maturity** (149 GitHub stars vs 1k+ python-matter-server) but explicit OHF successor. **Confidence: High** on certification facts; **Medium** on matterjs-server production readiness for solo-builder MVP timeline.

_Sources:_
- [Home Assistant Matter certification blog (2025-03-10)](https://www.home-assistant.io/blog/2025/03/10/matter-certification/)
- [Home Assistant Matter integration](https://www.home-assistant.io/integrations/matter/)
- [matterjs-server (GitHub)](https://github.com/matter-js/matterjs-server)

### Database and Storage Technologies

Matter controller servers persist **fabric credentials, node tables, and subscription state** locally — not cloud databases.

| Storage | Used by | ENTERPRISE implication |
|---------|---------|------------------------|
| **JSON / chip.json** | python-matter-server, matterjs-server (legacy import) | Sidecar owns fabric secrets; engine must **not duplicate** credential store |
| **SQLite** | Typical for orchestration engines, HA recorder (optional) | **Engine layer:** device registry, audit log, alert FSM snapshots, conflict/authority state (PRD Architecture Preview) |
| **In-memory + event stream** | Real-time LCARS freshness | WebSocket/SSE `/api/v1/events/stream` (PRD preview) fed from engine, not direct Matter SDK |

_Relational Databases:_ SQLite (or Postgres at Growth) for **engine state** — orthogonal to Matter fabric storage.

_NoSQL / In-Memory:_ Subscription caches and last-known attribute values fit **key-value / in-memory** with periodic persistence; matches ≤15s freshness NFR without querying Matter on every UI poll.

_Data Warehousing:_ Not MVP-relevant.

**Nest thermostat note:** Device exposes **Thermostat**, **Temperature Measurement**, **Relative Humidity** clusters; Matter Survey reports **~55% Thermostat feature completion** — schedules/presets/fan not exposed via Matter ([Matter Survey — Nest 4th gen](https://www.matter-survey.org/device/nest-learning-thermostat-4th-gen-24582-13)). Engine schema should model **Matter capability profile**, not Google app feature parity.

_Sources:_
- [Nest Learning Thermostat 4th gen — Matter Survey](https://www.matter-survey.org/device/nest-learning-thermostat-4th-gen-24582-13)
- [Nest 4th gen — CSA product listing](https://csa-iot.org/csa_product/nest-learning-thermostat-4th-gen/)

### Development Tools and Platforms

| Category | Tools | Use for ENTERPRISE |
|----------|-------|-------------------|
| **Commissioning / debug** | chip-tool, matter-repl, HA Matter UI (setup only) | T1/T2 coexistence commissioning; ART-01 CI scenarios |
| **SDK / build** | connectedhomeip build scripts, `@matter/main` npm init | Custom path only; heavy toolchain |
| **CI / testing** | Playwright (LCARS F-07), contract tests W-CT-* | Adapter mocked at engine boundary for sprint 1 |
| **Border router** | Thread via Nest Hub / OTBR (PRD operator notes) | Infrastructure prerequisite for Nest Tier B — not application code |
| **Version control** | Git monorepo — engine, experience pack, LCARS web | Matches PRD platform_orchestration layout |

_IDE and Editors:_ TypeScript + Python dual stack if sidecar is Python and LCARS is TS — operational overhead for solo builder.

_Testing Frameworks:_ Matter CSA certification used **automated test scripts** (Resillion collaboration per HA blog) — reuse pattern for ART-01 harness (D-13 deferred post-sprint-1).

_Sources:_
- [Home Assistant Matter certification — test automation](https://www.home-assistant.io/blog/2025/03/10/matter-certification/#the-road-to-certification)
- ENTERPRISE [matter-research-sources.md](../matter-research-sources.md)

### Cloud Infrastructure and Deployment

**MVP posture: local rack of one — no cloud in core data path (PRD).**

| Deployment pattern | Description | MVP |
|--------------------|-------------|-----|
| **Sidecar container** | Matter Server add-on / Docker on same host as engine | **Recommended** — mirrors HA certified architecture |
| **Co-located processes** | Engine + matter-server on LAN host; LCARS web client | Default ENTERPRISE topology |
| **Kubernetes / multi-node** | PRD defers full OPA/K8s | Growth — not MVP |
| **Serverless / cloud Matter** | Contradicts local-first mandate | **Rejected** for adapter plane |

_Major Cloud Providers:_ Google Home coexistence is **parallel fabric**, not ENTERPRISE cloud dependency — OAuth/identity separate from Matter credentials ([Google Home fabric primer](https://developers.home.google.com/matter/primer/fabric)).

_Container Technologies:_ Docker Compose sufficient for MVP sidecar + engine + web LCARS.

**Multi-admin / coexistence tooling:** Google **Commissioning API** documents secondary commissioner adding Google fabric after custom fabric ([Multi-admin commissioning](https://developers.home.google.com/apis/android/commissioning/multi-admin)). ENTERPRISE commissioning UX must implement **explicit multi-admin flow** for Hybrid Control Loop (ART-01, FR6).

_Sources:_
- [Google Home — Matter fabric primer](https://developers.home.google.com/matter/primer/fabric)
- [Google Home — Multi-admin commissioning](https://developers.home.google.com/apis/android/commissioning/multi-admin)
- ENTERPRISE [prd.md](../prd.md) Architecture Preview

### Technology Adoption Trends

_Migration Patterns:_
1. **Monolithic SDK embed** → **certified sidecar server** (HA/OHF model, 2025 certification)
2. **Python matter-server** → **TypeScript matterjs-server** (2026 migration; maintenance mode on python-matter-server)
3. **Vendor cloud APIs** → **Matter cluster subset** on same hardware (Nest 4th gen pattern — reduced feature surface)

_Emerging Technologies:_ matter.js pure TS stack; Matter **1.5.x** TCP transport and camera clusters — **out of MVP Environmental scope** but SDK version pinning matters for recertification cycles.

_Legacy Technology:_ Direct Nest/Google API as primary control plane — PRD Hybrid Mode rejects for MVP truth path.

_Community Trends:_ First open-source **CSA-certified** Matter controller (HA + OHF server, March 2025) lowers risk for **integrate-not-fork sidecar** vs building commissioner from chip-tool.

**Preliminary stack recommendation (technology only — architecture decision in Step 4–6):**

| Priority | Stack direction | Rationale |
|----------|-----------------|-----------|
| **1** | **OHF Matter Server sidecar** (python-matter-server today; abstraction for matterjs-server) + **TypeScript orchestration engine** | Certified path; matches F-06 integrate-not-fork; isolates fabric crypto |
| **2** | **Headless HA** as optional substrate | Faster device plane; higher coupling; Lovelace still non-goal |
| **3** | **Custom matter.js commissioner** | Maximum control; solo-builder cost; defer unless sidecar limits block ART-01 |

**Research gaps (Step 3+):** Exact WebSocket API surface for engine adapter; HA REST entity mapping vs native engine registry; WAN-down subscription behavior; Thread BR failure modes.

_Sources:_
- [python-matter-server — maintenance → matter.js note](https://github.com/matter-js/python-matter-server)
- [Home Assistant Matter certification](https://www.home-assistant.io/blog/2025/03/10/matter-certification/)
- [Matter Handbook — specification index](https://handbook.buildwithmatter.com/specification/)

## Integration Patterns Analysis

*Step 3 — web-verified 2026-05-19. Maps adapter options to ENTERPRISE engine ↔ LCARS boundaries (PRD Architecture Preview, ART-01).*

### API Design Patterns

Three integration tiers emerge for ENTERPRISE MVP, ordered by coupling:

| Tier | Pattern | Engine ↔ device plane | LCARS coupling |
|------|---------|----------------------|----------------|
| **T1 — Sidecar RPC** | Engine as **WebSocket client** to OHF Matter Server | JSON RPC: `read_attribute`, `write_attribute`, `device_command`, `start_listening` | Engine exposes **REST + event stream** to LCARS (`/api/v1/*`, `/api/v1/events/stream` per PRD preview) |
| **T2 — HA mediation** | Engine as **HA REST/WebSocket client** | HA Matter integration maps clusters → entities; engine reads/writes entities | Higher indirection; faster bootstrap; Lovelace remains non-goal |
| **T3 — Direct Matter SDK** | Engine embeds commissioner | Native cluster APIs | Maximum complexity; bypasses certification sidecar benefits |

_RESTful APIs:_ ENTERPRISE **orchestration engine** should expose **REST** for commands (Environmental setpoint, conflict reconcile) and **outcome-typed responses** aligned with [tng-interaction-contract.md](../tng-interaction-contract.md) — Matter adapter returns structured facts; pack renders copy.

_RPC-style (Matter sidecar):_ python-matter-server uses **JSON-over-WebSocket RPC** — `CommandMessage` with `message_id`, `command`, `args`; responses as `SuccessResultMessage`, `ErrorResultMessage`, or streaming `EventMessage` ([websockets_api.md](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md)). This is **not REST** — adapter layer must translate REST commands → Matter RPC.

_GraphQL APIs:_ Not present in Matter ecosystem; **not recommended** for MVP adapter — adds schema layer without ecosystem support. **Confidence: High.**

_Webhook Patterns:_ Matter server pushes **attribute change events** after `start_listening` — functionally webhook-like push to engine; engine re-publishes on internal event bus for LCARS SSE/WebSocket.

**Environmental MVP mapping (Nest 4th gen):**

| Operator action | Sidecar command | Attribute path pattern |
|-----------------|-----------------|------------------------|
| Read current temp | `read_attribute` | Thermostat / TemperatureMeasurement clusters |
| Set heat/cool setpoint | `write_attribute` | Thermostat occupied setpoint attributes |
| Change mode | `write_attribute` or `device_command` | SystemMode / relevant Thermostat commands |

_Sources:_
- [python-matter-server WebSocket API](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md)
- ENTERPRISE [tng-interaction-contract.md](../tng-interaction-contract.md)
- ENTERPRISE [prd.md](../prd.md) Architecture Preview

### Communication Protocols

_HTTP/HTTPS:_ LCARS web console → engine over HTTPS on LAN. Stateless command POSTs; idempotency keys for setpoint commands recommended for ART-01 T2-01 race detection.

_WebSocket Protocols:_
- **Matter sidecar:** Single WS endpoint; `ServerInfoMessage` on connect; bidirectional JSON RPC ([python-matter-server docs](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md)).
- **HA (Option T2):** `ws://host:8123/api/websocket` — auth phase then command phase; `subscribe_events` for `state_changed` ([HA WebSocket API](https://www.home-assistant.io/integrations/websocket_api/)).
- **LCARS freshness:** Engine → LCARS event stream for ≤15s SLA (G3) — avoid polling Matter per tile render.

_Matter Interaction Model (native):_ Controllers use **Subscribe → Report Data** transactions with min/max intervals for attribute reporting ([Google Home Matter primer — reading](https://developers.home.google.com/matter/primer/interaction-model-reading)). Sidecar abstracts this; engine receives **already-normalized node/attribute events** via `start_listening`.

_Message Queue Protocols:_ Optional internal **MQTT or Redis pub/sub** between engine and alert FSM — not required MVP if monolithic engine process; useful Growth for multi-service rack.

**Commissioning transport:** BLE for initial wireless commissioning; **Thread dataset** / **WiFi credentials** must be pre-provisioned to sidecar via `set_thread_dataset` / `set_wifi_credentials` before `commission_with_code` ([WebSocket API](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md)).

_Sources:_
- [Google Home — Matter interaction model reading](https://developers.home.google.com/matter/primer/interaction-model-reading)
- [Home Assistant WebSocket API](https://www.home-assistant.io/integrations/websocket_api/)

### Data Formats and Standards

_JSON:_ Primary wire format for Matter sidecar RPC and ENTERPRISE engine APIs. Sidecar attribute paths use **`endpoint_id/cluster_id/attribute_id`** string convention (e.g. `"1/6/0"` for OnOff example; Thermostat paths analogous for Nest).

_Matter cluster semantics:_ Device type and cluster definitions from **Matter Application Cluster Specification** — Nest 4th gen implements Thermostat (partial), Temperature Measurement, Relative Humidity ([Matter Survey](https://www.matter-survey.org/device/nest-learning-thermostat-4th-gen-24582-13)). Engine registry should store **capability profile**, not assumed full Thermostat feature set.

_Protobuf / MessagePack:_ Matter wire protocol uses binary encoding internally; **not exposed** to ENTERPRISE engine when using sidecar — adapter boundary stays JSON.

_Custom ENTERPRISE formats:_
- **Outcome envelope** — `{ type: Verified|Conflict|... , deck, parameter, detail }` per interaction contract
- **Station registry entry** — `{ stationId, matterNodeId, endpointId, clusterProfile, authority, freshnessTs }`
- **Conflict record** — ART-02 taxonomy reference

_Sources:_
- [python-matter-server WebSocket API — attribute paths](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md)
- ENTERPRISE [docs/artifacts/art-02-conflict-taxonomy.md](../docs/artifacts/art-02-conflict-taxonomy.md)

### System Interoperability Approaches

**Recommended MVP pattern: Hexagonal / ports-and-adapters**

```
┌─────────────┐   REST/WS    ┌──────────────────┐   WS RPC    ┌─────────────────┐
│ LCARS web   │ ──────────── │ Orchestration    │ ────────── │ Matter Server   │
│ (experience)│   events     │ engine           │  events    │ (OHF sidecar)   │
└─────────────┘              │  - alert FSM     │            │  - fabrics      │
                             │  - policy/audit  │            │  - subscriptions│
                             │  - MatterPort    │            └────────┬────────┘
                             └──────────────────┘                     │ Matter
                                                                      ▼
                                                             ┌─────────────────┐
                                                             │ Nest Thermostat │
                                                             │ (+ Google fabric)│
                                                             └─────────────────┘
```

_Point-to-Point Integration:_ Direct engine ↔ sidecar WS — sufficient MVP on rack-of-one. No API gateway required.

_API Gateway Patterns:_ Defer — single operator LAN; engine auth is local IdP (PRD preview).

**Google coexistence (multi-fabric):** Secondary commissioner pattern — ENTERPRISE commissions to **own fabric first**, then `open_commissioning_window` enables Google fabric add ([WebSocket API — open_commissioning_window](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md)); aligns with ART-01 T1-01 and [Google multi-admin docs](https://developers.home.google.com/apis/android/commissioning/multi-admin).

**HA headless (T2) interoperability:** HA Matter integration consumes same sidecar; engine could subscribe to HA `state_changed` instead of sidecar events — **two consumers on one sidecar** is supported architecturally but requires **authority/conflict logic in engine**, not HA automations (ART-04 bounds).

_Sources:_
- [ART-01 coexistence scenarios](../docs/artifacts/art-01-coexistence-pack-v1.md)
- [Google Home multi-admin commissioning](https://developers.home.google.com/apis/android/commissioning/multi-admin)

### Microservices Integration Patterns

MVP deploys as **modular monolith or small multi-process** (engine + sidecar), not full microservices.

| Pattern | MVP application |
|---------|-----------------|
| **Sidecar** | Matter Server isolated for certification + fabric secrets — mirrors HA/OHF certified split |
| **Circuit breaker** | Sidecar disconnect → engine surfaces **OFFLINE / stale** on Environmental tile; no silent last-value (ART-01 T2-02) |
| **Saga / distributed tx** | Setpoint command: engine → sidecar write → await subscription confirm → emit **Verified** or **Conflict** — single saga in engine, not 2PC |
| **Service discovery** | Static localhost/Docker DNS for sidecar URL — sufficient MVP |

_API Gateway Pattern:_ Not MVP.

_Sources:_
- ENTERPRISE UX spec — PENDING ≠ broken; staleness via FSM guard
- [ART-01 T2-02 stale subscription](../docs/artifacts/art-01-coexistence-pack-v1.md)

### Event-Driven Integration

**Primary event flow (T1 sidecar pattern):**

1. Engine connects WS → sidecar; issues `start_listening`
2. Sidecar dumps existing nodes, then forwards **attribute change events**
3. Engine normalizes → updates station registry → publishes **domain events** (`env.setpoint.changed`, `env.verified`, `conflict.detected`)
4. LCARS subscribes to `/api/v1/events/stream` for HealthStrip, tiles, conflict banner (NFR-UX3)

_Publish-Subscribe:_ Sidecar → engine (WS events); engine → LCARS (SSE/WS). Alert FSM consumes engine events — **not** raw Matter events (separation of device plane vs ship operations).

_Event Sourcing:_ Audit log append for setpoint commands and alert transitions (Worf D-06 deferred) — engine stores events; Matter fabric history remains in sidecar store.

**ART-01 freshness contract:**

| Scenario | Event expectation |
|----------|-------------------|
| T1-02 LCARS setpoint | Subscription report → Verified within ≤15s |
| T1-03 Google setpoint | Sidecar event → engine → LCARS reflect within SLA |
| T2-01 dual command race | Engine detects conflicting authority before Verified |
| T2-03 WAN-down | Sidecar LAN subscriptions continue; engine marks cloud paths stale |

_Sources:_
- [python-matter-server — start_listening](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md)
- [ART-01](../docs/artifacts/art-01-coexistence-pack-v1.md)

### Integration Security Patterns

_Matter fabric security:_ CASE sessions, fabric-scoped ACLs — **owned by sidecar**; engine never holds Matter operational credentials. Multi-admin adds independent fabric credentials on same node ([Google fabric primer](https://developers.home.google.com/matter/primer/fabric)).

_ENTERPRISE identity (parallel plane):_ Captain/Crew/Guest clearance (FR19–22, D-10) — **application RBAC**, orthogonal to Matter ACL. Engine must not conflate Google OAuth session with Matter fabric authority.

_API authentication:_
- LCARS → engine: local session / token (PRD identity layer)
- Engine → sidecar: **localhost-only WS** in MVP; mutual TLS optional Growth
- Engine → HA (T2): long-lived access token ([HA API auth patterns](https://www.home-assistant.io/integrations/websocket_api/))

_Data encryption:_ Matter encrypts over LAN at protocol layer; HTTPS for LCARS; fabric store encrypted at rest by sidecar implementation.

**Clearance vs actuation:** Environmental writes pass engine policy gate before adapter `write_attribute` — implements Step 10 pre-command gates and Worf W-CT-01.

_Sources:_
- [Google Home — Matter fabric primer](https://developers.home.google.com/matter/primer/fabric)
- [Home Assistant WebSocket API — authentication](https://www.home-assistant.io/integrations/websocket_api/)

### Integration pattern recommendation (Step 3)

| Rank | Pattern | When |
|------|---------|------|
| **1** | **MatterPort** interface + **OHF sidecar WS client** + **engine event bus** + **REST/WS to LCARS** | Default MVP — D-12 lock target |
| **2** | **HAEntityPort** adapter over HA REST/WS | Spike only if sidecar commissioning blocked |
| **3** | Embedded SDK | Reject unless sidecar fails ART-01 |

**D-12 interface sketch (non-normative):**

```typescript
interface MatterAdapterPort {
  connect(): Promise<void>;
  getStations(): Promise<StationSnapshot[]>;
  readAttribute(stationId: string, path: AttributePath): Promise<unknown>;
  writeAttribute(stationId: string, path: AttributePath, value: unknown): Promise<CommandReceipt>;
  subscribe(handler: (event: MatterNodeEvent) => void): Unsubscribe;
  openCommissioningWindow(nodeId: string): Promise<CommissioningPayload>;
}
```

**Open questions for Step 4 (architecture):** Sidecar URL/config; reconnect/backoff; attribute path discovery for Nest; conflict detection algorithm (ART-02/03); matterjs-server wire-compat with MatterPort.

## Architectural Patterns and Design

*Step 4 — web-verified 2026-05-19. Produces draft architecture direction for `architecture.md` (D-01) and adapter lock (D-12).*

### System Architecture Patterns

**Recommended MVP pattern: Layered hexagonal monolith + certified Matter sidecar**

ENTERPRISE PRD already defines logical layers ([prd.md](../prd.md) Architecture Preview). Research validates mapping to **physical processes**:

| Logical layer (PRD) | Physical deployment | Pattern |
|---------------------|----------------------|---------|
| **Experience pack / LCARS web** | Browser + static/SSR host | **Client-server** — consumes engine API only |
| **Orchestration engine** | Single TS/Node (or Python) process | **Modular monolith** — alert FSM, policy, audit, registry |
| **Matter adapter** | OHF Matter Server sidecar | **Sidecar** — shares host lifecycle, separate process ([Microsoft Sidecar pattern](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/sidecar.md)) |
| **Identity** | Engine middleware | **Cross-cutting** — parallel to Matter fabrics |

**Why sidecar for Matter (not embedded SDK):**

1. **Certification isolation** — HA/OHF certified Matter Server as standalone component; UI/engine recertification decoupled ([HA certification blog](https://www.home-assistant.io/blog/2025/03/10/matter-certification/))
2. **Language independence** — Engine in TypeScript; sidecar Python (today) or TypeScript matterjs-server (tomorrow) via stable WS protocol
3. **Security segmentation** — Fabric credentials confined to sidecar attack surface
4. **Protocol adapter role** — Sidecar translates Matter binary interaction model → JSON RPC ([Sidecar as protocol adapter](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/sidecar.md))

**Rejected for MVP:**

| Pattern | Why rejected |
|---------|--------------|
| **Full microservices** | Solo-builder; rack-of-one; adds ops burden without MVP scale need |
| **Embedded connectedhomeip in engine** | Certification + toolchain cost; violates integrate-not-fork efficiency |
| **HA as primary application** | Lovelace non-goal (R-06); couples product identity to HA release cycle |
| **Serverless / cloud Matter** | Contradicts local-first P0 |

**Option comparison (architecture-level):**

| Option | Architecture | Strength | Weakness | MVP score |
|--------|--------------|----------|----------|-----------|
| **A — Sidecar + engine (recommended)** | Engine ←WS→ python-matter-server or matterjs-server | CSA-certified path; D-12 clean; TS engine alignment | Two processes to deploy | **High** |
| **B — HA headless substrate** | Engine ←REST/WS→ HA ←sidecar→ Matter | Fastest device plane | HA entity model leakage; dual config | **Medium (spike)** |
| **C — Custom matter.js in-engine** | Single process | Minimal deployment | Uncertified; highest build risk | **Low** |

**matterjs-server note:** Implements **Python Matter Server compatible WebSocket API** on `localhost:5580/ws` ([matterjs-server CLAUDE.md](https://github.com/matter-js/matterjs-server/blob/main/CLAUDE.md)) — enables sidecar swap without engine rewrite if `MatterPort` targets protocol semantics, not Python specifically.

_Sources:_
- [Microsoft Architecture Center — Sidecar pattern](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/sidecar.md)
- [matterjs-server architecture](https://github.com/matter-js/matterjs-server/blob/main/CLAUDE.md)
- ENTERPRISE [prd.md](../prd.md) Architecture Preview

### Design Principles and Best Practices

**Clean / hexagonal architecture** applied to orchestration engine ([AWS hexagonal guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/hexagonal-architecture.html)):

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN CORE (engine)                      │
│  Alert FSM · Station registry · Policy · Conflict · Audit   │
│  Outcome grammar · Clearance · Night Watch Lite scheduler   │
└───────────▲───────────────────────────────▲─────────────────┘
            │ ports                         │ ports
   ┌────────┴────────┐            ┌─────────┴──────────┐
   │ MatterAdapterPort│            │ ExperiencePackPort   │
   │ (driven)         │            │ (driven)             │
   └────────▲────────┘            └─────────▲──────────┘
            │ adapters                      │ adapters
   ┌────────┴────────┐            ┌─────────┴──────────┐
   │ OhfSidecarAdapter│            │ LcarsRestAdapter   │
   │ (WS JSON RPC)    │            │ TngConfigPack      │
   └──────────────────┘            └────────────────────┘
```

**Principles for ENTERPRISE:**

| Principle | Application |
|-----------|-------------|
| **Truth in engine, fiction in pack** | Matter readings and FSM state are engine facts; TNG copy is pack rendering (PRD core insight) |
| **Dependency inversion** | Engine depends on `MatterAdapterPort`, not python-matter-server imports |
| **Single writer for actuation** | Engine policy gate before any `write_attribute` — implements ART-04 bounds |
| **Fail closed** | Sidecar disconnect → PENDING/OFFLINE tiles; no silent stale-as-Green (UX spec) |
| **Outcome-typed commands** | All operator commands resolve to interaction-contract outcome types |

**ADR draft candidates for `architecture.md`:**

| ADR | Decision |
|-----|----------|
| **ADR-MA-01** | Matter plane isolated in OHF-certified sidecar process |
| **ADR-MA-02** | Engine exposes `MatterAdapterPort`; adapters are swappable |
| **ADR-MA-03** | Sidecar WS protocol = python-matter-server semantic contract (matterjs-server compatible) |
| **ADR-MA-04** | LCARS never connects to sidecar directly — engine mediates all device access |
| **ADR-MA-05** | Alert FSM ownership in engine core — not sidecar, not LCARS |

_Sources:_
- [AWS Prescriptive Guidance — Hexagonal architecture](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/hexagonal-architecture.html)
- [Ports and adapters pattern](https://www.smallstepsystems.com/ports-and-adapters-architecture-the-pattern/)
- ENTERPRISE [ux-design-specification.md](../ux-design-specification.md) — ADR-CS-01–08

### Scalability and Performance Patterns

**MVP scale:** Single home, one Environmental station, one operator — **vertical scale on rack-of-one** sufficient.

| Concern | Pattern | MVP implementation |
|---------|---------|---------------------|
| **Control latency** | Localhost WS + Matter LAN | Target PRD lab p95 ≤3s; G3 freshness ≤15s via subscriptions not polling |
| **UI freshness** | Event push (SSE/WS) | Engine publishes on sidecar `attribute_updated` events |
| **Sidecar reconnect** | Exponential backoff + circuit breaker | Engine marks stations PENDING; resubscribe `start_listening` on recovery |
| **Subscription min/max intervals** | Matter Interaction Model negotiation | Sidecar handles; engine respects reported freshness timestamps |
| **Horizontal scale** | Defer Growth | Multi-node K8s explicitly out of MVP scope |

**Sidecar overhead:** Microsoft pattern notes latency cost of inter-process communication ([Sidecar considerations](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/sidecar.md)) — acceptable for HVAC setpoint (seconds-scale), not microsecond trading.

**Performance anti-patterns to avoid:**

- LCARS polling Matter attributes per tile
- HA entity state as sole truth without freshness metadata
- Blocking operator UI on synchronous Matter reads without PENDING state

_Sources:_
- [Microsoft Sidecar pattern — problems and considerations](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/sidecar.md)
- [Google Home — Matter read/subscribe model](https://developers.home.google.com/matter/primer/interaction-model-reading)

### Integration and Communication Patterns

*(Extends Step 3 with architectural binding.)*

**Process topology (MVP rack-of-one):**

```yaml
services:
  lcars-web:        # Experience — React/Vite static + API client
    connects: engine-api
  enterprise-engine: # Orchestration monolith
    connects: matter-sidecar-ws
    exposes: REST + /api/v1/events/stream
  matter-sidecar:   # python-matter-server OR matterjs-server
    exposes: ws://127.0.0.1:5580/ws  # matterjs-server default
    storage: ./matter-data/chip.json
```

**Event-driven internal bus:** Engine normalizes sidecar events → domain events (`StationUpdated`, `SetpointCommanded`, `ConflictDetected`, `AlertPhaseChanged`). Alert FSM and LCARS stream consume same bus — aligns with local-first event-driven home patterns (cf. [Krill SSE architecture](https://github.com/bsautner/krill-oss), [PulseHome event pipeline](https://github.com/DokPlay/PulseHome)) without adopting their full stacks.

**Commissioning flow architecture:**

1. Operator initiates via LCARS → engine `CommissionStation` command
2. Engine → sidecar `set_thread_dataset` / `set_wifi_credentials` → `commission_with_code`
3. Post-commission → engine registers station in SQLite registry
4. Coexistence: engine → `open_commissioning_window` for Google fabric (ART-01 T1-01)

_Sources:_
- [matterjs-server — WS protocol compatibility](https://github.com/matter-js/matterjs-server/blob/main/CLAUDE.md)
- [python-matter-server WebSocket API](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md)

### Security Architecture Patterns

| Layer | Pattern | ENTERPRISE rule |
|-------|---------|-----------------|
| **Matter fabric** | CASE + ACL in sidecar | Engine has no fabric private keys |
| **Multi-admin** | Independent fabrics per ecosystem | Google + ENTERPRISE fabrics coexist; authority tracked in engine |
| **Application RBAC** | Captain/Crew/Guest clearance | Enforced in engine before adapter writes (W-CT-01) |
| **Network** | Localhost sidecar bind | WS not exposed WAN; LCARS HTTPS LAN-only MVP |
| **Audit** | Append-only command log | Setpoint + alert transitions; Growth retention NFR (D-06) |

**Segmentation:** Sidecar pattern reduces engine attack surface — Matter crypto stack not linked into LCARS web process ([Sidecar security pillar](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/sidecar.md)).

_Sources:_
- [Google Home — Matter fabric primer](https://developers.home.google.com/matter/primer/fabric)
- ENTERPRISE W-CT-01–19 security contracts

### Data Architecture Patterns

| Store | Owner | Contents |
|-------|-------|----------|
| **Sidecar fabric store** (`chip.json`) | Matter sidecar | Node IDs, fabrics, credentials — **source of truth for Matter membership** |
| **Engine SQLite** | Orchestration engine | Station registry, capability profiles, audit log, alert FSM state, conflict records, authority attribution |
| **Experience pack config** | Pack manifest | TNG copy, tokens — no device truth |
| **In-memory cache** | Engine | Last-known attributes + `freshnessTs` for HealthStrip staleness |

**CQRS-lite:** Commands (setpoint write) via REST POST; queries (tile state) from engine read model fed by subscription events — not live Matter read per request.

**Nest capability profile:** Store Matter Survey baseline (~55% Thermostat features) as registry metadata — prevents UI offering unsupported Matter features.

_Sources:_
- [Nest 4th gen Matter Survey](https://www.matter-survey.org/device/nest-learning-thermostat-4th-gen-24582-13)
- ENTERPRISE [matter-research-sources.md](../matter-research-sources.md) §4

### Deployment and Operations Architecture

**MVP deployment unit: Docker Compose on operator rack**

```yaml
# Illustrative — non-normative
services:
  matter-server:
    image: ghcr.io/home-assistant-libs/python-matter-server:stable
    # OR matterjs-server container when production-ready
    network_mode: host  # mDNS/Thread discovery
    volumes:
      - matter-data:/data
  enterprise-engine:
    depends_on: [matter-server]
    environment:
      MATTER_WS_URL: ws://127.0.0.1:5580/ws
  lcars-web:
    depends_on: [enterprise-engine]
```

**Operational concerns:**

| Concern | Approach |
|---------|----------|
| **Sidecar upgrades** | Independent lifecycle — key sidecar benefit ([Sidecar pattern](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/sidecar.md)); test ART-01 after upgrades |
| **mDNS / Thread** | `network_mode: host` or macvlan; set `PRIMARY_INTERFACE` per matterjs-server docs |
| **WAN-down (G1)** | Engine + sidecar + LCARS shell local; subscriptions LAN-persistent; cloud OAuth stale |
| **Observability** | Engine structured logs; sidecar health endpoint; correlate `message_id` on WS RPC |
| **CI** | Mock `MatterAdapterPort` for sprint 1; ART-01 harness against real Nest (D-13 post-sprint-1) |

_Sources:_
- [matterjs-server Docker docs](https://github.com/matter-js/matterjs-server/blob/main/docs/docker.md)
- [matterjs-server — PRIMARY_INTERFACE test requirement](https://github.com/matter-js/matterjs-server/blob/main/CLAUDE.md)
- ENTERPRISE [art-05-wan-down-soak-v0.md](../docs/artifacts/art-05-wan-down-soak-v0.md)

### Architecture decision summary (for D-01 handoff)

**Recommended MVP architecture: Option A — Hexagonal engine + OHF Matter sidecar**

| Component | Technology (provisional) | Confidence |
|-----------|-------------------------|------------|
| Sidecar (now) | python-matter-server (CSA-certified) | **High** |
| Sidecar (migrate) | matterjs-server when beta/stable for operator risk tolerance | **Medium** |
| Engine | TypeScript/Node modular monolith | **High** — aligns LCARS web stack |
| Engine ↔ sidecar | `MatterAdapterPort` → WS JSON RPC | **High** |
| Engine ↔ LCARS | REST + SSE event stream | **High** |
| Persistence | SQLite engine + sidecar chip.json | **High** |

**Locks for `architecture.md` creation:**

1. Document ADR-MA-01 through ADR-MA-05  
2. Specify `MatterAdapterPort` interface (from Step 3) as normative  
3. Define station registry schema + Nest capability profile  
4. Assign alert FSM ownership to engine module with ART-08 reference  
5. Document coexistence commissioning sequence (ART-01)  
6. Explicit non-goals: phone viewport, HA Lovelace, embedded SDK  

**Remaining gaps (Step 5–6):** Engine language/framework finalization; conflict detection algorithm; exact Thermostat attribute map for Nest 4th gen; sidecar version pin policy.

## Implementation Approaches and Technology Adoption

*Step 5 — web-verified 2026-05-19. Practical adoption path for solo-builder MVP aligned with A-19 handoff queue.*

### Technology Adoption Strategies

**Recommended: Strangler-fig sidecar adoption — certified path first, protocol-stable migration second**

| Phase | Adoption move | Rationale |
|-------|---------------|-----------|
| **Phase 0 — Spike (1 week)** | Run `ghcr.io/matter-js/python-matter-server:stable` on operator rack; connect `@matter-server/ws-client` from TS script; read Nest attributes | De-risk D-12 before `architecture.md` freeze |
| **Phase 1 — Sprint 1** | `OhfSidecarAdapter` + **mock `MatterAdapterPort`** for LCARS/engine; real sidecar in dev/staging only | UX sprint 1 (BattleStationsConfirm, ClearanceOverlay) proceeds parallel ([ux-design-specification.md](../ux-design-specification.md)) |
| **Phase 2 — Sprint 2** | Live Environmental loop on Nest; ART-01 T1-02/T1-03 manual then CI | G3 freshness proof |
| **Phase 3 — Migration eval** | Test **matterjs-server** beta on non-prod; compare WS compat | python-matter-server in maintenance mode ([GitHub](https://github.com/matter-js/python-matter-server)) |

**Nest commissioning strategy (critical path):**

Field reports indicate **direct Matter commissioning of Nest 4th gen to third-party controllers is unreliable** (timeouts, secure pairing failures) — [HA community reports](https://community.home-assistant.io/t/error-adding-nest-learning-thermostat-with-matter-to-ha/997392), [HA core issue #130006](https://github.com/home-assistant/core/issues/130006).

**Recommended coexistence flow for ART-01 T1-01:**

1. Nest on **Google Home fabric first** (operator current state in Hybrid Mode)
2. ENTERPRISE sidecar joins as **secondary fabric** via **Share device** / `open_commissioning_window` — mirrors HA documented multi-fabric share from Google Home ([HA Matter — share from another platform](https://www.home-assistant.io/integrations/matter/#to-share-a-device-from-another-matter-controller-like-apple-or-google-home))
3. Document fallback in runbook if direct `commission_with_code` fails

**Big-bang rejected:** Do not block sprint 1 LCARS on live Matter — mock port first.

_Sources:_
- [python-matter-server Docker docs](https://github.com/home-assistant-libs/python-matter-server/blob/main/docs/docker.md)
- [Home Assistant Matter — multi-fabric](https://www.home-assistant.io/integrations/matter/#multi-fabric-join-to-multiple-controllers)
- [Nest + HA Matter issue discussion](https://github.com/home-assistant/home-assistant.io/issues/40584)

### Development Workflows and Tooling

**Monorepo layout (proposed for implementation):**

```
enterprise/
  engine/           # TS — orchestration core, MatterAdapterPort, alert FSM
  lcars-web/        # TS/React — experience pack consumer
  packages/
    matter-port/    # Shared types + OhfSidecarAdapter
  docker/           # compose: matter-server + engine + lcars
```

**Engine ↔ sidecar client library:** [`@matter-server/ws-client`](https://www.npmjs.com/package/@matter-server/ws-client) (v0.6.x) — TypeScript, Node + browser; `startListening()` loads nodes and subscribes to events ([npm docs](https://www.npmjs.com/package/@matter-server/ws-client)).

**Sidecar deployment (dev):**

```bash
mkdir -p docker/matter-server/data
docker run -d \
  --name matter-server \
  --restart=unless-stopped \
  --security-opt apparmor=unconfined \
  -v $(pwd)/docker/matter-server/data:/data \
  --network=host \
  ghcr.io/matter-js/python-matter-server:stable
```

**Workflow gates (from UX + PRD):**

| Gate | Tooling |
|------|---------|
| F-07 LCARS visual CI | Playwright 1280×720 + 1024×768 |
| W-CT-03, W-CT-01 | Engine contract tests with mock adapter |
| ART-01 (G2) | Integration harness — D-13 post-sprint-1 |
| NFR-UX6 | Battle Stations gate — no sidecar bypass |

_Sources:_
- [@matter-server/ws-client npm](https://www.npmjs.com/package/@matter-server/ws-client)
- [python-matter-server docker.md](https://github.com/home-assistant-libs/python-matter-server/blob/main/docs/docker.md)

### Testing and Quality Assurance

| Layer | Strategy | MVP scope |
|-------|----------|-----------|
| **Unit** | Engine domain: FSM transitions, outcome mapping, conflict detection logic | Sprint 1 |
| **Contract** | `MatterAdapterPort` mock — record commands, emit synthetic `attribute_updated` | Sprint 1 |
| **Integration** | Real sidecar + Nest on LAN — ART-01 scenarios T1-01–T2-03 | Sprint 2+ |
| **E2E** | LCARS → engine → mock adapter → Verified flow | Sprint 1 |
| **Soak** | 24h WAN-down ART-05 on golden device | G1 — post-MVP loop |

**Mock adapter pattern (sprint 1 unblocker):**

```typescript
class MockMatterAdapter implements MatterAdapterPort {
  async writeAttribute() {
    return { receiptId: 'mock-1', pending: true };
  }
  subscribe(handler) {
    setTimeout(() => handler({ type: 'attribute_updated', /* nest-like */ }), 500);
    return () => {};
  }
}
```

**Nest-specific test fixtures:** Seed capability profile from [Matter Survey — Nest 4th gen](https://www.matter-survey.org/device/nest-learning-thermostat-4th-gen-24582-13) — assert UI does not expose unsupported Matter features.

### Deployment and Operations Practices

**Production MVP topology:** Docker Compose on operator rack — `network_mode: host` for sidecar ([docker.md](https://github.com/home-assistant-libs/python-matter-server/blob/main/docs/docker.md)); engine on bridge or host per platform.

**Operational checklist:**

| Task | Frequency | Owner |
|------|-----------|-------|
| Sidecar health (WS connect) | Continuous | Engine circuit breaker |
| Fabric backup (`/data` volume) | Weekly | Operator runbook |
| Sidecar image pin update | Monthly eval | After ART-01 smoke |
| Thread BR status (Nest Hub) | On commission | Operator notes (PRD) |
| mDNS interface | On deploy | Set `PRIMARY_INTERFACE` if using matterjs-server |

**Observability:** Correlate engine audit log `receiptId` ↔ sidecar WS `message_id`; log sidecar disconnect duration for T2-02 stale diagnostics.

**Docker caveat:** Self-managed Docker **as-is without official HA support**; Thread devices may have networking issues vs HA OS ([docker.md note](https://github.com/home-assistant-libs/python-matter-server/blob/main/docs/docker.md)). ENTERPRISE accepts this for rack-of-one with operator-controlled Linux host — document in runbook.

### Team Organization and Skills

**Solo-builder profile (current):**

| Skill | Need | Learning source |
|-------|------|-----------------|
| TypeScript / Node | Engine + LCARS | Existing UX web stack |
| Matter concepts (fabric, cluster, subscription) | Adapter + ART-01 | [matter-research-sources.md](../matter-research-sources.md), Google Matter primer |
| Docker host networking | Sidecar deploy | python-matter-server docker.md |
| WS client async patterns | `@matter-server/ws-client` | npm examples |
| HVAC domain (Nest limits) | Environmental UX honesty | Matter Survey device page |

No dedicated Matter firmware team required for MVP — **integrate-not-fork** sidecar.

### Cost Optimization and Resource Management

| Item | MVP cost | Note |
|------|----------|------|
| Matter Server software | **$0** — open source Apache 2.0 / OHF | Certification already paid by OHF ecosystem |
| Nest thermostat | Hardware sunk cost | Tier B device (PRD) |
| Nest Hub | Thread BR only | Not control-plane brain (PRD operator notes) |
| Cloud | **$0** in core path | Hybrid Google parallel fabric only |
| CSA certification (ENTERPRISE) | **Defer** | Using certified sidecar component — UI cert separate Growth concern |

**Resource floor:** Single Linux host with Bluetooth/D-Bus if direct commissioning needed; otherwise share-from-Google path reduces BLE dependency.

### Risk Assessment and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Nest direct commission fails** | High (field reports) | Blocks T1-01 | **Share from Google Home fabric** as primary path |
| **Sidecar Docker + Thread flakiness** | Medium | Stale tiles, G3 miss | Host networking; OTBR verification; T2-02 diagnostics |
| **python-matter-server EOL features** | Medium | Missing SDK features | Abstract `MatterPort`; eval matterjs-server Phase 3 |
| **Dual-writer conflict (Google + ENTERPRISE)** | High (Hybrid Mode) | Trust failure | Engine conflict detection ART-02/03; authority indicator |
| **Solo-builder parallel UX + Matter** | Medium | Sprint slip | Mock adapter sprint 1; spike week 0 |
| **WAN-down cloud OAuth stale** | Medium | Identity only — not HVAC | G1 soak ART-05; sidecar LAN persists |

## Technical Research Recommendations

### Implementation Roadmap

| Week | Deliverable | Exit criteria |
|------|-------------|---------------|
| **W0** | Sidecar spike + Nest fabric join | `start_listening` shows Nest node; one `read_attribute` |
| **W1–2** | `architecture.md` + `MatterAdapterPort` + mock adapter | ADR-MA-01–05; engine boots |
| **Sprint 1** | LCARS security composites + engine skeleton | W-CT-01–03 pass on mock |
| **Sprint 2** | Environmental live loop | ART-01 T1-02 pass ≤15s |
| **Pre-G2** | ART-01 CI harness (D-13) | 100% scenario pass |

### Technology Stack Recommendations

| Component | Recommendation | Pin |
|-----------|----------------|-----|
| Sidecar | `ghcr.io/matter-js/python-matter-server:stable` | Pin digest after W0 spike |
| WS client | `@matter-server/ws-client` | Latest 0.6.x |
| Engine | TypeScript Node ≥20.19 | Align matterjs-server engine req |
| Engine DB | SQLite | `better-sqlite3` or drizzle |
| LCARS | Existing UX stack (Vite/React) | Per UX spec |
| Sidecar (future) | matterjs-server when beta stable for operator | WS compat verified |

### Skill Development Requirements

1. Complete Matter Survey read for Nest 4th gen clusters  
2. Run HA Matter multi-fabric share flow once on test device (document screenshots for ART-01)  
3. Build `@matter-server/ws-client` hello-world against local sidecar  
4. Read [websockets_api.md](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md) command set  

### Success Metrics and KPIs

| Metric | Target | Source |
|--------|--------|--------|
| T1-02 setpoint match | Wall unit ≤15s | G3 / ART-01 |
| Matter control p95 | ≤3s lab | PRD performance |
| Sidecar uptime | ≥99.5% monthly | PRD availability |
| ART-01 CI | 100% pass | G2 |
| Sprint 1 mock coverage | W-CT-01–03 green | UX spec |
| WAN-down HVAC local | No silent cloud fallback | ART-01 T2-03 |

**Next workflow step:** Step 6 synthesis → then **`[CA] Create Architecture`** with this research as input artifact.

---

# Research Synthesis

## Executive Summary

ENTERPRISE Main Computer MVP requires a Matter adapter that controls one Environmental station (Nest Learning Thermostat 4th gen) while Google Home remains on a parallel fabric — without making Home Assistant Lovelace the product surface, without embedding the connectedhomeip SDK in the LCARS web tier, and without claiming sovereign operation the Hybrid Control Loop does not yet deliver.

Research across six steps converges on a **hexagonal orchestration engine + OHF-certified Matter sidecar** architecture. The sidecar (python-matter-server today; matterjs-server when operator-ready) owns fabric credentials and Matter subscriptions; the TypeScript engine owns alert FSM, authority/conflict policy, audit, and outcome grammar; LCARS consumes engine REST and event streams only. This matches Home Assistant's own certified separation ([HA Matter certification, March 2025](https://www.home-assistant.io/blog/2025/03/10/matter-certification/)) and Microsoft's sidecar pattern for protocol isolation ([Sidecar pattern](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/sidecar.md)).

The highest-risk discovery is **operational, not architectural:** third-party direct commissioning of Nest 4th gen frequently fails in the field. ART-01 T1-01 should treat **share-from-Google-Home-fabric** as the primary commissioning path ([HA multi-fabric documentation](https://www.home-assistant.io/integrations/matter/#to-share-a-device-from-another-matter-controller-like-apple-or-google-home)), with `open_commissioning_window` as the engine-side mechanism. Sprint 1 must not block on live Matter — a mock `MatterAdapterPort` unblocks LCARS security composites (W-CT-01–03) while a W0 sidecar spike validates Nest attribute reads.

**Key findings:**

- **Certified sidecar beats custom SDK** for solo-builder MVP — CSA-certified OHF path, fabric isolation, WS JSON RPC stable across python → matterjs migration
- **Nest Matter surface is partial** (~55% Thermostat cluster) — engine capability profile must not promise Google-app feature parity
- **`@matter-server/ws-client`** provides production TS client for engine (`startListening()` pattern)
- **Event push, not poll** — sidecar subscriptions → engine domain events → LCARS SSE; required for G3 ≤15s freshness
- **Hybrid conflict is engine-core** — dual-writer detection before Verified outcomes (ART-02/03)

**Top recommendations:**

1. Lock **ADR-MA-01–05** and `MatterAdapterPort` in `architecture.md` (D-01)
2. Run **W0 sidecar spike** before architecture sign-off
3. Implement **mock adapter sprint 1**, live Nest **sprint 2**
4. Document **Google-fabric-share** as normative commissioning in ART-01
5. Plan **matterjs-server** evaluation as sidecar swap, not engine rewrite

## Table of Contents

| § | Topic | Detail in document |
|---|-------|-------------------|
| 1 | Scope confirmation | Technical Research Scope Confirmation |
| 2 | Technology stack | Technology Stack Analysis |
| 3 | Integration patterns | Integration Patterns Analysis |
| 4 | Architecture | Architectural Patterns and Design |
| 5 | Implementation | Implementation Approaches and Technology Adoption |
| 6 | Executive synthesis | This section |
| 7 | ADR + port spec | Steps 3–4 |
| 8 | Roadmap + risks | Step 5 |
| 9 | Sources | Below |

## 1. Research Significance and Methodology

**Why now:** UX workflow is complete (A-18); implementation sprint 1 is blocked on D-01 (`architecture.md`). Matter adapter boundaries (D-12) are the highest-uncertainty technical decision for P0 Hybrid Control Loop.

**Methodology:** BMad technical research Steps 1–6; web-verified sources; ENTERPRISE input documents (PRD, UX spec, ART-01/04, matter-research-sources); confidence levels on field-report claims (Nest commissioning).

**Goals achieved:**

| Goal | Status |
|------|--------|
| Compare integrate-not-fork vs custom vs hybrid | **Done** — Option A sidecar recommended; HA headless = spike-only |
| Inform D-01 architecture.md | **Done** — ADR-MA-01–05 draft |
| Inform D-12 adapter lock | **Done** — `MatterAdapterPort` + WS semantic contract |
| Google coexistence path | **Done** — multi-fabric share primary |

## 2. Architecture Decision Record (Consolidated)

| ID | Decision |
|----|----------|
| **ADR-MA-01** | Matter plane in OHF-certified sidecar process |
| **ADR-MA-02** | Engine depends on `MatterAdapterPort`; adapters swappable |
| **ADR-MA-03** | Sidecar protocol = python-matter-server WS semantics (matterjs-server compatible) |
| **ADR-MA-04** | LCARS never connects to sidecar directly |
| **ADR-MA-05** | Alert FSM ownership in engine core |

## 3. Option Scorecard (Final)

| Option | MVP fit | Verdict |
|--------|---------|---------|
| **A — Sidecar + hexagonal engine** | High | **Adopt** |
| **B — HA headless substrate** | Medium | Spike / fallback only |
| **C — Embedded matter.js in engine** | Low | Defer |
| **D — Cloud Matter** | None | Reject |

## 4. Performance, Security, Compliance

- **Performance:** LAN WS + Matter subscriptions; HVAC seconds-scale; sidecar IPC overhead acceptable ([Sidecar considerations](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/sidecar.md))
- **Security:** Fabric keys in sidecar; clearance in engine; localhost WS bind; W-CT-01–19 unchanged
- **Compliance:** OHF Matter Server CSA-certified component; ENTERPRISE UI certification out of MVP scope

## 5. Implementation Roadmap (Consolidated)

| Phase | Deliverable |
|-------|-------------|
| **W0** | Sidecar spike + Nest node visible via `start_listening` |
| **D-01** | `architecture.md` with ADR-MA-01–05 + MatterPort |
| **Sprint 1** | Engine skeleton + mock adapter + LCARS W-CT-01–03 |
| **Sprint 2** | Live Environmental + ART-01 T1-02/T1-03 |
| **Pre-G2** | ART-01 CI harness (D-13) |

## 6. Risk Register (Consolidated)

| Risk | Mitigation |
|------|------------|
| Nest direct commission fails | Google fabric share primary |
| Thread/Docker networking | Host network; operator Linux host; runbook |
| Sidecar maintenance mode | MatterPort abstraction; matterjs-server eval |
| Dual-writer conflict | Engine ART-02/03 before Verified |
| Solo-builder overload | Mock adapter parallelizes UX sprint 1 |

## 7. Future Outlook

- **Near-term (2026):** matterjs-server stable as python-matter-server successor; WS protocol preserved
- **Medium-term:** Additional Matter device classes per PRD Growth; MatterPort unchanged
- **Long-term:** Optional Tier A sovereign commissioner if sidecar limits block P1+ devices

## 8. Primary Sources

| Source | Use |
|--------|-----|
| [HA Matter certification (2025-03-10)](https://www.home-assistant.io/blog/2025/03/10/matter-certification/) | Certified sidecar rationale |
| [python-matter-server WebSocket API](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md) | RPC contract |
| [python-matter-server Docker](https://github.com/home-assistant-libs/python-matter-server/blob/main/docs/docker.md) | Deployment |
| [@matter-server/ws-client](https://www.npmjs.com/package/@matter-server/ws-client) | Engine client |
| [matterjs-server CLAUDE.md](https://github.com/matter-js/matterjs-server/blob/main/CLAUDE.md) | Migration path |
| [Microsoft Sidecar pattern](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/sidecar.md) | Architecture pattern |
| [Nest 4th gen Matter Survey](https://www.matter-survey.org/device/nest-learning-thermostat-4th-gen-24582-13) | Capability limits |
| [HA Matter multi-fabric share](https://www.home-assistant.io/integrations/matter/#to-share-a-device-from-another-matter-controller-like-apple-or-google-home) | Coexistence UX |
| ENTERPRISE PRD, UX spec, ART-01 | Product constraints |

## Technical Research Conclusion

**Decision for D-01 / D-12:** Adopt **Option A — hexagonal TypeScript engine + OHF Matter sidecar** with `MatterAdapterPort`, Google-fabric-share commissioning, mock adapter for sprint 1, and `@matter-server/ws-client` for sidecar integration.

**Immediate next step:** **`[CA] Create Architecture`** (`bmad-create-architecture`) using this document as `inputDocuments` entry. Optional W0 spike can run in parallel.

**Confidence:** **High** on sidecar + hexagonal pattern and Nest capability limits; **Medium** on Nest commissioning path until operator W0 spike confirms Google-share on home hardware.

---

**Technical Research Completion Date:** 2026-05-19  
**Research Period:** May 2026 web-verified analysis  
**Source Verification:** All strategic claims traced to cited URLs or ENTERPRISE normative docs  
**Workflow:** Complete — Steps 1–6

