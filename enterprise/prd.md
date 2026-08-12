---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
releaseMode: phased
mvpPosture: hybrid
inputDocuments:
  - './matter-research-sources.md'
workflowType: 'prd'
briefCount: 0
researchCount: 1
brainstormingCount: 0
projectDocsCount: 0
productName: ENTERPRISE Main Computer
relatedProducts:
  - name: Bridge Physical Environment
    prdLocation: enterprise-bridge
    relationship: optional_integration_via_bridge_station_adapter
classification:
  projectType: platform_orchestration
  projectTypeTags:
    - orchestration_engine
    - experience_pack
    - matter_device_plane
    - voice_and_combadge_ux
  domain: connected_home
  secondaryDomain:
    - residential_systems_binding
    - tng_interaction_design
  complexity: medium
  complexityNotes:
    mvp: medium software delivery
    northStar: high matter coverage and experience depth
  projectContext: greenfield_product
  projectContextNotes: brownfield Matter/SDK and auth patterns; physical bridge is separate product
  primaryUser: home_operator
  mvpSurfaces:
    - web_lcars_console
  deferredSurfaces:
    - voice_computer
    - combadge_mobile
  experienceMandate: tng_protocol_ux_private
  customizationModel: experience_pack_and_config_slots
  northStarMetric: reliable_home_control_with_consistent_tng_interaction
  integrationOptional:
    adapter: bridge_station_v1
    contract: station_api_events_and_snapshot
  explicitNonGoals:
    - contractor_basement_build
    - viewscreen_mount_carpentry
    - arch_gpio_firmware_in_core
    - ha_card_dashboard_as_primary_ui
    - bridge_required_for_mvp
  outOfScopeProduct:
    - Bridge Physical Environment
elicitationApplied:
  - first_principles_analysis
  - pre_mortem_analysis
  - party_mode_scoping
  - first_principles_scoping
  - red_team_scoping
  - party_mode_functional_requirements
  - party_mode_nonfunctional_requirements
  - document_polish_critique_occam_audience_consistency_hindsight
visionSummary:
  product: ENTERPRISE Main Computer
  tagline: Local-first Matter orchestration; LCARS console (MVP); TNG voice and combadge (Growth)
date: '2026-05-16'
---

# Product Requirements Document - ENTERPRISE Main Computer

**Author:** Onimurasame
**Date:** May 16, 2026

## Document Map

