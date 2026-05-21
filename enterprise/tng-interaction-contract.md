# TNG Interaction Contract — ENTERPRISE Main Computer

**Status:** Normative for user-facing copy (MVP web LCARS console)  
**Author:** Onimurasame  
**Date:** 2026-05-18  
**Implements:** PRD `experienceMandate: tng_protocol_ux_private`, FR15, FR20; NFR-UX1–UX3  
**Supersedes:** Scattered TNG references in PRD journeys only for copy and outcome grammar

---

## 1. Purpose

This document defines the **interaction contract** between the operator and Main Computer: how outcomes are phrased, how failures are reported, and how clearance limits are communicated. It applies to all MVP user-facing surfaces; Growth voice and combadge must use the same grammar (FR-G3).

**Separation of concerns:**

| Layer | Owns |
|-------|------|
| **Orchestration engine** | Truth — device state, policy decisions, audit, conflict classification |
| **Experience pack / config** | Fiction — exact wording variants, audio cues, LCARS token styling |
| **This contract** | Grammar — outcome types, required fields, clearance rules, forbidden patterns |

MVP uses **config-first** copy (`tng-core` pack when a second consumer exists). Wording below is the **reference pack default**; packs may vary tone but not outcome structure.

---

## 2. Core principles

1. **Diegetic truth** — User-facing text reflects engine state. Never imply sovereign or air-gapped operation during Hybrid Mode (P0).
2. **Cause before remedy** — Every failure states what failed and why (or best-known cause), then remediation or next step.
3. **Clearance-aware** — Denials name required clearance level; never expose internal policy IDs or stack traces.
4. **Calm precision** — Complete sentences; neutral tone; no slang, emoji, or chatbot filler.
5. **Consistent outcomes** — Same command class always maps to the same outcome type (see §3).

---

## 3. Outcome types

Every user-initiated action resolves to exactly one **outcome type**. The UI must show the type label (or pack equivalent) and optional detail line.

| Type | When | Required elements | Example (HVAC setpoint) |
|------|------|-------------------|-------------------------|
| **Acknowledged** | Command accepted on control path | Action summary | "Acknowledged. Setpoint 72 °F." |
| **Adjusting** | Actuators in motion; awaiting device confirm | Target summary | "Adjusting. Setpoint 72 °F." |
| **Verified** | Device/sensors confirm stable outcome | Confirmed summary | "Verified. Living deck 72 °F stable." |
| **Working** | Long-running or multi-step in progress (non-HVAC) | Step label; optional progress | "Working. Commissioning thermostat." |
| **Completed** | Ritual or multi-step flow finished | Summary | "Completed. Night Watch Lite." |
| **Unable to comply** | Hard failure; action not performed | Cause; timestamp; remediation | "Unable to comply. Commissioner link lost — last verified 22:04. Retry or open diagnostics." |
| **Warning** | Partial success, degraded mode, or conflict | Condition; operator action | "Warning. Authority conflict detected. Reconcile before next command." |
| **Denied** | Policy or clearance block before actuators | Scope boundary; redirect path | See §6 |

**Forbidden:**

- Generic errors: "Something went wrong", "Error 500", "Oops"
- False certainty: "Done" or "Verified" when device confirmation is pending
- Sovereign claims in MVP: "Air-gapped", "Fully offline", "No cloud dependency" (unless soak/G1 context and accurate)
- Progress spinners under Yellow Alert or higher — use status lines: `Calculating. Stand by.`

---

## 4. Outcome message structure

```
[Outcome type]. [Primary statement]. [Optional: cause]. [Optional: remediation / next step].
```

**Rules:**

- Outcome type appears first (or as visually dominant label in LCARS chrome).
- Primary statement is one clause — what happened or what was requested.
- Cause is mandatory for **Unable to comply** and **Warning** when engine has a classified reason (timeout, offline, conflict class per ART-02).
- Remediation is mandatory for **Unable to comply** when a retry, wizard, or settings path exists.
- **Denied** must include clearance or scope boundary (§6).

**Timing copy (freshness SLA):**

**Environmental subsystem (normative 3-phase):** Acknowledged → Adjusting → Verified. Display as **one compact line** that morphs; do not imply completion until **Verified**.

