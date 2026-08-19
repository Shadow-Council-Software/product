# ART-08: Alert Condition Matrix

**Status:** Normative — UX + alert FSM (P0 spine)  
**Author:** Onimurasame  
**Date:** 2026-05-18  
**Implements:** FR44–FR52, NFR-UX4–UX6; [ux-design-specification.md](../../ux-design-specification.md)  
**Referenced by:** PRD MVP Artifacts, alert automation engine

---

## 1. Alert level definitions

| Level | TNG analog | Role | Actuation |
|-------|------------|------|-----------|
| **Green** | Condition Green | Normal operations | Enable — full configurable scope |
| **Yellow** | Yellow Alert | Elevated watch | Restrict — no destructive baselines |
| **Red Alert** | Red Alert | Threat awareness | Mobilize — layout + forensic audit |
| **Battle Stations** | Battle stations (sub-state of Red Alert) | Committed response | Actuate — destructive baselines after confirm |

**Visual law (Okuda):** Red Alert = **animated-red** pulse. Battle Stations = **static-red** hold (pulse stops).

**Principle:** Green enables · Yellow restricts · Red Alert defends · Battle Stations actuates.

---

## 2. Trigger conditions

| To level | Trigger examples | Auto? |
|----------|------------------|-------|
| **Yellow** | Env threshold breach; motion outside window; guest anomaly; operator manual; WAN latency (when instrumented) | Sensor auto or manual |
| **Red Alert** | Confirmed intrusion class; fire/CO; operator manual (hold-to-confirm); Captain prompt after Yellow timeout **with threat class** | Manual confirm for operator-initiated |
| **Battle Stations** | Operator confirm while at Red Alert; high-confidence threat class (when Tactical online) | Never silent auto from Yellow alone |

**De-escalation:**

| From | To | Rule |
|------|-----|------|
| Yellow | Green | Triggers cleared + 5 min hysteresis + Captain notified of pending stand-down; or manual 2-tap confirm |
| Red Alert | Yellow/Green | Manual; PIN + hold; 2 min lockout minimum |
| Battle Stations | Red Alert/Green | Manual; PIN + hold; **Incident Summary** required before Green restore |

---

## 3. Baseline automatic responses (locked)

### Green

| ID | Baseline |
|----|----------|
| G-B1 | Environmental poll 60s; passive sensor logging |
| G-B2 | Matter reconcile 5 min; drift to ship log |
| G-B3 | Scheduled/configurable automations run normally |
| G-B4 | Google coexistence active; authority UI nominal |
| G-B5 | Standard audit verbosity |

### Yellow

| ID | Baseline |
|----|----------|
| Y-B1 | Poll interval 30s |
| Y-B2 | Open **Yellow Event Block** (tagged audit) |
| Y-B3 | Suspend non-critical scheduled automations |
| Y-B4 | Push/console notification escalation |
| Y-B5 | LCARS amber layout; Quick Environmental hidden/collapsed |
| Y-B6 | **No Google suspend** — intensify authority indicator |
| Y-B7 | Single entry chime (when audio available) |

### Red Alert

| ID | Baseline |
|----|----------|
| R-B1 | Open **Red Event Block** (forensic audit) |
| R-B2 | Animated-red LCARS layout; Tactical-primary |
| R-B3 | Environmental **safe band hold** (Nest MVP) |
| R-B4 | Hide ambient/non-security widgets |
| R-B5 | Klaxon 3-cycle burst then silence (when audio registered) |
| R-B6 | Night Watch Lite **suspended** — diegetic message per TNG contract |

### Battle Stations

| ID | Baseline |
|----|----------|
| BS-B0 | **Confirm gate** before any destructive baseline — **non-configurable, non-skippable** |
| BS-B1 | Static-red layout hold |
| BS-B2 | Cross-hatch unavailable actuators |
| BS-B3 | Lock engage | **PENDING** until Tactical station |
| BS-B4 | Guest network terminate | **PENDING** until Engineering network |
| BS-B5 | Continuous camera record | **PENDING** until Tactical |
| BS-B6 | Siren latch | **PENDING** until hardware registered; night cap **configurable** |
| BS-B7 | SMS emergency contacts | **PENDING** until Comms |

