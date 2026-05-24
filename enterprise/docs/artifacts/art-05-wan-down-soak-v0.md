# ART-05: 24h WAN-Down Soak Protocol v0

**Status:** Stub — referenced by NFR-R2, FR36, G1.

## Preconditions

- WAN administratively down (router uplink disabled)
- Google Home app logged out on operator phone
- Main Computer and Matter commissioner on LAN only

## Pass criteria (all required)

1. HVAC setpoint change + read succeeds
2. One automation per ART-07 runs and logs to audit
3. Auth session remains valid
4. No silent Google cloud fallback for HVAC
5. Duration: 24 consecutive hours

## Fail

Record blocker in soak log; do not declare MVP without remediation plan.
