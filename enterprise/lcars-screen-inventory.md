# LCARS Screen Inventory — ENTERPRISE Main Computer (MVP)

**Status:** Normative information architecture for web LCARS console (P0)  
**Author:** Onimurasame  
**Date:** 2026-05-18 (updated per Okuda audit + UX spec Step 02)  
**Implements:** PRD MVP surfaces (`web_lcars_console`), FR13–FR17, FR44–FR52, FR29, FR33, FR36–FR39; NFR-UX1–UX6  
**Companion:** [tng-interaction-contract.md](./tng-interaction-contract.md), [ux-design-specification.md](./ux-design-specification.md)

---

## 1. Purpose

Maps **user journeys and FRs** to **screens and chrome** for the MVP LCARS web console. **Default experience is ship operations**, not a thermostat app.

**Hero screen:** `ops.overview` — Bridge at a Glance.  
**MVP live station:** Environmental — Nest Learning Thermostat (4th gen) via `env.subsystem`.  
**Viewport:** Desktop/tablet ≥1024px (NFR-UX1); alert banner at 1280×720 without horizontal scroll (NFR-UX3).

---

## 2. Global chrome (persistent)

| Element | ID | FR / NFR | Description |
|---------|-----|----------|-------------|
| **Alert banner** | `chrome.alert` | FR44–FR47, NFR-UX4 | 32px top; hidden Green; amber Yellow; crimson Red/Battle Stations |
| **Health strip** | `chrome.health` | FR33, NFR-P3 | Control path, last sync, last error |
| **Session / clearance** | `chrome.session` | FR19–FR20 | Operator + clearance label |
| **Vessel status** | `chrome.vessel` | FR48, FR29 | Alert condition, site name, **`POSTURE: HYBRID`** ship-status chrome |
| **Primary nav** | `chrome.nav` | FR48 | **Stations:** Ops, Environment, Tactical, Engineering, Science, Operations (soak/audit) |
| **Authority indicator** | `chrome.authority` | FR7, NFR-UX3 | Main Computer / Google Home / Conflict — intensified at Yellow+ |
| **Conflict banner** | `chrome.conflict` | FR16–FR17, FR10 | When ART-02 class active |
| **Command line** | `chrome.outcome` | FR15 | Last outcome + Escalate affordance |

**Keyboard (NFR-UX2):** Subsystem Environmental submit, conflict reconcile, alert acknowledge — documented P0 path.

---

## 3. Screen catalog

### 3.1 Authentication and session

| Screen | ID | Journeys | FRs | Notes |
|--------|-----|----------|-----|-------|
| Sign-in (hybrid transition) | `auth.signin` | 0, 1 | FR18 | Google OAuth transition |
| Guest session handoff | `auth.guest` | 4 | FR19 | Quarters profile — separate chrome |

---

### 3.2 Ops — Command (hero)

| Screen | ID | Journeys | FRs | Notes |
|--------|-----|----------|-----|-------|
| **Bridge at a Glance** | `ops.overview` | All | FR48–FR52 | **Default landing**; dept tiles; Quick Env pin (Green); wireframe in UX spec |
| Alert transition interstitial | `ops.alert.interstitial` | — | FR45, FR51 | 3s baseline action list incl. PENDING/skipped |
| Alert acknowledge / escalate | `ops.alert.control` | — | FR44–FR47 | Hold-to-confirm Red; Battle Stations confirm |
| Incident Summary | `ops.alert.summary` | — | FR47 | Required after Battle Stations stand-down |
| Automatic responses (read-only) | `ops.alert.baselines` | — | FR49 | Locked baseline list per level |
| Alert automation editor | `ops.alert.rules` | — | FR50 | Configurable rules + `validAt` level pills |

---

### 3.3 Onboarding and commissioning

| Screen | ID | Journeys | FRs | Notes |
|--------|-----|----------|-----|-------|
| Welcome / site detect | `onboard.welcome` | 0, 1 | FR38 | Detect Google Home |
| Hybrid Mode acknowledgment | `onboard.hybrid` | 0, 1 | FR29 | Ship-status posture copy |
| Thread BR prerequisite | `onboard.thread` | 0, 1, F3 | FR38 | Block if BR offline |
| Multi-admin commission | `onboard.commission` | 0, 1 | FR1, FR6 | Thermostat scope |
| Commission recovery | `onboard.recovery` | F2 | FR39, FR11 | Rollback |
| Onboarding complete | `onboard.done` | 0 | FR38 | Route to **`ops.overview`** |

**Flow:** `onboard.welcome` → `onboard.hybrid` → (`onboard.thread`) → `onboard.commission` → `onboard.done` → **`ops.overview`**

---

### 3.4 Environmental subsystem (drill-down)

| Screen | ID | Journeys | FRs | Notes |
|--------|-----|----------|-----|-------|
| Environmental Control panel | `env.subsystem` | 0, 1, 3, 6 | FR2–FR4, FR13–FR15 | **Subsystem panel** — not default landing; deck/zones labels |
| Command pending | `env.subsystem.pending` | 0, 3 | FR3–FR4, NFR-P2 | Working → Acknowledged |
| Hybrid bounds block | `env.subsystem.bounds` | — | FR30–FR31 | ART-04 |
| Unable to comply (inline) | `env.subsystem.error` | 3 | FR4 | Diegetic failure |