- **Acknowledged** — control path accepted the command.
- **Adjusting** — actuator path engaged; awaiting device subscription update.
- **Verified** — device confirms stable setpoint/mode within SLA (≤15s p95, NFR-P2). **Primary user success feeling.**

If confirmation exceeds SLA, escalate to **Warning** or **Unable to comply** with stale-telemetry class (C-STALE) when applicable.

---

## 5. Personas and clearance

| Persona | Role | Clearance label (user-facing) | MVP HVAC scope |
|---------|------|-------------------------------|----------------|
| **Captain** | Operator (Onimurasame) | Full clearance | Read/write HVAC, commissioning, conflict reconcile, soak, guest management |
| **Crew** | Household partner | Environmental clearance | Read/write HVAC within environmental scope |
| **Guest** | Visitor | Quarters clearance | Read environmental status only; no setpoint/mode changes |
| **Contributor** | OSS developer | N/A (post-dogfood) | Not in MVP operator console |

Clearance labels appear in session chrome and **Denied** messages. Internal RBAC role names need not match labels exactly but must map 1:1 in config.

---

## 6. Denial and clearance messaging

**Template (Denied):**

```
Denied. [Scope boundary]. [Redirect path]. Current session: [Clearance label].
```

**Examples:**

- Guest attempts setpoint change:  
  `Denied. Clearance required for this section. Contact the duty officer or return to assigned quarters. Current session: Quarters.`
- Crew attempts setpoint (if policy blocked):  
  `Denied. Setpoint control requires Environmental clearance or higher. Contact the First Officer. Current session: Quarters.`
- Crew attempts fabric admin (if exposed):  
  `Denied. Fabric administration requires Full clearance. Current session: Environmental.`

**Forbidden denial copy:** "Access denied." (bureaucratic — Picard veto)

**Rules (FR20):**

- Deny **before** actuators execute.
- Log denial in audit with reason code (internal); user sees clearance message only.
- Do not reveal whether resource exists if out of scope (optional pack choice: generic "Not authorized for this system").

---

## 7. Hybrid Mode messaging

Hybrid Mode is **honest coexistence** with Google Home — not full sovereignty (PRD `mvpPosture: hybrid`).

**Onboarding acknowledgment (FR29)** — operator must confirm understanding:

```
Hybrid Mode active. Main Computer controls permitted systems on this site. 
Google Home may retain parallel authority on shared devices. 
Automated actions are bounded per system policy. Manual override available when permitted.
```

**Authority indicator labels (FR7):**

| State | Label |
|-------|--------|
| Last change from Main Computer | `Authority: Main Computer` |
| Last change from Google / external | `Authority: Google Home` |
| Conflict active | `Authority: Conflict` |

**User-facing rule:** Never display "Sovereign" or "Air-gapped" in MVP chrome unless running an explicitly named soak or drill mode with accurate preconditions (ART-05).

---

## 8. Conflict and coexistence copy

Conflict classes (ART-02) map to user-facing **Warning** or blocking state:

| Class | User-facing headline | Detail pattern |
|-------|---------------------|----------------|
| **C-DUAL** | Warning. Conflicting commands detected. | Two controllers issued commands within the reconciliation window. Reconcile required. |
| **C-STALE** | Warning. Displayed state may be stale. | Last subscription update exceeded freshness threshold. Refresh or open diagnostics. |
| **C-AUTH** | Warning. Authority mismatch. | Reported authority does not match device truth. Reconcile before next command. |

**Reconcile actions (FR10)** — button labels:

- `Accept Main Computer state`
- `Accept external state`
- `Defer with reason` (requires short operator note; stored in audit)

**Conflict banner (NFR-UX3):** Headline + authority indicator visible without horizontal scroll at 1280×720; must not rely on color alone.

---

## 9. Failure and recovery copy

### Command timeout / unreachable (Journey 3, FR4)

```
Unable to comply. [Device name] did not confirm within [N]s. 
Cause: [timeout | unreachable | commissioner disconnect]. 
Retry command or open diagnostics.
```

### Degraded modes (ART-06)

