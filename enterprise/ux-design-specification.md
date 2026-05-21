---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-core-experience
  - step-04-emotional-response
  - step-05-inspiration
  - step-06-design-system
uxReviewCouncil:
  mandatory: true
  members:
    - Michael Okuda
    - Denise Okuda
    - Gene Roddenberry
    - Captain Jean-Luc Picard
    - Lt. Commander Geordi La Forge
inputDocuments:
  - enterprise/prd.md
  - enterprise/prd-validation-report.md
  - enterprise/matter-research-sources.md
  - enterprise/index.md
  - enterprise/tng-interaction-contract.md
  - enterprise/lcars-screen-inventory.md
  - enterprise/docs/artifacts/README.md
  - enterprise/docs/artifacts/art-01-coexistence-pack-v1.md
  - enterprise/docs/artifacts/art-02-conflict-taxonomy.md
  - enterprise/docs/artifacts/art-03-conflict-resolution-matrix.md
  - enterprise/docs/artifacts/art-04-hybrid-automation-bounds.md
  - enterprise/docs/artifacts/art-05-wan-down-soak-v0.md
  - enterprise/docs/artifacts/art-06-degraded-mode-matrix.md
  - enterprise/docs/artifacts/art-07-soak-reference-automation.md
  - enterprise/docs/artifacts/art-08-alert-condition-matrix.md
productName: ENTERPRISE Main Computer
workflowType: ux-design
uxNorthStar: home_starship_operations_center
okudaAudit: PASS_WITH_CONDITIONS
---

# UX Design Specification — ENTERPRISE Main Computer

**Author:** Onimurasame  
**Date:** 2026-05-18

---

## Executive Summary

### Project Vision

ENTERPRISE Main Computer is a **home starship operations center** — an authentic TNG LCARS shipwide system for a physical **battle bridge** (basement) with the **captain's chair** as the command authority node. The house is the vessel; Matter devices and custom sensors are **crew stations** reporting into one nervous system. The **Captain is the protagonist**.

This is **not** an HVAC control app with LCARS skin. MVP proves the first live station — **Environmental** (Nest Learning Thermostat, 4th gen) — inside a **whole-ship layout** where all departments (Environment, Tactical, Engineering, Science, Ops) appear from day one, with offline stations marked **SENSOR PENDING / OFFLINE** with cross-hatch and activation roadmaps.

**Okuda mandate:** Painfully obvious hierarchy; grid-based asymmetric LCARS; department color logic; **color is information**. Web LCARS and battle bridge console are **renderers** of the same Station API.

**Interaction contract** governs outcomes. **Experience pack** governs LCARS palette, department tokens, alert presentation, ritual copy.

**Alert discipline:** Green enables · Yellow restricts · Red Alert defends · **Battle Stations actuates**. Red Alert = **animated-red**; Battle Stations = **static-red**. Destructive baselines require **Battle Stations confirm gate** (constitutional — non-skippable).