**PENDING execution:** Log `SKIPPED — station offline`; show in 3s transition interstitial.

---

## 4. Configurable automation rules

| Level | Allowed rule types | Forbidden |
|-------|-------------------|-----------|
| **Green** | Comfort, scenes, guest access, maintenance windows, experimental sensor profiles | — |
| **Yellow** | Secondary locks, plug shutoff, camera aim, notify routing, voice mute (optional profile) | Disabling Y-B1–Y-B7 |
| **Red Alert** | Emergency contact order, safe-room lighting prep | Unlock exterior, disable audit |
| **Battle Stations** | Night siren cap, contact sequences, pre-consented VOIP | Unlock, disable recording, suppress emergency notify |

**Schema tags:** `scope: baseline | configurable`; `validAt: [G|Y|R|BS]`; `minAlertLevel`.

---

## 5. LCARS / screen layout changes

| Level | Banner | Default view | Ops layout |
|-------|--------|--------------|------------|
| Green | Hidden | `ops.overview` | Full department tiles; Quick Env pin |
| Yellow | Amber 32px | `ops.overview` | Environment + Tactical promoted |
| Red Alert | Crimson, animated | `ops.overview` → Tactical emphasis | Animated-red arcs |
| Battle Stations | Crimson, static | Tactical-primary | Static-red; strikethrough OFFLINE |

See [lcars-screen-inventory.md](../../lcars-screen-inventory.md) and UX spec § Ops Overview.

---

## 6. Captain's chair controls

| Control | Green | Yellow | Red Alert | Battle Stations |
|---------|-------|--------|-----------|-----------------|
| Escalate to Yellow | 1-tap | — | — | — |
| Escalate to Red | — | hold-to-confirm | — | — |
| Battle Stations | — | — | confirm interstitial | — |
| De-escalate | — | 2-tap or auto hysteresis | PIN + hold | PIN + hold + Incident Summary |
| ACK ALARM | — | Optional | Required after klaxon | Required |
| QUERY TRIGGER | — | Yes (false Yellow) | Yes | Yes |

Physical armrest buttons → Growth / battle bridge hardware; LCARS equivalents required P0.

---

## 7. Night Watch Lite interaction

| Alert level | Behavior |
|-------------|----------|
| Green | Normal ritual |
| Yellow entry | Hold in progress → interstitial → suspend remainder |
| Red Alert+ | Ritual suspended; copy: `Night Watch suspended. Alert condition takes precedence.` |
| Return to Green | Optional prompt: `Resume Night Watch?` — default No |

---

## 8. Guest session constraints

| Level | LCARS guest | Network guest (Growth) |
|-------|-------------|------------------------|
| Green | Quarters read-only profile | N/A P0 |
| Yellow+ | Read-only alert banner; no controls | Notify host + grace (Growth) |
| Red Alert+ | Same | Terminate with grace (Growth) |

P0: LCARS guest profile only — affordance removal, not disabled tease.

---

## 9. Audit and logging

- **Yellow Event Block:** Opens at Yellow; closes on Green restore  
- **Red Event Block:** Opens at Red Alert; write-protected until Captain closes post-incident  
- All transitions emit `AlertTransitionEvent` `{from, to, trigger, correlationId}`  
- Suppressed configurable rules emit `RuleSuppressedEvent`

---

## 10. P0 reverse path (MVP minimum)

Ship with one Nest thermostat + web LCARS:

1. Alert FSM (Green/Yellow/Red/Battle Stations)  
2. Manual escalate/de-escalate + banner + layout modes  
3. 3s transition interstitial  
4. Environmental baselines G-B1, Y-B1–Y-B6, R-B3, R-B6  
5. BS-B0 confirm gate (even if BS-B3+ PENDING)  
6. `ops.overview` as default landing  

---

## 11. MVP acceptance cross-check

| AC | Criterion |
|----|-----------|
| AC-STarship-1 | Red Alert from LCARS applies Environmental safe band + layout ≤3s without Google Home app |
| AC-STarship-2 | Operator completes Yellow escalation via LCARS alone ≤45s |
| AC-STarship-3 | External override during Yellow shows indicator ≤10s + restore affordance |

See PRD [Starship MVP Acceptance](./../prd.md#starship-mvp-acceptance).
