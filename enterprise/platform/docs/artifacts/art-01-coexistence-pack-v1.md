# ART-01: Coexistence Conformance Pack v1.0

**Status:** Partial — **§2–§7 commissioning runbook normative**; CI harness stub until D-13  
**Author:** Onimurasame  
**Date:** 2026-05-19 (commissioning runbook)  
**Implements:** FR6, FR-H2, FR17; NFR-I3; G2  
**Referenced by:** [prd.md](../../prd.md), [research/technical-matter-adapter-enterprise-mvp-research-2026-05-19.md](../../research/technical-matter-adapter-enterprise-mvp-research-2026-05-19.md)

---

## 1. Scope

Google Home + Main Computer on shared **Nest Learning Thermostat (4th gen, Matter, Tier B)**.

This pack defines:

- **Commissioning runbook** — how ENTERPRISE joins the device as a **secondary Matter administrator** without revoking Google Home (FR6)
- **Conformance scenarios** — T1/T2 matrix for G2 CI (FR-H2)
- **Pass/fail criteria** — operator field checks and automated harness targets

**Out of scope:** Voice Computer, combadge, second Matter device class, sovereign/air-gap claims.

---

## 2. Golden stack (reference)

| Component | Role | MVP note |
|-----------|------|----------|
| Nest Learning Thermostat 4th gen | Environmental station | Matter-certified; partial Thermostat cluster ([Matter Survey](https://www.matter-survey.org/device/nest-learning-thermostat-4th-gen-24582-13)) |
| Google Home app + account | Primary fabric (typical Hybrid home) | Device already commissioned here in coexistence-first journey |
| Nest Hub (or compatible) | Thread border router | PRD: BR only — not control-plane brain |
| OHF Matter Server sidecar | ENTERPRISE Matter commissioner | `python-matter-server` stable image; `network_mode: host` |
| ENTERPRISE orchestration engine | Policy, registry, conflict, outcomes | Speaks WS to sidecar; LCARS never talks to sidecar directly |
| LCARS web console | Operator surface | `env.subsystem` drill-down post T1-01 |

**Pre-flight before any path:**

1. Sidecar healthy — WS connect + `get_nodes` responds  
2. Thread/Wi‑Fi path documented (Nest Hub online, same LAN as rack)  
3. Operator has Google Home admin access to thermostat  
4. Setup QR / manual pairing code **photographed and stored** (required if factory reset ever needed)  
5. Engine audit logging enabled for commission attempts  

---

## 3. Commissioning paths

Two paths are defined. **Path A is primary** for Hybrid Control Loop homes where Nest is already in Google Home.

| Path | Name | When to use | FR6 alignment |
|------|------|-------------|---------------|
| **A** | **Google-first multi-admin share** | Nest already on Google fabric (default Hybrid) | **Primary** — add ENTERPRISE fabric without revoking Google |
| **B** | **Direct sidecar commission** | Greenfield device, Google not primary, or Path A blocked | **Fallback** — device joins ENTERPRISE fabric first; Google added later via commissioning window |

**Field evidence:** Direct Path B to third-party controllers (including Home Assistant) often fails on Nest 4th gen — discovery timeout, secure pairing failed ([HA community](https://community.home-assistant.io/t/error-adding-nest-learning-thermostat-with-matter-to-ha/997392), [HA core #130006](https://github.com/home-assistant/core/issues/130006)). **Do not** block MVP on Path B alone.

---

## 4. Path A — Google-first share (PRIMARY)

**Goal:** Nest remains on **Google fabric**; ENTERPRISE sidecar joins as **second fabric**. Google Home control retained.

### 4.1 Preconditions (PASS required)

| Check | Pass | Fail |
|-------|------|------|
| Thermostat visible in Google Home app | Yes | Stop — establish Google fabric first |
| Thermostat reports Matter-linked in Google device info | Yes | Enable Matter in Google/Nest app per vendor flow |
| Sidecar running; engine connected | Yes | Fix sidecar before share |
| No in-progress factory reset | Yes | Complete Nest setup in Google first |

### 4.2 Procedure (operator)

**Option A1 — Share from Google Home (preferred when offered):**

1. Google Home app → thermostat → **Device settings**  
2. **Linked Matter apps & services** / **Share device** (wording varies by app version)  
3. Select ENTERPRISE / Matter Server target when prompted, or scan ENTERPRISE-provided pairing payload  
4. Complete share flow in Google UI  
5. Confirm in sidecar: node appears in `get_nodes` / engine registry  

Reference: [HA — share from Google Home](https://www.home-assistant.io/integrations/matter/#to-share-a-device-from-another-matter-controller-like-apple-or-google-home)

**Option A2 — Commissioning window from ENTERPRISE sidecar:**

1. Identify Nest `node_id` on Google fabric is **not** yet on ENTERPRISE — use Google share if node already visible only on Google  
2. From engine (or sidecar WS): `open_commissioning_window` on the Nest node **after** it is reachable on ENTERPRISE fabric via share, **or** on a device already dual-fabric  
3. If Google prompts to add Matter partner, accept and complete  
4. Engine: register station in registry with `authority: shared`, `fabrics: [google, enterprise]`  

Sidecar command shape: [python-matter-server WebSocket API — open_commissioning_window](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md)

### 4.3 Post-share verification (T1-01)

| Step | Action | Pass criteria |
|------|--------|---------------|
| V-A1 | Google Home app → thermostat | Still controllable; no “removed” or re-pair demand |
| V-A2 | Google Home → Manage fabrics / linked apps | Lists ENTERPRISE / Matter Server fabric |
| V-A3 | Sidecar `get_nodes` | Nest node present with expected endpoint(s) |
| V-A4 | Engine registry | Station `env.nest.primary` (or configured ID) bound to node |
| V-A5 | LCARS `HealthStrip` / Environmental tile | Shows online — not OFFLINE |
| V-A6 | Read Thermostat cluster attribute via engine | Current temp within ±1°F of Google app display |

**T1-01 PASS:** V-A1 through V-A6 pass; Google fabric **not** revoked.

**T1-01 FAIL:** Google lost control; only one fabric listed when two expected; sidecar has no node; operator had to factory reset to recover.

---

## 5. Path B — Direct sidecar commission (FALLBACK)

**Goal:** Commission unboxed or factory-reset Nest **directly** to ENTERPRISE sidecar, then add Google as secondary admin if desired.

### 5.1 Preconditions

| Check | Pass | Fail |
|-------|------|------|
| Factory reset performed **only** if intentional | Documented | Abort if accidental |
| QR / manual pairing code available | Yes | Cannot proceed — Nest requires code after reset |
| Sidecar `set_wifi_credentials` / `set_thread_dataset` configured | Yes for wireless | Commission will fail mid-flow |
| Bluetooth available to sidecar host **if** required for initial pairing | Yes or use `network_only: true` with on-network code | See sidecar docs |

### 5.2 Procedure

1. Sidecar: set Wi‑Fi and/or Thread credentials ([WebSocket API](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md))  
2. Sidecar: `commission_with_code` — QR (`MT:...`) or manual code; `network_only: true` if device already on LAN  
3. Wait for commission complete — **timeout threshold: 10 min** (fail if exceeded)  
4. Engine: register node; run V-A3–V-A6 (Google columns N/A until step 5)  
5. **Optional coexistence:** `open_commissioning_window` → add Google Home fabric per [Google multi-admin](https://developers.home.google.com/apis/android/commissioning/multi-admin) so Hybrid journey retains Google control  

### 5.3 Pass/fail (Path B)

| Result | Criteria |
|--------|----------|
| **PASS** | Node on ENTERPRISE fabric; read/write setpoint succeeds (T1-02 dry run); if step 5 attempted, Google also lists device |
| **FAIL** | Discovery timeout; secure pairing failed; node absent after 10 min; repeated failures on 3 attempts with 15 min cool-down between |
| **FAIL action** | Log diagnostics; **switch to Path A** if device still on Google from prior state; do **not** loop factory reset more than once per session without 24h cool-down |

Path B failure **does not** fail G2 if Path A subsequently passes on the same golden device — record path used in harness report.

---

## 6. W0 spike (pre-architecture)

Minimal proof before `architecture.md` sign-off:

| # | Step | Pass |
|---|------|------|
| W0-1 | Sidecar container up, `network_mode: host` | WS accepts connection |
| W0-2 | Execute **Path A** on operator home Nest | T1-01 verification table pass |
| W0-3 | `start_listening` → receive `attribute_updated` for temp or setpoint | Event within 60s of physical change |
| W0-4 | One `read_attribute` on Thermostat cluster | Value matches Google app ±1°F |

W0 failure on Path B alone → proceed with Path A spike; document in research appendix.

---

## 7. Conformance scenarios (full matrix)

| ID | Scenario | Pass criteria | Depends on |
|----|----------|---------------|------------|
| **T1-01** | Multi-admin add | Main Computer on fabric; Google not revoked; §4.3 V-A1–V-A6 | Path A or B complete |
| **T1-02** | Setpoint from LCARS | Wall unit matches ≤15s (G3) | T1-01 |
| **T1-03** | Setpoint from Google Home | LCARS reflects within freshness SLA | T1-01 |
| **T2-01** | Dual command race | Conflict detected per ART-02 | T1-01 |
| **T2-02** | Stale subscription | Diagnostics surface divergence (FR17) | T1-01 |
| **T2-03** | WAN-down HVAC | No silent Google cloud fallback for HVAC | T1-01 |

Commissioning sub-scenarios (harness tags):

| ID | Description | Maps to |
|----|-------------|---------|
| **C-A** | Path A share succeeded | T1-01 |
| **C-B** | Path B direct succeeded | T1-01 (fallback tag) |
| **C-F** | Both paths failed after documented retries | **G2 blocker** — escalate before ship |

---

## 8. Failure recovery pointers

| Symptom | First action | Ref |
|---------|--------------|-----|
| Google lost thermostat after share | Stop; do not factory reset; check Manage fabrics | FR11 |
| Sidecar node missing after reboot | Verify `/data` volume mount; sidecar logs | docker.md |
| LCARS stale but Google correct | T2-02; check `start_listening` subscription | ART-02 C-STALE |
| Only ENTERPRISE fabric, Google gone | Path B without step 5 — re-run Google add via commissioning window | §5.2 step 5 |

---

## 9. CI harness (stub)

Harness emits pass/fail report (FR-H2). **100% pass required for G2.**

**Planned tags:** `C-A` | `C-B` | `T1-01` … `T2-03` | implementation tracked in **D-13**.

Until harness exists: manual execution of §4–§7 with signed operator checklist satisfies **W0** and dogfood; not G2.

---

## 10. References

- [Technical research — Nest commissioning risk](../../research/technical-matter-adapter-enterprise-mvp-research-2026-05-19.md)  
- [python-matter-server WebSocket API](https://github.com/matter-js/python-matter-server/blob/main/docs/websockets_api.md)  
- [Google Home — multi-admin commissioning](https://developers.home.google.com/apis/android/commissioning/multi-admin)  
- [HA Matter — share from Google Home](https://www.home-assistant.io/integrations/matter/#to-share-a-device-from-another-matter-controller-like-apple-or-google-home)  
- [Nest 4th gen — Matter Survey capability profile](https://www.matter-survey.org/device/nest-learning-thermostat-4th-gen-24582-13)  
- [ART-02 Conflict taxonomy](./art-02-conflict-taxonomy.md)  
- [ART-04 Hybrid automation bounds](./art-04-hybrid-automation-bounds.md)