| Section | Purpose | Primary audience |
|---------|---------|------------------|
| [Executive Summary](#executive-summary) | Vision, classification, positioning | Human |
| [Success Criteria](#success-criteria) | Outcomes, MVP acceptance gates | Both |
| [Traceability](#traceability) | KPI → Journey → FR → NFR | LLM |
| [Product Scope](#product-scope) | Summary pointer + procurement | Human |
| [User Journeys](#user-journeys) | Narrative context | Human |
| [Domain Requirements](#domain-specific-requirements) | Sovereign constraints, device tiers | Both |
| [Differentiation](#differentiation) | Innovation and market gap | Human |
| [Out of Scope (MVP)](#out-of-scope-mvp) | Negative requirements | LLM |
| [MVP Artifacts](#mvp-artifacts-referenced-by-frsnfrs) | External doc IDs for FRs/NFRs | LLM |
| [Project Scoping](#project-scoping--phased-development) | **Canonical** phased scope | Both |
| [Functional Requirements](#functional-requirements) | **Capability contract** | LLM |
| [Non-Functional Requirements](#non-functional-requirements) | Quality attributes | LLM |
| [Architecture Preview](#architecture-preview-non-normative) | Implementation orientation | LLM (non-normative) |
| [Operator Notes](#operator-notes-non-normative) | Buy/defer/dogfood | Human |

**Suggested LLM read order:** Frontmatter → MVP Acceptance (G1–G5) → Functional Requirements → Non-Functional Requirements → Project Scoping → Domain → User Journeys.

## Executive Summary

ENTERPRISE Main Computer is an open-source **home starship operations center** — authentic TNG LCARS shipwide control for Matter-enabled devices and custom sensors, with a physical **battle bridge** (basement) and **captain's chair** as the north-star command surface. Software MVP ships on a stable **orchestration engine** (device state, scenes, permissions, Matter integration, alert FSM) with swappable **experience packs** (copy, audio, voice profile, UI tokens).

The problem: fragmented smart-home control—multiple vendor apps, cloud-dependent assistants, generic dashboards. Main Computer unifies control behind one engine and one interaction grammar while remaining interoperable through Matter. **MVP proves the first Environmental station** (Nest Learning Thermostat, 4th gen) inside a whole-ship LCARS skeleton—not a thermostat app with Trek skin.

**MVP posture (Hybrid Control Loop, P0):** Prove one Matter Environmental subsystem loop, **Ops overview LCARS** (whole-ship skeleton), **alert FSM** (Green/Yellow/Red Alert/Battle Stations), authority/conflict handling, health strip, and Night Watch Lite on a single server with Google coexistence during transition. Full sovereign rack (local video, local LLM, air-gap) is north star **P1–P4**—not MVP marketing or acceptance scope.

**Target users:** Home operator (Captain); household crew/guests with scoped clearance; optional future OSS contributors. Fully usable before any physical bridge room exists.

**Related product (out of scope):** **Bridge Physical Environment** (`enterprise-bridge/`) — basement build; optional future `bridge-station` adapter; does not gate software milestones.

### What Makes This Special

- **Matter-native, local-first orchestration** — LAN device truth; Matter 1.4+; connectedhomeip-aligned commissioner.
- **TNG interaction contract** — "Acknowledged," "Unable to comply," clearance-aware responses; LCARS hierarchy on web (MVP).
- **Engine vs experience pack** — Fiction in pack; truth in engine; MVP uses config-first copy until second pack consumer.
- **Hardcore UX without physical set** — TNG LCARS on web first; battle bridge is high-fidelity renderer of same Station API (Growth physical build).
- **Phased sovereignty** — Hybrid bridge now; operator rack, local video, local LLM, air-gap later.

**Core insight:** Devices are **systems** the Computer operates; TNG is the **interaction contract**; Matter is the **device plane**.

### Classification

| Dimension | Value |
|-----------|--------|
| **Product** | ENTERPRISE Main Computer |
| **Type** | Platform orchestration — engine + experience pack + clients |
| **Domain** | Connected home / Matter; TNG interaction design |
| **Complexity** | Medium (MVP); high north star |
| **MVP surfaces** | Web LCARS console |
| **Deferred surfaces** | Voice Computer, combadge (Growth) |
| **Related product** | Bridge Physical Environment — separate PRD |
| **Release** | Phased (`releaseMode: phased`, `mvpPosture: hybrid`) |

## Success Criteria

### User Success

- **Primary job (MVP):** Captain operates **Environmental subsystem** (Nest thermostat) from LCARS with correct state within 15 seconds—without Google Home for routine changes. Default console landing is **Ops overview**, not subsystem detail.
- **Protocol:** TNG grammar on user-facing outcomes; diegetic failures with cause.
- **Worth-it bar:** 14-day dogfood; ≥50% thermostat adjustments via Main Computer.
- **Flagship ritual (MVP):** **Night Watch Lite** (three-step script). Full Night Watch → Growth.
- **Trust bar (MVP):** Authority indicator; **24h WAN-down soak** per protocol v0.
- **Aha moment:** First LCARS setpoint with "Acknowledged" and matching wall unit.

### Business Success

*Private project—operational success, not revenue.*

- **3 months:** Matter suite on Nest Learning Thermostat (4th gen); coexistence T1–T2 green; LCARS daily-usable.
- **6 months:** Voice stable (Growth); optional second Matter class; combadge Growth only.
- **Working signal:** 14 consecutive days Main Computer default for HVAC.

### Technical Success

- **M0:** Engine **config-slot** contract tests green; coexistence harness CI artifact (formal `tng-core` pack when second consumer exists).
- **M1:** Matter suites (commission, control, subscription, reboot, leave, multi-admin); coexistence T1–T2; **24h WAN-down soak protocol v0** on golden devices.
- **Video plane:** Separate track—no Matter MVP dependency.
- **Performance:** Matter control p95 ≤3s (lab); core path availability ≥99.5% monthly.

### MVP Acceptance Gates

| Gate | Criterion | Verifies |
|------|-----------|----------|
| **G1** | 24h WAN-down soak pass | NFR-R2, FR28, FR36 |
| **G2** | Coexistence conformance pack v1.0 100% CI | NFR-I3, FR-H2 |
| **G3** | HVAC ≥99% success; ≤15s freshness (7d) | KPI, NFR-P2 |
| **G4** | Degraded-mode fault-injection CI pass | NFR-R4 |
| **G5** | Fabric restore drill completed once | NFR-R5, FR41 |

### Measurable Outcomes (KPI)

| KPI | MVP target |
|-----|------------|
| Thermostat command success | ≥99% over 7 days |
| UI state freshness | ≤15s after command |
| Coexistence (T1–T2 + conflicts) | 100% conformance pack v1.0 |
| 24h WAN-down soak | Pass protocol v0 |
| Core path availability | ≥99.5% monthly |
| Camera event-to-notify | Growth — p95 ≤5s LAN |

### Starship MVP Acceptance

Proves **starship operations UX** (not thermostat-app identity) on P0 hardware footprint:

| AC | Criterion |
|----|-----------|
| **AC-S1** | Red Alert from LCARS applies Environmental safe band + alert layout within **3s** without opening Google Home |
| **AC-S2** | Operator completes Yellow Alert escalation via LCARS alone within **45s** |
| **AC-S3** | External HVAC override during Yellow shows `[EXTERNAL OVERRIDE DETECTED]` (or equivalent) within **10s** with one-tap restore affordance |
| **AC-E1** | Operator reports **Captain-not-passenger** sentiment in weekly dogfood check-in (Roddenberry test) |
| **AC-E2** | Zero instances of **Verified** skipped — Acknowledged without Adjusting/Verified within SLA unless Unable to comply raised |
| **AC-E3** | Operator can explain ≥3 **OFFLINE/PENDING** department roadmaps without embarrassment |
| **AC-E4** | After first Red Alert drill, operator cites **closure** (Incident Summary or equivalent) |
| **AC-E5** | First **Verified** setpoint rated ≥4/5 trust in internal dogfood journal |

See [ART-08](./docs/artifacts/art-08-alert-condition-matrix.md) and [ux-design-specification.md](./ux-design-specification.md).

## Traceability

| Success / KPI | Journey | FR | NFR / Gate |
|---------------|---------|-----|------------|
| HVAC control ≤15s | 0, 1 | FR1–FR3, FR13 | NFR-P2, G3 |
| Authority + conflict | 5 | FR7–FR12, FR16–FR17 | NFR-I3, G2 |
| 24h soak | — | FR28, FR36 | NFR-R2, G1 |
| Night Watch Lite | 2 | FR26–FR27 | NFR-P4 |
| Guest clearance | 4 | FR19–FR22 | NFR-S7 |
| Onboarding / hybrid | 0, 1 | FR29, FR38–FR39 | G4 context |
| Fabric recovery | F1 | FR11, FR41 | G5 |
| Voice | 7 (Growth) | FR-G3 | — |
| LCARS console UX | 0–5 | FR13–FR17, FR48–FR52 | NFR-UX1–UX6 |
| Alert FSM / ship skeleton | — | FR44–FR52 | ART-08, AC-S1–S3, AC-E1–E5 |
| Artifact-backed reqs | — | FR8–9, FR28–32 | ART-01–ART-08 |

## Product Scope

**Canonical scope:** [Project Scoping & Phased Development](#project-scoping--phased-development). **Capabilities:** [Functional Requirements](#functional-requirements). **Quality:** [Non-Functional Requirements](#non-functional-requirements).

**MVP summary:** Hybrid Control Loop — one Nest Learning Thermostat (4th gen, Matter) as **Environmental station**, **Ops overview** LCARS with whole-ship skeleton, alert FSM, conflict policy, authority indicator, health strip, Night Watch Lite, thin P1 platform contracts on one server.

**Hardware alignment (procurement):** Buy Nest Learning Thermostat (4th gen) now; Nest outdoor cam for later video plane; defer Lockly; Nest Hub only if Thread border router needed.

## User Journeys

### Personas

| Persona | Role | Clearance |
|---------|------|-----------|
| **Onimurasame** | Captain / operator | Full |
| **Partner** | Crew | Environmental |
| **Guest** | Visitor | Quarters / limited |
| **Contributor** | OSS developer | Post-MVP (post-dogfood) |

### Journey 0 — Thermostat in hand: unbox to first comfort

Google Home commissions device; Main Computer on home server. Multi-admin for thermostat-only scope. First LCARS setpoint; "Acknowledged"; wall unit matches ≤15s.

**Covers:** FR1, FR6, FR13, FR38

### Journey 1 — Captain: coexistence-first commission

Scoped commissioning; Thread BR documented. Dual visibility: what Google retains vs Main Computer controls. Device on health strip.

**Covers:** FR6–FR7, FR17, FR38–FR39

### Journey 2 — Night Watch Lite (MVP)

LCARS ritual: status line, optional scene, closing line. Skip preference stored. Full Night Watch → Growth.

**Covers:** FR25–FR27, FR33

### Journey 3 — Unable to comply (edge case)

Timeout/offline → diegetic error, retry. Recovery logged in audit.

**Covers:** FR4, FR34–FR35

### Journey 4 — Guest: limited clearance

Out-of-scope denied with clearance message. Host reviews log after session.

**Covers:** FR19–FR22

### Journey 5 — Coexistence: two controllers

Diagnostics, divergence display, conflict reconciliation. T1–T2 matrix pass.

**Covers:** FR7–FR10, FR17

### Journey 6 — Crew: partner adjusts comfort

LCARS environmental control within crew scope (MVP). Voice → Growth. Multi-zone → Growth.

**Covers:** FR13, FR20 (crew); FR-G3 (voice, Growth)

### Journey 7 — Voice: one intent *(Growth)*

Deferred from MVP. Bounded HVAC voice intents consistent with console truth.

**Covers:** FR-G3

### Journey 8 — OSS contributor *(post-dogfood)*

Pack-only changes with contract tests. **Not required before MVP ship or 14-day dogfood.**

**Covers:** FR-G7

### Failure journeys (reference)

| ID | Trigger | Response | FR |
|----|---------|----------|-----|
| F1 | Fabric desync | Recovery wizard | FR11 |
| F2 | Commission timeout | Retry guidance | FR1, FR39 |
| F3 | Thread BR offline | Block commission; BR docs | FR38 |

### Journey Requirements Summary

| Capability area | Journeys |
|-----------------|----------|
| Onboarding & coexistence | 0, 1, 5, F1–F3 |
| HVAC / Matter control | 0, 1, 3, 6 |
| Rituals | 2 |
| Roles & policy | 4, 6 |
| Voice *(Growth)* | 7 |
| Observability | 3, 5 |
| OSS *(post-dogfood)* | 8 |

## Domain-Specific Requirements

**Domain:** Sovereign Home Operations — single-dwelling, operator-controlled edge site.

### Sovereign control plane (strategic)

Operator-owned rack: local inference, local video, Matter orchestration, encrypted remote access for operator only. Cloud vendors not in **core data path**. Internet optional for maintenance—not daily operation.

**Phased posture (domain P0–P4):**

| Phase | Focus | WAN |
|-------|--------|-----|
| P0 Bridge | Matter thermostat; Google coexistence; rack skeleton | Setup |
| P1 Sovereign core | Local auth; encrypted API; policy shell *(non-LLM in MVP)* | Not required daily (24h soak) |
| P2 Local perception | RTSP → Frigate/NVR | Not required for core video |
| P3 Local Computer | Local STT + LLM; tool-gated actuators | Optional |
| P4 Air-gap | IoT egress deny; VPN-only operator | Maintenance only |

### Compliance & safety

- On-rack data residency (camera/voice/automation) by default (Growth+).
- Operator runbooks for retention and household privacy.
- Matter 1.4+; local commissioning for Tier A.
- HVAC: respect manufacturer safety limits; no software override.

### Technical constraints

| Constraint | Requirement |
|------------|-------------|
| WAN-down | Core flows ≥24h without WAN (MVP soak) |
| Zero trust | VPN; mTLS; no inbound ports (Growth hardening) |
| Identity | Local IdP path; Google OAuth **transition only** |
| Video | RTSP/Frigate north star; Nest cloud video not SoT |
| LLM | On-rack, tool allowlist (Vision); none in MVP core |
| Matter | Local commissioner; Thread BR; engine policy authority |
| Network | VLAN segmentation (Growth) |
| Encryption | TLS/mTLS; encryption at rest |

### Device taxonomy (procurement)

| Tier | Criteria | Examples |
|------|----------|----------|
| **A** | No mandatory vendor cloud for operation | Matter via local commissioner; RTSP/PoE |
| **B** | Matter + partial local; cloud for setup | Nest thermostat 4th gen |
| **C** | Cloud-required routine operation | Nest cameras (long-term SoT) |

**Now:** Thermostat = Tier B (P0). Outdoor cam = Tier C long-term. Nest Hub = Thread BR only.

### Domain patterns

| Do | Avoid |
|----|--------|
| Tier A/B/C registry | "Works with Matter" without tier |
| WAN-down soak as gate | Google as permanent IdP SoT |
| Engine vs pack separation | Cloud LLM in core without opt-in |
| Break-glass + backup | Single operator, no recovery |

### Risk mitigations

| Risk | Mitigation |
|------|------------|
| Nest/Google lock-in | Transition matrix; Tier A spike (R-06b); P4 decommission |
| False Matter = local | Tier matrix |
| Operator lockout | Break-glass; key ceremony |
| IoT exfiltration | Quarantine VLAN; egress deny (P4) |

## Differentiation

### Innovation areas

1. **Sovereign residential edge site** — Dwelling as private AZ; WAN optional for operation.
2. **TNG protocol-first UX** — Shared grammar across surfaces (LCARS MVP).
3. **Engine / experience pack split** — Swappable fiction; stable credentials/policy.
4. **Matter-open local control plane** — Commissioner on operator hardware; tiers A/B/C.
5. **Local institutional Computer** — On-rack LLM with tool gates (Vision).

### Competitive landscape

| Alternative | Gap |
|-------------|-----|
| Google / Apple Home | Cloud SoT; no sovereign operator rack |
| Home Assistant | No unified Matter-forward TNG product surface |
| Frigate / NVR only | Video without Computer + Matter + rituals |
| Enterprise zero-trust | Not packaged for home + Matter + TNG |

*Validation and phased risks: see [MVP Acceptance Gates](#mvp-acceptance-gates), [Project Scoping](#project-scoping--phased-development), and [Non-Functional Requirements](#non-functional-requirements).*

## Out of Scope (MVP)

Combadge; Android; bridge-station; Lockly; Nest cam in success path; voice; full Night Watch; production Frigate; local LLM; air-gap P4; full OPA/multi-node K8s; contributor CI as release blocker; sovereign/air-gapped **user-facing** claims; second Matter class unless soak fails → Tier A spike.

## MVP Artifacts (referenced by FRs/NFRs)

| Artifact ID | Name | Purpose | Referenced by |
|-------------|------|---------|---------------|
| ART-01 | Coexistence conformance pack **v1.0** | T1–T2 + conflict scenarios; CI pass/fail | FR-H2, NFR-I3, G2 |
| ART-02 | Conflict taxonomy | Dual command, stale telemetry, authority mismatch classes | FR8, FR9 |
| ART-03 | Conflict resolution matrix | Outcome per class (winner, block, escalate) | FR9, FR10 |
| ART-04 | Hybrid automation bounds | Rate, delta, time windows before actuators | FR30 |
| ART-05 | 24h WAN-down soak protocol **v0** | WAN down, Google app logged out, pass/fail criteria | NFR-R2, FR36, G1 |
| ART-06 | Degraded-mode matrix | Fail-closed/read-only per subsystem | FR32, NFR-R4 |
| ART-07 | Soak reference automation | Example HVAC rule for FR28 (e.g. nightly setback) | FR28, Scoping soak note |
| ART-08 | Alert condition matrix | Green/Yellow/Red Alert/Battle Stations baselines + configurable scope | FR44–FR52, NFR-UX4–UX6, AC-S1–S3 |

*Bodies: [docs/artifacts/](./docs/artifacts/) — expand ART-01–ART-07 before G1–G5; ART-08 normative for alert UX.*

## Project Scoping & Phased Development

> **For implementers:** Canonical phased scope. MVP = Hybrid Control Loop (P0). Do not implement FR-G* or NFR-S9+ without explicit phase approval.

### MVP Strategy & Philosophy

| Field | Decision |
|-------|----------|
| **Canonical name** | **MVP — Hybrid Control Loop (P0)** |
| **Posture** | Hybrid — honest about Google coexistence |
| **Philosophy** | Trust before ritual |
| **Resource** | Solo builder; one vertical epic |

### MVP Build Order (normative sequence)

1. Deploy single-server bundle (FR42, NFR-O2)
2. Onboard + Hybrid Mode (FR29, FR34, FR38)
3. **Ops overview + whole-ship skeleton + alert FSM spine** (FR44–FR48, FR51)
4. Commission thermostat + multi-admin (FR1, FR6)
5. Prove Environmental subsystem + conflict UI (FR2–FR3, FR7–FR10, FR13–FR17, FR48)
6. Coexistence pack + 24h soak + fabric drill (FR-H2, FR36, NFR-R2, NFR-R5, G1–G5, AC-S1–S3)

### MVP Feature Set

| ID | Capability |
|----|------------|
| T1 | Matter Environmental — Nest Learning Thermostat (4th gen) only |
| T2 | Web LCARS P0 — **Ops overview** default; subsystem state, command, errors with cause |
| T3 | Google coexistence matrix T1–T2 including conflict scenarios |
| T4 | Conflict policy + recovery (not indicator-only) |
| T5 | Authority indicator — Main Computer / Google / conflict |
| T6 | Health strip — path up, last sync, last error |
| T7 | Night Watch Lite — three-step script; suspends under alert |
| T8 | Hybrid Mode surfaced as **ship status chrome** in UI and onboarding |
| T9 | Engine: event bus, device registry, minimal scenes, alert FSM |
| T10 | P1-MVP checklist (max 5): device IDs, audit, RBAC hook, event envelope, deploy bundle + rack note |
| T11 | Captain / guest roles; Google OAuth transition only |
| T12 | Copy/tokens config-first; `tng-core` pack when second consumer exists |
| T13 | **Whole-ship skeleton** — Environment/Tactical/Engineering/Science/Ops tiles; OFFLINE/PENDING with roadmaps |
| T14 | **Alert FSM** — Green/Yellow/Red Alert/Battle Stations; ART-08 baselines; confirm gate before destructive actuation |

### Soak reference automation

**Reference automation (MVP):** One scheduled or rule-based HVAC action during WAN-down soak (operator-defined; must appear in audit log). Example: nightly setback when away.

### MVP Exit Criteria

Align with [MVP Acceptance Gates](#mvp-acceptance-gates) G1–G5 and [Starship MVP Acceptance](#starship-mvp-acceptance) AC-S1–S3, AC-E1–E5.

### UX & Alert Phasing

| Feature | MVP (P0) | Growth (P1) | Vision (P2+) |
|---------|----------|-------------|--------------|
| Whole-ship skeleton UI | All dept tiles; Environment live; OFFLINE/PENDING roadmaps | Multi-zone Environment; first Tactical devices | All departments live |
| Alert FSM | Green/Yellow/Red/Battle Stations on web; Environmental baselines; confirm gate | Zone propagation; bridge audio | Physical alert panel + battle bridge lighting |
| Environmental subsystem | Nest read/write via `env.subsystem` drill-down | Multi-zone Matter HVAC | Full environmental replication |
| Tactical station | OFFLINE tile + roadmap | Locks, motion, perimeter | Dedicated Tactical display |
| Science sensors | OFFLINE tile + roadmap | First Class III sensor pack | Full sensor mesh |
| Battle bridge physical | OUT — web LCARS full-screen acceptable | Secondary wall display | Basement battle bridge built |
| Battle Stations actuation | Confirm gate + audit; destructive actions PENDING until hardware | Locks, scenes, bridge lighting | Full actuation layer |
| Night Watch Lite | Manual; alert-aware suspend | Scheduled + alert-aware | Full Night Watch (FR-G1) |
| Coexistence / Hybrid | Authority UI; no Google suspend at Yellow baseline | Per-zone conflict | TNG preferred SoT |

Canonical UX detail: [ux-design-specification.md](./ux-design-specification.md), [ART-08](./docs/artifacts/art-08-alert-condition-matrix.md).

### Unified Roadmap (Horizon × Platform)

| ID | Outcome | Horizon | Tier |
|----|---------|---------|------|
| R-01 | HVAC control loop | MVP | P0 + thin P1 |
| R-02 | Authority + conflict | MVP | thin P1 |
| R-03 | 24h WAN-down soak | MVP | P0 |
| R-04 | Health strip + Night Watch Lite | MVP | P0 |
| R-05 | Night Watch (full) | Growth | P1 |
| R-06 | Sovereign control plane + Matter fleet | Growth | P1→P2 |
| R-06b | Tier A Matter device | Growth | P1 |
| R-07 | Local video | Growth | P2 |
| R-08 | Local LLM Computer | Vision | P3 |
| R-09 | Air-gap mode | Vision | P4 |

### Release Tranches (post-MVP)

| Release | Focus |
|---------|--------|
| **R2 Growth — habit** | Full Night Watch; voice; combadge; second Matter class |
| **R3 Growth — perception** | Frigate / LAN video |
| **R4 Vision — cognition** | Local LLM + eval |
| **R5 Vision — seal** | Air-gap; egress deny |

### Risk Mitigation Strategy

False sovereign narrative; two-brain thermostat; thin P1 scope creep; fake soak; OSS before dogfood; **UX spec / PRD version drift** — mitigate with concurrent PRD amendment when UX spec changes (see [index.md](./index.md) precedence).

## Functional Requirements

> **For implementers:** Capability contract. MVP = FR1–FR52, FR-H1–H3. Growth/Vision = FR-G*. Trace to [Traceability](#traceability).

**Phase: MVP** — Device Control & Matter Integration

- **FR1:** The operator can commission a Matter HVAC device (Tier B per device taxonomy; Nest Learning Thermostat 4th gen for MVP) when a Thread border router is available.
- **FR2:** The operator can read and change HVAC setpoint and mode from Main Computer with device-confirmed outcomes.
- **FR3:** The system can reflect HVAC subscription updates in the console within the documented freshness SLA.
- **FR4:** The system can detect command timeout or device unreachability and present a diegetic failure with retry affordance.
- **FR5:** The system can recover from transient Matter disconnect without requiring full re-commission when fabric credentials remain valid.

**Phase: MVP** — Authority, Coexistence & Conflict

- **FR6:** The operator can add Main Computer as secondary Matter administrator without revoking Google Home (multi-admin where supported).
- **FR7:** The operator can see current authority holder and source of last HVAC change (Main Computer, Google, or conflict).
- **FR8:** The system can classify coexistence conflicts per ART-02 (dual command, stale telemetry, authority mismatch).
- **FR9:** The system can apply a conflict resolution outcome per ART-03 (winner, block, or escalate-to-operator) for each conflict class.
- **FR10:** The operator can reconcile a displayed conflict via console actions (accept Main Computer state, accept external state, or defer with reason).
- **FR11:** The operator can follow fabric desync recovery guidance when coexistence recovery is required.
- **FR12:** The system can record authority grants, transfers, revocations, and conflict resolutions in the audit log.

**Phase: MVP** — Operator Console (LCARS)

- **FR13:** The operator can perform permitted Environmental subsystem actions (HVAC setpoint/mode for MVP) from the web LCARS **Environmental subsystem panel** (`env.subsystem`).
- **FR14:** The operator can view subsystem status, health strip, last command, and linked error detail from the console hierarchy with **Ops overview** (`ops.overview`) as default landing.
- **FR15:** The operator receives user-facing outcomes in TNG interaction grammar including remediation and required clearance on denial.
- **FR16:** The operator can expand from Night Watch Lite to full conflict or diagnostics view when a conflict banner is active.
- **FR17:** The operator can access coexistence diagnostics when displayed state may be stale or divergent.

**Phase: MVP** — Identity, Roles & Policy

- **FR18:** The operator (Captain) can authenticate using the hybrid transition identity flow.
- **FR19:** The operator can assign time-bounded guest sessions with documented environmental clearance only.
- **FR20:** The system can deny out-of-scope commands with clearance-appropriate messaging before actuators execute.
- **FR21:** The system can evaluate control actions through a default-deny policy decision interface with auditable allow/deny reason codes.
- **FR22:** The host can review guest and material control activity in the audit log after sessions end.
- **FR23:** An authorized operator can invoke time-limited break-glass elevation for defined safety actions with mandatory high-severity audit records.

**Phase: MVP** — Orchestration, Scenes & Rituals

- **FR24:** The operator can register devices in a site-scoped device registry with stable identifiers.
- **FR25:** The operator can activate a minimal scene as part of Night Watch Lite or a documented automation.
- **FR26:** The operator can run Night Watch Lite (status line, optional scene, closing line) and skip subsequent runs with preference retained.
- **FR27:** The system can execute Night Watch Lite without requiring a cloud assistant in the core path.
- **FR28:** The operator can run at least one automation defined in ART-07 during WAN-down soak validation (per ART-05).

**Phase: MVP** — Hybrid Control & Degraded Modes

- **FR29:** The operator can acknowledge Hybrid Mode boundaries (what is automated, advisory, or blocked) during onboarding.
- **FR30:** The system can enforce hybrid automation bounds per ART-04 (rate, delta, or time windows) before actuator commands.
- **FR31:** The operator can issue an explicit override when hybrid bounds block a permitted manual command.
- **FR32:** The system can enter degraded modes per ART-06 (policy unavailable, commissioner unreachable) with defined fail-closed or read-only behavior.

**Phase: MVP** — Observability, Health, Audit & Soak

- **FR33:** The operator can view a health strip showing control-path status, last sync, and last error with drill-down to subsystem detail.
- **FR34:** The system can append immutable audit records for commands, denials, and authoritative state changes without secret material.
- **FR35:** The system can emit versioned domain events with correlation identifiers suitable for console and future clients.
- **FR36:** The operator can run a named soak session with documented pass/fail criteria (uptime, conflict count, authority violations, recovery after reconnect).
- **FR37:** The operator can pause or abort an in-progress soak with documented consequence summary.

**Phase: MVP** — Onboarding & Commissioning

- **FR38:** The operator can complete first-time onboarding that detects existing Google Home commissioning and Thread prerequisites.
- **FR39:** The operator can roll back or recover from failed or partial onboarding without leaving the fabric in an undefined state.

**Phase: MVP** — Platform, Secrets & Fabric (thin P1)

- **FR40:** The system can store runtime and bootstrap secrets in a designated store with rotation/revocation procedures documented for the operator.
- **FR41:** The operator can back up and restore Matter fabric/commissioner state independently of the device registry.
- **FR42:** The operator can deploy Main Computer on a single server using the documented deployment bundle (technology-agnostic) with a documented migration path to rack deployment.
- **FR43:** Edge integrations can register against a versioned Station API surface (stub responses permitted in MVP if contract is stable).

**Phase: MVP** — Alert FSM & Ship Operations UX

- **FR44:** The operator can view and manually transition alert conditions among Green, Yellow Alert, Red Alert, and Battle Stations per [ART-08](./docs/artifacts/art-08-alert-condition-matrix.md) (hold-to-confirm for Red; Battle Stations requires confirm gate).
- **FR45:** The system can execute **baseline** alert automations inherent to each alert level and display a transition interstitial listing actions taken and PENDING/skipped baselines.
- **FR46:** The operator can configure **configurable** alert automations with declared valid alert levels (`validAt`) without disabling locked baselines.
- **FR47:** The operator can de-escalate alert conditions per ART-08 (Yellow auto-stand-down with hysteresis; Red/Battle Stations PIN + hold; Incident Summary before Green restore from Battle Stations).
- **FR48:** The operator can view **Ops overview** (`ops.overview`) showing whole-ship department tiles (Environment, Tactical, Engineering, Science, Ops) with NOMINAL, ADVISORY, OFFLINE, or CONFLICT states and activation roadmaps for offline stations.
- **FR49:** The operator can view read-only **Automatic Responses** lists showing locked baseline behaviors per alert level.
- **FR50:** The operator can create, edit, enable, disable, and dry-run configurable alert automation rules subject to alert-level gating.
- **FR51:** The system can emit `AlertTransitionEvent` and `RuleSuppressedEvent` domain events on alert transitions for LCARS, audit, and future bridge renderers.
- **FR52:** The system can suspend Night Watch Lite when alert condition is Yellow or higher with diegetic copy per [tng-interaction-contract.md](./tng-interaction-contract.md).

**Phase: CI harness**

- **FR-H1:** The CI harness can run Matter thermostat scenarios against a deterministic simulated commissioner without hardware.
- **FR-H2:** The CI harness can execute the coexistence test matrix and emit a pass/fail report artifact.
- **FR-H3:** The CI harness can validate event-envelope schema compatibility across one major version.

**Phase: Growth & Vision**

- **FR-G1:** The operator can run full Night Watch with digest and anomaly summary *(Growth)*.
- **FR-G2:** The operator can control a second Matter device class from Main Computer *(Growth)*.
- **FR-G3:** The operator can use voice for bounded HVAC intents with responses consistent with console truth *(Growth)*.
- **FR-G4:** The operator can receive local video-plane events without cloud as system of record *(Growth)*.
- **FR-G5:** The operator can interact with a local LLM Computer subject to tool allowlists and policy *(Vision)*.
- **FR-G6:** The operator can access Main Computer over an encrypted operator-only remote channel *(Growth)*.
- **FR-G7:** A contributor can publish experience-pack changes validated by contract tests *(Growth — post-dogfood; not before MVP ship and 14-day dogfood)*.
- **FR-G8:** The operator can run Main Computer in air-gap posture with IoT egress denied by default *(Vision)*.

## Non-Functional Requirements

> **For implementers:** Measurable quality attributes. MVP ship = [G1–G5](#mvp-acceptance-gates). **[CI]** / **[Field]** = verification method.

### Performance

- **NFR-P1 [Field]:** Matter HVAC command acceptance ≤ **3s p95** (golden Nest 4th gen, lab LAN).
- **NFR-P2 [CI+Field]:** Console state reflection ≤ **15s p95** after device acceptance.
- **NFR-P3 [CI]:** Health strip data age ≤ **5s p95** (nominal MVP load).
- **NFR-P4 [CI]:** Night Watch Lite ≤ **2s p95** per step; ≤ **120s** total (≤30 checks).

### Reliability & Availability

- **NFR-R1 [Field]:** Core automation path ≥ **99.5%** monthly uptime (single-server MVP).
- **NFR-R2 [Field]:** **24h WAN-down soak v0:** HVAC, auth, one automation, audit; no silent Google HVAC fallback.
- **NFR-R3 [CI+Field]:** Matter reconnect ≥ **95%** within **60s** (rolling 24h).
- **NFR-R4 [CI]:** Degraded modes fail-closed/read-only per matrix (fault injection).
- **NFR-R5 [Field]:** Fabric restore **RTO ≤30 min**, **RPO ≤24h** (quarterly drill).

### Security (MVP)

- **NFR-S1 [CI+Field]:** TLS 1.2+; mTLS between services when multi-service.
- **NFR-S2 [Field]:** Remote access VPN-only; no inbound admin ports (MVP).
- **NFR-S3 [CI]:** No secrets in audit, events, or CI artifacts.
- **NFR-S4 [CI]:** Default-deny policy; authZ matrix tests per role.
- **NFR-S5 [CI]:** Append-only audit for commands, denials, break-glass, conflicts.
- **NFR-S6 [Field]:** Break-glass ≤ **15 min**, ≤ **10** actions; high-severity audit + alert.
- **NFR-S7 [CI]:** Guest cannot access fabric admin, secrets, or policy config.
- **NFR-S8 [CI]:** No cloud LLM inference in MVP core path.

**Growth / Vision security**

- **NFR-S9 [Growth — Field]:** Documented VLAN segmentation (mgmt / Matter / IoT quarantine / guest) with default-deny inter-VLAN rules.
- **NFR-S10 [Growth — CI+Field]:** Rack workloads default-deny egress; per-service allowlists; alert on first-seen destination.
- **NFR-S11 [Growth — Field]:** Fabric/commissioner keys in sealed storage; time-boxed commissioning; encrypted backups require offline key.
- **NFR-S12 [Growth — CI]:** OAuth cutover disables legacy auth; minimal scopes; redirect URI allowlist enforced in tests.
- **NFR-S13 [Vision — Field]:** Security events replicated to tamper-evident store within 60s.

### Integration

- **NFR-I1 [CI+Field]:** Matter 1.4+; documented thermostat cluster subset.
- **NFR-I2 [CI]:** Google/Nest transition-only; WAN-down tests prove no Google HVAC dependency.
- **NFR-I3 [CI]:** ART-01 coexistence conformance pack v1.0 — 100% pass (FR-H2).
- **NFR-I4 [CI]:** Station API v1 backward compatible one major version.
- **NFR-I5 [CI]:** Event envelope backward compatibility (FR-H3).

### Operational

- **NFR-O1 [Field]:** Fabric backup/restore per runbook (G5).
- **NFR-O2 [Field]:** Greenfield deploy ≤ **60 min** (reference hardware).
- **NFR-O3 [CI]:** Engine/pack version skew rejected at startup.
- **NFR-O4 [CI]:** CI harness report on every merge to main.
- **NFR-O5 [CI]:** SBOM for core services.

### Capacity

- **NFR-CAP1 [CI]:** ≥1 HVAC device, ≥10 automations, ≥3 concurrent operator sessions without SLO breach.

### Privacy & Safety

- **NFR-C1 [Growth]:** On-rack retention tiers configurable.
- **NFR-C2 [CI+Field]:** HVAC respects manufacturer safety limits.
- **NFR-C3 [Field]:** Operator privacy runbooks.

### Web Console (LCARS) — MVP

- **NFR-UX1 [Field]:** LCARS console is usable on current Chrome and Safari within two major versions on desktop and tablet (≥1024px width).
- **NFR-UX2 [CI]:** Primary HVAC control path is operable without pointer-only gestures (keyboard-accessible submit and focus order documented).
- **NFR-UX3 [Field]:** Conflict banner and authority indicator are visible without horizontal scroll at 1280×720.
- **NFR-UX4 [CI+Field]:** Alert condition transition updates banner and layout mode within **1s p95** on web LCARS; Red Alert uses animated-red; Battle Stations uses static-red per UX spec.
- **NFR-UX5 [Field]:** Alert FSM and Ops overview render locally during WAN-down soak without cloud dependency for console shell (subsystem data may stale per coexistence rules).
- **NFR-UX6 [CI]:** Battle Stations confirm gate cannot be disabled via configuration or experience pack; verified in contract tests.

### Verification Linkage

Each NFR maps to CI test ID, field soak checklist item, or operator runbook step in implementation docs.

## Architecture Preview (non-normative)

*Orientation for architects—not normative for MVP acceptance. Detailed design belongs in `architecture.md` when created.*

**MVP delivers hybrid P0 on a rack of one; sovereign capabilities phase per Domain P0–P4.**

| Layer | Responsibility |
|-------|----------------|
| Orchestration engine | State, policy, rituals, audit, registry, alert FSM |
| Experience pack / config | TNG copy, tokens, ritual manifests (config-first MVP) |
| Matter adapter | Commissioner, fabrics, subscriptions |
| Video / Inference adapters | Phased (Growth/Vision) |
| Identity | Local IdP path; Google OAuth transition |
| Station API | Optional `bridge-station` v1 |

**Connectivity:** Matter 1.4+; Thread BR; RTSP→Frigate (Growth); WireGuard/Headscale; REST/WS for LCARS.

**Hardware (north star):** Rack server(s); GPU for LLM+Frigate; ZFS; PoE; UPS; dedicated OTBR.

**Security model:** See [Non-Functional Requirements](#non-functional-requirements) (Security). Zero trust, RBAC, secrets store, break-glass, VLAN/egress at P4.

**APIs:** `/api/v1/*`, `/api/v1/events/stream`, `/api/v1/station/*` (optional).

## Operator Notes (non-normative)

- **Buy now:** Nest Learning Thermostat (4th gen, Matter).
- **Defer:** Lockly until Matter/hub verified; combadge/voice until Growth.
- **Nest Hub:** Thread border router only—not control-plane brain.
- **Dogfood:** 14 days; HVAC via Main Computer as default routine.
- **Basement bridge:** Separate product — `enterprise-bridge/` PRD.
- **OSS contributor work:** After MVP ship and 14-day dogfood (FR-G7).