**MVP proof:** Environmental truth loop + alert spine + Ops composited view + G1–G5 + [Starship MVP ACs](./../prd.md#starship-mvp-acceptance). **North star:** Full sensor suite, battle bridge, captain's chair as primary interface.

### Target Users

**Captain:** Ops aggregation default; command authority; hold-to-confirm Red; PIN + hold for Battle Stations stand-down. **Quick Environmental pin (Green only)** for daily comfort without abandoning command hierarchy.

**Crew:** Station-scoped environmental control; lighter routine fiction; no command alert controls; affordance removal when out of scope.

**Guest:** Separate chrome profile — hospitality copy, read-only comfort, session expiry visible; no authority/conflict chrome; alert banner read-only at Yellow+.

**Battle bridge visitors:** Instant Starfleet recognition — consistent typography, corner radius, department palette.

### Key Design Challenges

1. Whole-ship skeleton with OFFLINE/PENDING + roadmaps (not loading screens)  
2. Captain's chair = Ops — Environmental is subsystem drill-down  
3. One organism — stations not separate apps  
4. Alert modes change behavior before palette  
5. Proportional actuation — Battle Stations sub-state  
6. Truth loop on first live Environmental station  
7. Hybrid honesty — `POSTURE: HYBRID` as ship status chrome, not disclaimer  
8. Renderer parity — web + battle bridge same API  
9. Sensor taxonomy Class I–IV  
10. Physical bridge lighting/audio when hardware registers  
11. PRD sequencing vs vision — one device MVP, vessel UX north star  
12. Residential proportionality — prompt-not-auto-Red; guest grace (Growth network)  
13. Baseline transparency — 3s transition interstitial  
14. Night Watch suspends under alert with diegetic copy  
15. P0 keyboard path — HVAC subsystem + conflict reconcile  
16. Reverse-path discipline — alert spine + Environmental before hardware actuation  

### Design Opportunities

1. Authentic LCARS information design at battle bridge viewing distance  
2. Battle bridge as crisis command — compact Ops within chair reach  
3. Station model navigation  
4. Progressive station activation OFFLINE → PENDING → NOMINAL  
5. Alert-driven immersion (palette + optional physical effects)  
6. Red Alert vs Battle Stations as authentic TNG graduation  
7. Quick Environmental (Green) — daily loop without thermostat-app identity  
8. Grammar + chroma portable to voice/combadge  
9. Experience pack as ship computer soul  
10. Scene One — Nest as first Environmental station inside a vessel  
11. Pending baseline queue — auditable until stations register  
12. Plain-theme contract test  

### Alert Condition Model (summary)

Canonical detail: [ART-08](./docs/artifacts/art-08-alert-condition-matrix.md).

| Level | Baseline character | Configurable scope |
|-------|-------------------|-------------------|
| Green | Normal poll, schedules, coexistence | Full |
| Yellow | Tighter poll, event block, suspend non-critical; no destructive | Medium |
| Red Alert | Forensic audit, safe band, animated-red layout | Narrow |
| Battle Stations | Confirm gate + destructive queue (PENDING until hardware) | Minimal |

### Okuda Authenticity Audit (2026-05-18)

**Verdict:** PASS WITH CONDITIONS (Michael Okuda + Denise Okuda)

**Conditions applied in this spec:**

1. Default landing = `ops.overview` (not Environmental subsystem)  
2. Hybrid Mode badge = ship status chrome  
3. Guest = affordance removal, not disabled tease  
4. Animated-red vs static-red documented in motion rules  
5. OFFLINE tiles = cross-hatch + roadmap, never generic placeholder  

---

## Ops Overview — Bridge at a Glance (`ops.overview`)

**Hero screen.** First wireframe. Default route after auth/onboarding.

**Viewport:** ≥1024px; alert banner visible at 1280×720 (NFR-UX3).

### LCARS grid

```
┌─────────────────────────────────────────────────────────┐
│ [ALERT BANNER 32px — hidden Green; amber Y; red R/BS]   │
├──────────┬──────────────────────────────┬───────────────┤
│ LEFT ARC │         CENTER STACK         │  RIGHT ARC    │
│  (18%)   │           (52%)              │   (18%)       │
│ Dept     │  Vessel Status + Dept Summary│  Sensor       │
│ bars     │  5 station tiles (2×2 + Ops) │  Summary      │
│          │  Active Alerts feed          │  Power/Eng    │
│          │  [Quick Env pin — Green only]│  bars         │
├──────────┴──────────────────────────────┴───────────────┤
│ COMMAND LINE (outcome + Escalate)          │ HEALTH (12%)│
└─────────────────────────────────────────────────────────┘
```

### Vessel status chrome

- Alert condition (Green/Yellow/Red/Battle Stations)  
- Site name / vessel designation  
- **`POSTURE: HYBRID · EXTERNAL CONTROLLER ACTIVE`** when applicable  
- Local time, uptime  

### Department tiles

Environment · Tactical · Engineering · Science · Ops — states: NOMINAL / ADVISORY / OFFLINE / CONFLICT. OFFLINE = cross-hatch + roadmap one-liner.

### Alert visual law

| Level | Banner | Motion |
|-------|--------|--------|
| Green | Hidden | None |
| Yellow | Amber | Slow edge pulse |
| Red Alert | Crimson | **Animated-red** breathing |
| Battle Stations | Crimson + label | **Static-red** hold |

### Quick Environmental pin (Green only)

≤15% center width. Shows ship mean temp + expand to `env.subsystem`. Hidden or read-only at Yellow+.

### Tap targets

| Target | Destination |
|--------|-------------|
| Environment tile | `env.subsystem` |
| Tactical / Engineering / Science | Station detail or PENDING explainer |
| Alert row | `ops.conflict` / diagnostics |
| Escalate | Level-appropriate hold/confirm |
| Quick Env pin | Inline expand or drawer |

### Motion and audio (P0)

- Yellow entry: optional single chime (web or bridge)  
- Red Alert: 3-cycle klaxon burst → silence when audio available  
- Battle Stations: static-red; siren PENDING until hardware  

---

## Environmental Subsystem Panel (`env.subsystem`)

Drill-down from Environment tile or Quick Env pin. **Not default landing.**

**Labels:** Environmental Control — [Deck/Zone]. Avoid vendor product names on chrome.

**Shows:** Setpoint, mode, humidity, authority, conflict, pending state, last command.

**Ops must NOT show:** Setpoint steppers, commissioning wizards.

---

## UX / PRD phasing (summary)

| Capability | MVP P0 | Growth P1 | Vision P2+ |
|------------|--------|-----------|------------|
| Whole-ship skeleton | All dept tiles; Environment live | Multi-zone Env; first Tactical | All departments live |
| Alert FSM | Full FSM web; Env baselines | Zone propagation; audio | Physical alert panel |
| Battle bridge physical | Web renderer acceptable | Wall display | Basement battle bridge |
| Battle Stations actuation | Confirm gate; PENDING destructive | Locks, lighting | Full actuation |

Full table: [PRD Project Scoping](./../prd.md#ux--alert-phasing).

---

## UX Review Council (mandatory)

**Policy:** All ENTERPRISE UX decisions — wireframes, flows, copy, motion, alert behavior, screen inventory changes — require review by the **UX Review Council**. The Okudas are **always present**. Party Mode, elicitation, and spec amendments must include this roster unless the operator explicitly waives a member for a scoped decision (logged in spec revision notes).

| Authority | Lens | UX veto domain |
|-----------|------|----------------|
| **Gene Roddenberry** | Vision | User-friendly = **clear organization of complicated information**; humanity in technology; no dystopian automation |
| **Michael Okuda** | LCARS information design | Grid hierarchy, alert-as-behavior, whole-ship skeleton, constitutional confirm gate |
| **Denise Okuda** | Production / experiential continuity | Department palette, cross-hatch OFFLINE, animated-red vs static-red, battle bridge recognition |
| **Captain Jean-Luc Picard** | Command authority | Captain chooses; escalation ethics; dignity under alert; no trap states; Incident Summary as command closure |
| **Lt. Commander Geordi La Forge** | Engineering truth | Interfaces match system state; diagnostics honest; PENDING ≠ broken; accessibility of critical paths |

**Sign-off format for UX spec sections:** `Council: [names] — PASS | PASS WITH CONDITIONS | BLOCKED`

**Okuda audit (Step 02):** PASS WITH CONDITIONS — conditions applied in this document.

---

## Core User Experience

### Defining Experience

The core loop is **command from Ops**: the Captain opens the bridge, reads vessel status at a glance, and acts — escalate alert, drill into a department, or (Green only) adjust Environmental via Quick pin.

**Council synthesis:**

- **Roddenberry:** The product succeeds when complicated home systems appear **organized and learnable** — not simplified into a toy.  
- **Picard:** The Captain **commands**; the Computer ** advises and executes** after consent at Battle Stations.  
- **La Forge:** Every panel must reflect **actual system state** — if Engineering is OFFLINE, say so plainly with a path to fix.  
- **Okudas:** Ops overview is home; LCARS grammar is non-negotiable.

**Core action hierarchy:**

1. **Scan** — Ops overview + alert condition  
2. **Command** — Escalate/de-escalate, subsystem control, conflict reconcile  
3. **Confirm** — Working → Acknowledged; Battle Stations confirm gate  

### Platform Strategy

- **P0:** Web LCARS ≥1024px; keyboard paths for Environmental subsystem, conflict, alert ACK  
- **North star:** Battle bridge = same Station API renderer  
- **WAN-down:** Alert shell + Ops layout local (NFR-UX5)  
- **La Forge:** Diagnostic drill-down always reachable from health strip and Unable to comply  

### Effortless Interactions

- Quick Environmental pin (Green) — daily comfort without losing Ops context  
- Hold-to-confirm Red; Battle Stations interstitial — **Picard:** deliberate command under pressure  
- Authority indicator at Yellow+ — **Roddenberry:** honest coexistence, not false sovereignty  
- QUERY TRIGGER on false Yellow — **La Forge:** show the sensor chain  
- OFFLINE roadmaps — **Denise:** vessel incomplete but **real**  

### Critical Success Moments

| Moment | Success signal | Council owner |
|--------|----------------|---------------|
| First bridge view | Whole-ship skeleton; Environment NOMINAL | Okudas |
| First Acknowledged setpoint | Subsystem panel; wall unit ≤15s | La Forge |
| First Red Alert | Layout ≤3s; safe band; AC-S1 | Picard + Michael Okuda |
| Battle Stations | Static-red; Captain confirmed | Picard |
| 14-day dogfood | Ops is home | Roddenberry |

### Experience Principles

1. **Ship first, subsystem second** (Okudas)  
2. **Behavior before palette** (Michael Okuda)  
3. **Proportional actuation** — Red Alert aware; Battle Stations commits (Picard + Roddenberry)  
4. **Diegetic truth** (La Forge + contract)  
5. **Whole vessel always** (Denise Okuda)  
6. **Constitutional confirm** — Battle Stations gate non-skippable (Picard)  
7. **One renderer, many surfaces** (La Forge)  
8. **Dignity in denial** — clearance messages, not scolding (Roddenberry)  

**Council sign-off (Step 03):** Michael Okuda, Denise Okuda, Gene Roddenberry, Captain Picard, Lt. Commander La Forge — **PASS**

---

## Desired Emotional Response

### Primary emotional goals

| Emotion | When | Authority |
|---------|------|-----------|
| **Command competence** | Green — Ops | Roddenberry, Picard |
| **Organized capability** | Learning whole-ship skeleton | Roddenberry |
| **Calm focus** | Yellow Alert | Picard, Michael Okuda |
| **Lived urgency** | Red Alert (animated-red) | Okudas |
| **Resolved commitment** | Battle Stations (static-red) | Picard, Denise |
| **Partnership in failure** | Unable to comply + diagnostics | La Forge |
| **Living ship** | Quick Env anchor (Green); read-only strip (Yellow+) | Denise |
| **Relief at truth** | Conflict reconcile — device as tiebreaker | La Forge, Picard |
| **Closure** | Incident Summary stand-down | Picard |

**Roddenberry principle (non-negotiable):** The operator must always feel like the **Captain — never a passenger.** Automation visible, legible, revocable.

### Never create

Helplessness (HAL); false Done; silent PENDING; performative panic (exclamation marks, spinners under Yellow+); bureaucratic dismissal; cosplay skeleton without roadmaps; cry-wolf Yellow; shame-styled Hybrid badge; mid-flow Night Watch cut.

### Clearance-tier emotional depth (Picard)

| Persona | Same alert, different depth |
|---------|----------------------------|
| **Captain** | Full context + command affordances |
| **Crew** | Crisp readiness — act, don't decide for the ship |
| **Guest (Quarters)** | Calm orientation — stay clear, no jargon, no dual-controller noise |

### Environmental emotional flow (La Forge + Debate DB-1)

**Acknowledged → Adjusting → Verified** — one compact status line morphing, not three dialogs. Primary emotional peak: `Verified. [Deck] [parameter] stable.`

### Alert-level feelings

| Level | Feel | Motion / audio |
|-------|------|----------------|
| **Green** | Calm command | None; Quick Env pin |
| **Yellow** | Focus — facts, not anxiety | Amber pulse; 15s sampling band before entry |
| **Red Alert** | Urgent clarity | Animated-red; klaxon 3× → silence; status lines not spinners |
| **Battle Stations** | Chosen weight | Static-red; confirm interstitial |

### Micro-emotions (outcome types)

| Outcome | Emotion |
|---------|---------|
| Acknowledged | Heard — command accepted |
| Adjusting | Patient trust — actuators in motion |
| Verified | Relief + trust — primary success feeling |
| Warning | Focus — information |
| Denied | Redirect — clearance + path forward |
| Unable to comply | Supported — never alone |

**Guest denial (Picard):** `Clearance required for this section. Contact the duty officer or return to assigned quarters.`

### PENDING / OFFLINE (La Forge)

Micro-states: **Initializing → Sampling → Verifying**. Commissioner disconnect: hold last state, dim, timestamp + next update. Health strip encodes freshness — stale green labeled honestly.

### Hybrid / Google coexistence

Neutral `POSTURE: HYBRID · EXTERNAL CONTROLLER ACTIVE` chrome. Distinct external-controller voice in experience pack. Reconcile emotion: relief — device truth ends the argument.

### Night Watch Lite

Intercept before start. Suspend under Yellow+: `Night Watch suspended. Alert condition takes precedence.`

### Incident Summary

Mandatory ≤4 lines, past tense. Example: `Alert concluded. Duration 12 minutes. Environmental safe band released. All primary stations nominal.`

### Emotional trust pre-mortem (ET-1–ET-13)

Verified only Done; freshness on green; report don't spin; PENDING moves; external voice distinct; confirm ceremony; intercept before fiction; denial redirects; alert audio ends; stand-down exhale; hybrid not apology; Yellow earned; depth matches clearance.

### Matrix-selected decisions (normative)

3-phase Environmental flow; status lines under Yellow+; neutral Hybrid badge; Night Watch suspend; Quick Env read-only at Yellow+; Picard denial redirect; mandatory Incident Summary; distinct external voice; 15s sampling before Yellow; Quarters guest profile.

### Dogfood emotional acceptance

See PRD [Starship MVP Acceptance](./../prd.md#starship-mvp-acceptance) AC-E1–E5.

**Council sign-off (Step 04):** Michael Okuda, Denise Okuda, Gene Roddenberry, Captain Jean-Luc Picard, Lt. Commander La Forge — **PASS**

---

## UX Pattern Analysis & Inspiration

### Inspiring products analysis

| Source | What works | ENTERPRISE adaptation |
|--------|------------|------------------------|
| **TNG LCARS (Okuda canon)** | Grid hierarchy, color-as-information, alert behavior before palette | Normative — experience pack + ART-08; not a third-party skin |
| **NASA / mission control** | Status-first displays; explicit GO/NO-GO; call-and-response | `ops.overview` + Acknowledged → Adjusting → Verified + Incident Summary |
| **Aviation glass cockpit** | Primary flight display vs subsystem MFDs | Ops hero vs `env.subsystem` drill-down |
| **Industrial SCADA (selective)** | Timestamped alarms; stale-data indication | La Forge health strip + PENDING micro-states |

**Not inspiration (anti-reference):** Generic smart-home tiles, Google Home cards, Home Assistant default dashboards — thermostat-app identity we reject (PRD explicit non-goal).

### Transferable UX patterns

**Navigation:** Status-first command surface (Ops) → department drill-down — not device-list home.

**Interaction:** Call-and-response grammar; hold-to-confirm for Red/Battle Stations; QUERY TRIGGER before Yellow; status lines not spinners under Yellow+.

**Visual:** Asymmetric LCARS grid; animated-red vs static-red; cross-hatch OFFLINE; neutral Hybrid badge.

**Error:** Diegetic Unable to comply with timestamp + next update — never toast-only.

### Anti-patterns to avoid

Thermostat-as-home-screen; spinner under alert; disabled-button guest UI; "Access denied" copy; silent PENDING tiles; indistinguishable Google vs Computer chrome; Night Watch fiction during alert; sovereign cosplay in Hybrid Mode; HA entity-card layout as primary IA.

### Design inspiration strategy

**Adopt:** Okuda LCARS grid law + mission-control status hierarchy + La Forge timestamp discipline.

**Adapt:** SCADA alarm density → sparse TNG brevity at Red; aviation MFD → web tablet ≥1024px (NFR-UX1).

**Avoid:** Consumer IoT onboarding wizards as emotional home; infinite dashboard widgets; Material/Ant Design as visual foundation.

---

## State of the Art Review (May 2026)

**Objective:** Separate **supporting libraries** (integrate) from **product DNA** (build). Review date: **2026-05-19**. Sources: CSA/Matter 1.5.1, Matter Survey, Open Home Foundation matterjs-server track, npm/PyPI ecosystems, PRD architecture preview.

### Review methodology

Each layer scored:

| Verdict | Meaning |
|---------|---------|
| **INTEGRATE** | Mature library or sidecar; wrap behind adapter; do not fork UI |
| **REFERENCE** | Study patterns/tokens; do not depend in production |
| **BUILD** | No acceptable drop-in; core differentiator or Okuda mandate |
| **DEFER** | Growth/Vision; not MVP acceptance |

### Layer 1 — LCARS visual system (web + bridge renderers)

| Option | Status (May 2026) | Verdict | Notes |
|--------|-------------------|---------|-------|
| **Okuda experience pack (custom)** | N/A — product-owned | **BUILD** | Department tokens, alert visual law, clearance chrome, Ops grid — Okuda audit requires full control |
| **@starfleet-technology/lcars-react** (v0.0.3) | Early; ~negligible adoption; Stencil web components | **REFERENCE** | Buttons/chrome only; no alert FSM layout, no station skeleton, no clearance tiers |
| **lcars-ui.com** | Site shows "Please Stand By" | **REFERENCE** | Not production-ready |
| **joernweissenborn/lcars** (CSS) | Last meaningful update ~2021; v1.0.0-beta | **REFERENCE** | Layout ideas; stale; no React/alert modes |
| **louh/lcars** | HTML/CSS/JS responsive layout | **REFERENCE** | ~224★; good elbow geometry reference |
| **@withstudiocms/lcars-stylus** (v1.1.0, Mar 2026) | CSS/Stylus tokens + Astro | **REFERENCE** | Color curves and radii; port tokens into experience pack |
| **Material / Chakra / shadcn** | Production-grade a11y | **DO NOT ADOPT** as visual foundation | Conflicts with Okuda mandate; optional headless primitives only if hidden |

**Conclusion:** **100% custom LCARS component library** under experience pack. External LCARS npm packages are **reference material only**, not dependencies.

### Layer 2 — Web console application shell

| Option | Verdict | Notes |
|--------|---------|-------|
| **React 18+ / TypeScript 5+** | **INTEGRATE** | Aligns with LCARS ecosystem, XState React, a11y tooling; PRD MVP surface `web_lcars_console` |
| **Vite / Next (static export)** | **INTEGRATE** | SPA or SSG; no SSR requirement for LAN console |
| **TanStack Query** | **INTEGRATE** | REST snapshot + cache; pair with WS for events |
| **Radix / React Aria (headless)** | **INTEGRATE (selective)** | NFR-UX2 keyboard/focus — use headless, LCARS-styled |
| **hass-react / HA Lovelace patterns** | **AVOID** | Entity-card mental model; PRD rejects HA dashboard as primary UI |

**Conclusion:** Standard React TS stack + headless a11y — **integrate**. All LCARS visuals and IA — **build**.

### Layer 3 — Real-time transport (Station API)

| Option | Verdict | Notes |
|--------|---------|-------|
| **WebSocket event stream** (`/api/v1/events/stream`) | **BUILD** (contract) | Product-owned envelope (FR-H3); library-agnostic |
| **react-use-websocket / native WS** | **INTEGRATE** | Connection lifecycle only |
| **SSE** | **REFERENCE** | Fallback if WS blocked; not primary |
| **MQTT (internal bus)** | **DEFER** | Optional engine-internal; not LCARS-facing |

**Conclusion:** **Build** Station API + event schema. **Integrate** thin WS client.

### Layer 4 — Alert FSM & ritual orchestration

| Option | Verdict | Notes |
|--------|---------|-------|
| **Custom alert FSM** (Green/Yellow/Red/Battle Stations) | **BUILD** | ART-08 baselines, Battle Stations non-skippable gate (NFR-UX6), clearance-aware behavior |
| **XState v5** (~5.31.x, May 2026) | **INTEGRATE** | Machine definition + tests; map snapshots to LCARS layout modes |
| **Generic rules engines (json-rules-engine)** | **REFERENCE** | Automation bounds (ART-04), not alert FSM |

**Conclusion:** **Build** alert semantics; **integrate XState** as FSM engine if implementation language is TS — not a UX shortcut.

### Layer 5 — Matter device plane

| Option | Status (May 2026) | Verdict | Notes |
|--------|-------------------|---------|-------|
| **connectedhomeip (C++ SDK)** | Matter **1.5.1** spec; CSA reference | **INTEGRATE (via wrapper)** | Underpins all controllers; do not expose raw to UI |
| **python-matter-server** (v8.1.x) | Maintenance mode; CSA-certified HA path | **INTEGRATE (MVP option A)** | Stable WebSocket API; 68k+ PyPI downloads/mo; wrap as Matter adapter |
| **matterjs-server** + **@matter/main** | Alpha/beta; HA 8.2+ beta toggle (Jan 2026); Matter 1.4.2 | **INTEGRATE (MVP option B — preferred trajectory)** | Open Home Foundation; replacing Python server; monitor CSA re-cert |
| **chip-tool / Python CHIP REPL** | Dev controllers | **DEV ONLY** | Commissioning debug, CI harness |
| **Home Assistant Core** | Mature | **DO NOT ADOPT** as product core | Use Matter *server* optionally; never HA UI/entity model as primary |
| **Nest 4th gen (MVP device)** | CSA cert Oct 2025; ~36% Thermostat cluster optional features | **INTEGRATE (device)** | Sufficient for setpoint/mode MVP; no schedules/fan via Matter — document gaps |

**MVP adapter decision (pick one, abstract behind interface):**

1. **Conservative:** python-matter-server sidecar — proven, certified, maintenance-only acceptable for P0 soak.  
2. **Forward-looking:** matterjs-server — align with OHF roadmap; require beta soak before G1/G2 sign-off.

**Conclusion:** **Build** orchestration engine + cluster→department mapping + conflict layer (ART-02/03). **Integrate** Matter controller **server** as subprocess — **do not build** a from-scratch Matter stack.

### Layer 6 — Identity, clearance, RBAC

| Option | Verdict | Notes |
|--------|---------|-------|
| **Local session + clearance tiers** (Captain/Crew/Guest) | **BUILD (MVP)** | FR19–22; Picard denial copy; not OIDC-shaped |
| **Authentik / Zitadel** | **DEFER (Growth OAuth)** | NFR-S12; Google OAuth transition — external IdP adapter |
| **Matter fabric ACL** | **INTEGRATE (device plane)** | Separate from app clearance UX |

**Conclusion:** **Build** clearance model for MVP. **Integrate** IdP when OAuth phase lands.

### Layer 7 — Experience pack & config slots

| Option | Verdict | Notes |
|--------|---------|-------|
| **JSON/YAML pack manifest** (tokens, copy, audio refs, ritual scripts) | **BUILD** | PRD customization model; NFR-O3 version skew rejection |
| **CSS variables / design tokens pipeline** | **BUILD** | Sourced from Okuda spec; lcars-stylus as reference only |
| **i18n framework (formatjs)** | **DEFER** | English bridge copy MVP |

**Conclusion:** Entirely **build** — this is the product's swappable face.

### Layer 8 — Automation, scenes, Night Watch Lite

| Option | Verdict | Notes |
|--------|---------|-------|
| **Night Watch Lite scheduler** | **BUILD** | FR26–27; alert intercept/suspend |
| **Matter Enhanced Scenes (1.4+)** | **INTEGRATE (device)** | Scene storage on controller; map to ship rituals |
| **Node-RED / HA automations** | **AVOID** | Wrong abstraction for TNG grammar |

**Conclusion:** **Build** ritual/automation policy layer; **integrate** Matter scene primitives where spec covers device types.

### Layer 9 — Audio, voice, combadge (Growth / Vision)

| Option | Verdict | Notes |
|--------|---------|-------|
| **Klaxon / alert audio assets** | **BUILD** (pack) | 3× Red Alert then silence — experience pack |
| **Whisper / Piper / local LLM** | **DEFER** | Voice Computer — not MVP |
| **Matter 1.5 chime/intercom** | **DEFER** | Tactical/combadge adjacency |

### Layer 10 — Physical battle bridge renderer

| Option | Verdict | Notes |
|--------|---------|-------|
| **Station API v1** | **BUILD** | Same snapshot/events as web LCARS |
| **bridge-station adapter** | **BUILD (Growth)** | Optional `enterprise-bridge/` integration |
| **Kiosk shell (Electron / Chromium)** | **INTEGRATE** | Display-only wrapper |

**Conclusion:** Web LCARS is first renderer; physical bridge is **second consumer of same API** — not a separate app.

---

### Build vs integrate summary (MVP P0)

```text
┌─────────────────────────────────────────────────────────────┐
│  BUILD (product DNA)                                        │
│  • Okuda LCARS component library + experience pack          │
│  • Ops overview / station skeleton / clearance chrome       │
│  • TNG interaction contract copy layer                        │
│  • Orchestration engine (policy, audit, conflict, health)   │
│  • Alert FSM semantics + Battle Stations gate               │
│  • Station API REST + WS event envelope                     │
│  • Night Watch Lite + hybrid coexistence UX (ART-01)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  INTEGRATE (supporting libraries / sidecars)                │
│  • matterjs-server OR python-matter-server (Matter adapter) │
│  • connectedhomeip (transitive — do not fork)               │
│  • React + TS + Vite + headless a11y                        │
│  • XState (FSM engine) · TanStack Query · WS client         │
│  • Zod (schema validation) · Vitest/Playwright (CI)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  REFERENCE ONLY (no production dependency)                  │
│  • joernweissenborn/lcars · louh/lcars · lcars-stylus       │
│  • @starfleet-technology/lcars-* · lcars-ui.com             │
└─────────────────────────────────────────────────────────────┘
```

### Risk register (library choices)

| Risk | Impact | Mitigation |
|------|--------|------------|
| matterjs-server beta instability | G1/G2 soak fail | Abstract Matter adapter; default python-matter-server until matterjs-server passes ART-05 |
| matter.js not CSA-certified | Compliance narrative | Product is controller UX + orchestration; use certified server path for MVP marketing |
| LCARS npm immaturity | Visual debt | Custom design system (Step 06); zero dependency on v0.0.x packages |
| Nest partial Thermostat cluster | Feature gap | MVP scope = setpoint/mode only; surface unsupported optional clusters honestly |
| Matter spec churn (2×/yr minors) | Adapter drift | Pin supported Matter version; modular cluster handlers per matter-research-sources §8 |
| HA ecosystem gravity | Wrong IA | Never import HA frontend; Matter server API only |

### Recommended MVP stack posture (non-normative)

Pending `architecture.md`, UX-aligned implementation default:

| Tier | Choice |
|------|--------|
| **UI** | React 18 + TypeScript + custom Okuda design system |
| **FSM** | XState v5 for alert + ritual states |
| **API** | REST snapshot + WebSocket events (Station API v1) |
| **Matter** | matterjs-server (beta soak) with python-matter-server fallback |
| **Device MVP** | Nest Learning Thermostat 4th gen via Thermostat cluster subset |
| **Identity** | Built-in clearance sessions (OAuth adapter stub for Growth) |

**Council sign-off (Step 05):** Michael Okuda, Denise Okuda, Gene Roddenberry, Captain Jean-Luc Picard, Lt. Commander Geordi La Forge — **PASS** (custom LCARS confirmed; Matter server integrate-not-fork; HA UI rejected)

---

## Design System Foundation

### Design system choice

**Custom Okuda LCARS Design System** — product-owned component library under experience pack.

**Headless accessibility only:** Radix/React Aria for keyboard, focus, and ARIA semantics — all default visual styles explicitly zeroed; LCARS tokens govern appearance.

**Rejected as visual foundation:** Material, Chakra, shadcn; LCARS npm packages as production dependencies (reference-only per SOTA review).

### Rationale

- Okuda audit requires full control of grid, alert visual law, department color-as-information
- npm LCARS libraries (v0.0.x, stale CSS) — geometry and color-curve reference only
- Headless layer satisfies NFR-UX2 without leaking browser-form chrome
- Roddenberry: custom identity serves Captain-not-passenger; MVP scope locked to first operational station
- Picard + Roddenberry hybrid CI gate balances command dignity with solo-builder velocity

### Implementation approach

**Five layers:**

1. **Tokens** — experience pack manifest with `schemaVersion`; semantic role on every color token (department | alert | system); motion tokens for animated-red vs static-red; `--operator-tier` (captain | crew | guest) for tap targets and corner radii; department palette swap at token layer only; `gamutProfile: srgb-mvp` with `bridge-led-v1` reserved (promotion criteria before bridge hardware integration); screen inventory IDs bound to token namespace
2. **Primitives** — elbows with minimum taper ratios on `ButtonElbow` (full geometry catalog Growth); bars, pills, status lines, data readouts; portability flags (`web | bridge | both`)
3. **Composites** — `AlertBanner`, `HealthStrip` (staleness via FSM guard, not CSS toggle), `ClearanceOverlay`, `BattleStationsConfirm`, Hybrid posture badge
4. **Screens** — mapped to [lcars-screen-inventory.md](./lcars-screen-inventory.md) IDs in token namespace
5. **Renderer contract** — web LCARS + future battle bridge consume same token/composite API; parity contract tests

**MVP component inventory (12):**

| Component | Layer | Sprint |
|-----------|-------|--------|
| `LcarsPanel` | Primitive | 1 |
| `AlertBanner` | Composite | 1 |
| `BattleStationsConfirm` | Composite | 1 (early graduate) |
| `ClearanceOverlay` | Composite | 1 (early graduate) |
| `LcarsBar` | Primitive | 2 |
| `StatusIndicator` | Primitive | 2 |
| `HealthStrip` | Composite | 2 |
| `DataReadout` | Primitive | 2 |
| `ButtonElbow` | Primitive | 2 |
| `SystemLabel` | Primitive | 2 |
| `SubsystemGrid` | Composite | 2 |
| `ConnectionBadge` | Composite | 2 |

**Phased delivery (La Forge):** Sprint 1 — tokens + renderer contract + four components above marked sprint 1; sprint 2 completes Environmental + Ops surfaces.

### Headless integration gate (A′+B′+ — Council hybrid)

| Surface | Rule |
|---------|------|
| **Shared library** (primitives + composites) | Zero Radix/React Aria visual leakage — CI blocks merge to `main` |
| **Early graduates** | `BattleStationsConfirm`, `ClearanceOverlay` enter shared library sprint 1 |
| **Feature-flagged routes on `main`** | Flag off by default; inline wrappers only (eslint import allowlist); no new shared exports; automated Playwright screenshot diff on **all flag-on states × 1280×720 + tablet breakpoints** every PR |
| **Scaffold TTL** | Auto-created cleanup story; CI **blocks merge** if flag remains after due date or story closed without flag removal |
| **Operator routes** (dogfood / G3) | Unflagged only after full zero-leak audit |
| **Sprint open** | Screen-classification table: `feature-flagged` vs `operator-facing` — reviewed at sprint open |

### Customization strategy

Experience pack owns palette, department accents, ritual copy, alert audio, motion curves. Engine rejects pack/engine version skew (NFR-O3). Reference joernweissenborn/lcars and lcars-stylus for color curves only — never import. `gamutProfile` travels with certificate artifact at freeze time (Denise — Step 07 gate if missing).

**Council sign-off (Step 06):** Michael Okuda, Denise Okuda, Gene Roddenberry, Captain Jean-Luc Picard, Lt. Commander Geordi La Forge — **PASS WITH CONDITIONS** (phased delivery; gamut promotion criteria; certificate fixture coupling)

---

## References

- [lcars-screen-inventory.md](./lcars-screen-inventory.md)  
- [tng-interaction-contract.md](./tng-interaction-contract.md)  
- [ART-08 Alert Condition Matrix](./docs/artifacts/art-08-alert-condition-matrix.md)  
- [index.md](./index.md)
