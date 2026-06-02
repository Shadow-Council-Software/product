# ART-07: Soak Reference Automation

**Status:** Normative (v0.1) — referenced by FR28, FR36; required for [Gate:G1] with ART-05  
**Implements:** FR28 automation during WAN-down soak

## MVP reference automation (default)

| Field | Value |
|-------|-------|
| **ID** | AUTO-SOAK-01 |
| **Name** | Weekday evening setback |
| **Schedule** | Mon–Fri 22:00 local (operator TZ) |
| **Condition** | Away mode true (or operator-defined equivalent) |
| **Action** | Setback −2°F from current setpoint (min 60°F) |
| **Bounds** | Per ART-04 hybrid limits |
| **Audit** | Must emit `AutomationExecuted` with rule id |

Operator may substitute equivalent rule **before soak start**; substitution must be recorded in soak log and PRD traceability note.

## Preconditions (G1)

- WAN administratively down per ART-05  
- Google Home logged out on operator phone  
- This automation **enabled** and **fired at least once** during 24h window  
- Audit log contains rule id `AUTO-SOAK-01` (or substituted id)

## Verification

| Check | Method |
|-------|--------|
| Rule exists in engine config | `GET /api/v1/automations` or config dump |
| Execution during soak | Audit log search |
| No silent Google fallback for same action | ART-05 criterion 4 |

## Evidence record (fill on soak)

```yaml
art07_run:
  automation_id: AUTO-SOAK-01
  substituted: false
  substitute_id: null
  soak_start: null
  executions_during_soak: 0
  audit_log_refs: []
  gate_g1: not_ready
```
