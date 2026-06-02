# ART-06: Degraded-Mode Matrix

**Status:** Normative (v0.1) — referenced by FR32, NFR-R4, [Gate:G4]  
**Implements:** OpenSpec `alert-fsm`, `matter-adapter`, `station-api`  
**Verification:** CI fault-injection harness; field spot-check during rack day

## Matrix

| Mode ID | Trigger | Engine behavior | LCARS behavior | Actuator commands | Audit |
|---------|---------|-----------------|----------------|-------------------|-------|
| DEG-01 | Policy engine unavailable | Fail-closed: deny all actuator writes | Diegetic banner: policy offline | **Blocked** | Deny + reason `policy_unavailable` |
| DEG-02 | Matter commissioner disconnect >60s | Read-only snapshot; no new writes | Stale badge; reconnect CTA | **Blocked** except break-glass | `commissioner_disconnected` event |
| DEG-03 | Sidecar WS down (`ohf` adapter) | Explicit adapter error; no silent mock | Show `SIDEcar_UNREACHABLE` outcome | **Blocked** | Log correlation id |
| DEG-04 | Audit log write failure | Block commands | Critical banner | **Blocked** | Console-local error queue |
| DEG-05 | CONFLICT state active | Per ART-03 winner or block | ConflictReconcile modal (W-CT-05) | **Blocked** until reconciled | `ConflictDetected` envelope |
| DEG-06 | Guest clearance | Default-deny per FR20 | Clearance denial copy | **Blocked** out-of-scope | Deny reason code |
| DEG-07 | Alert ≥ Yellow | Night Watch Lite suspended (FR52) | Alert layout mode | Scene rules per ART-08 | `RuleSuppressedEvent` |

## Fault-injection scenarios (CI — G4)

| Scenario ID | Inject | Expect | Pass criteria |
|-------------|--------|--------|---------------|
| FI-01 | Stop policy service | DEG-01 | Setpoint POST returns Denied; no MQTT write |
| FI-02 | Kill sidecar container | DEG-03 | Engine health strip RED; LCARS stale ≤5s then fail-closed |
| FI-03 | Force CONFLICT stub | DEG-05 | No command API 200 during CONFLICT (W-CT-05) |
| FI-04 | Audit sink read-only | DEG-04 | Command blocked; operator message shown |

## Field notes

- Run FI-02 on rack during or after live W0.  
- Record results in soak log appendix when combined with ART-05.

## Evidence record (fill on run)

```yaml
art06_run:
  date: null
  environment: ci | rack
  scenarios:
    FI-01: { pass: null, log: "" }
    FI-02: { pass: null, log: "" }
    FI-03: { pass: null, log: "" }
    FI-04: { pass: null, log: "" }
  gate_g4: not_ready
```