**Crew:** Same panel with Environmental clearance.  
**Guest:** Read-only profile — **controls removed**, not disabled; hospitality copy.

*Legacy ID `env.hvac` deprecated → `env.subsystem`.*

---

### 3.5 Conflict and coexistence

| Screen | ID | Journeys | FRs | Notes |
|--------|-----|----------|-----|-------|
| Conflict reconcile | `ops.conflict` | 5 | FR8–FR10, FR16 | Reconcile panel |
| Coexistence diagnostics | `ops.diagnostics` | 1, 5 | FR17 | Stale/dual command |
| Authority history | `ops.authority-log` | 5 | FR12 | Audit subset |

---

### 3.6 Rituals

| Screen | ID | Journeys | FRs | Notes |
|--------|-----|----------|-----|-------|
| Night Watch Lite | `ritual.nightwatch-lite` | 2 | FR26–FR27 | Suspends under Yellow+ alert |
| Night Watch prefs | `ritual.nightwatch-lite.prefs` | 2 | FR26 | Skip / auto-run opt-in |

---

### 3.7 Operations and observability

| Screen | ID | Journeys | FRs | Notes |
|--------|-----|----------|-----|-------|
| Audit log | `ops.audit` | 3, 4, 5 | FR22, FR34 | Guest review |
| Soak control | `ops.soak` | — | FR36–FR37, G1 | ART-05 |
| Soak log | `ops.soak.log` | — | FR36 | Pass/fail |
| Degraded mode | `ops.degraded` | 3 | FR32, ART-06 | Fail-closed |

---

### 3.8 System and platform

| Screen | ID | Journeys | FRs | Notes |
|--------|-----|----------|-----|-------|
| Station registry | `sys.stations` | 0, 1 | FR24, FR48 | Dept registration; OFFLINE/PENDING |
| Fabric backup / restore | `sys.fabric` | F1 | FR41, G5 | |
| Policy / hybrid bounds | `sys.policy` | 1 | FR29–FR30 | Read-only MVP |
| Deployment / about | `sys.about` | — | FR42 | Version skew |

---

## 4. Journey → screen map

| Journey | Primary screens | Edge screens |
|---------|-----------------|--------------|
| **0** First comfort | `onboard.*` → `ops.overview` → `env.subsystem` | `env.subsystem.error` |
| **1** Coexistence commission | `onboard.*`, `ops.overview`, `ops.diagnostics` | F3 |
| **2** Night Watch Lite | `ritual.nightwatch-lite` | Suspended if alert active |
| **3** Unable to comply | `env.subsystem`, `ops.degraded` | |
| **4** Guest | `auth.guest`, `ops.overview` (read-only), `ops.audit` | |
| **5** Two controllers | `ops.overview`, `ops.conflict`, `ops.diagnostics` | |
| **6** Crew | `env.subsystem` | |
| **Alert** Any | `ops.overview`, `ops.alert.*` | ART-08 |

---

## 5. Navigation model

```
[ Alert banner | Vessel status | Health | Session ]

[ Ops ]  [ Environment ]  [ Tactical ]  [ Engineering ]  [ Science ]  [ Operations ]
   |            |              |              |              |            |
ops.overview  env.subsystem   PENDING        PENDING        PENDING    ops.audit
ops.alert.*                  explainer      explainer      explainer    ops.soak
```

**Default landing:** `ops.overview`.  
**First-run:** Onboarding → `ops.overview`.

---

## 6. Screen priority for UX design

| Priority | Screens | Rationale |
|----------|---------|-----------|
| **P0** | `ops.overview`, `chrome.*` | Hero + alert spine (Okuda) |
| **P0** | `env.subsystem`, `ops.alert.interstitial` | First live station + transitions |
| **P0** | `onboard.*` | Coexistence (G2) |
| **P1** | `ops.conflict`, `ops.diagnostics` | G2 conflict |
| **P1** | `ops.alert.rules`, `ops.alert.baselines` | Automation transparency |
| **P1** | `ritual.nightwatch-lite` | T7 |
| **P2** | `ops.soak`, guest profile, `sys.stations` | G1 + clearance |

---

## 7. States and overlays

| State | Parent | Trigger |
|-------|--------|---------|
| Command pending | `env.subsystem` | Post-Working, pre-Acknowledged |
| Alert Yellow/Red/BS | Global | Alert FSM |
| Quick Env pin | `ops.overview` | Green only |
| Night Watch suspended | Global | Yellow+ alert |
| OFFLINE station | Dept tiles | No hardware registered |

---

## 8. Deferred surfaces

Voice, combadge, bridge-station client, full Night Watch, HA dashboard — per PRD Out of Scope.

---

## 9. Traceability

| Section | PRD |
|---------|-----|
| Ops hero | FR48–FR52; Starship MVP ACs |
| Environmental subsystem | FR2–FR4, FR13–FR15; G3 |
| Alert | FR44–FR47; ART-08; NFR-UX4–UX6 |
| Conflict | FR8–FR12; ART-01–03 |
| Onboarding | FR29, FR38–FR39 |

---

## 10. Open items (Step 03+)

1. Alert FSM UX state diagram  
2. Experience pack token sheet (department colors, motion)  
3. Battle bridge renderer parity checklist  
4. Tablet 1024px breakpoint detail  
5. Physical chair button mapping (Growth)