| Mode | User-facing pattern |
|------|---------------------|
| Policy unavailable | `Unable to comply. Policy service unavailable. Commands blocked until service restores.` |
| Commissioner disconnect | `Warning. Matter commissioner disconnected. Console read-only until reconnect.` |
| Audit write failure | `Unable to comply. Audit log unavailable. Commands blocked.` |

### Onboarding rollback (FR39)

```
Unable to comply. Onboarding step incomplete. 
Cause: [commission timeout | fabric undefined | Thread border router offline]. 
Follow recovery steps or roll back to previous stable state.
```

### Fabric recovery (F1, FR11)

Wizard steps use **Working** / **Completed** / **Unable to comply** per step; never expose fabric credentials in copy.

---

## 10. Night Watch Lite (MVP ritual)

Three-step script (FR26–27). Each step ≤2s p95 (NFR-P4); total ≤120s.

| Step | Purpose | Reference copy |
|------|---------|----------------|
| 1 — Status | Site summary line | `Night Watch Lite. All primary systems nominal.` (or pack variant reflecting health strip truth) |
| 2 — Optional scene | Minimal scene activation | `Acknowledged. Scene [name] activated.` or skip if none configured |
| 3 — Closing | Ritual complete | `Completed. Night Watch Lite.` |

**Skip preference:**  
`Preference stored. Night Watch Lite will not run automatically until re-enabled.`

**Conflict during ritual (FR16):** Step 3 may be deferred; banner promotes expand to full conflict/diagnostics view.

**Alert condition active (Yellow+):** Suspend ritual in progress. Copy: `Night Watch suspended. Alert condition takes precedence.` On return to Green, optional `Resume Night Watch?` — default No.

Full Night Watch (digest, anomaly summary) → Growth (FR-G1); do not conflate copy.

---

## 11. Health strip labels

Persistent chrome (FR33). Compact; drill-down to subsystem detail.

| Field | Label pattern |
|-------|---------------|
| Control path | `Control path: Up` / `Degraded` / `Down` |
| Last sync | `Last sync: [relative time]` |
| Last error | `Last error: [short cause]` or `None` |

Health strip data age ≤5s p95 (NFR-P3). Strip is **truth**, not fiction — pack may style, not falsify.

---

## 12. Soak and operator drills

Soak session (FR36–37, ART-05) uses neutral **Working** / **Completed** / **Unable to comply** — not ritual fiction.

**Start:**

```
Working. Soak session [id] started. WAN-down preconditions verified.
```

**Pass:**

```
Completed. Soak session [id] passed. Duration 24h. Criteria met.
```

**Fail:**

```
Unable to comply. Soak session [id] failed. 
Cause: [criterion reference]. Record blocker in soak log.
```

**Abort:**

```
Completed. Soak session [id] aborted by operator. [Consequence summary].
```

---

## 13. Growth surfaces (reference only — not MVP)

Voice (FR-G3) and combadge must reuse outcome types verbally:

- "Acknowledged." / "Unable to comply." + cause + remedy
- Same clearance denial grammar
- Console remains **system of record** for conflict reconcile; voice may direct operator to LCARS for C-DUAL / C-AUTH

---

## 14. Experience pack extension points

Packs may override:

- Exact strings (within structure above)
- LCARS color tokens, typography, audio earcons
- Ritual scene names and optional step 2 content

Packs may **not** override:

- Outcome type taxonomy (§3)
- Required fields for Unable to comply / Denied / Warning
- Hybrid honesty rules (§7)
- Clearance label semantics (§5)

**Contract tests (M0):** Engine emits outcome type + structured fields; pack renders strings. Changing grammar requires PRD/contract revision.

---

## 15. Traceability

| Contract section | PRD |
|------------------|-----|
| Outcome types | FR15, User Success (Protocol) |
| Clearance / Denied | FR19–FR22, Journey 4 |
| Hybrid / authority | FR7, FR29, Journey 1, 5 |
| Conflict copy | FR8–FR10, FR16–FR17, ART-02, ART-03 |
| Night Watch Lite | FR26–FR27, Journey 2 |
| Failures | FR4, FR32, Journey 3, ART-06 |
| Health strip | FR33 |
| Soak | FR36–FR37, ART-05 |
| Console NFRs | NFR-UX1–UX3, NFR-P2, NFR-P4 |
