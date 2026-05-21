# ART-01: Coexistence Conformance Pack v1.0

**Status:** Stub — fill before G2 (NFR-I3 / FR-H2).

## Scope

Google Home + Main Computer on shared Nest Learning Thermostat (4th gen, Matter).

## Scenarios (minimum)

| ID | Scenario | Pass criteria |
|----|----------|---------------|
| T1-01 | Multi-admin add | Main Computer commissioned without revoking Google |
| T1-02 | Setpoint from LCARS | Wall unit matches ≤15s |
| T1-03 | Setpoint from Google Home | LCARS reflects within freshness SLA |
| T2-01 | Dual command race | Conflict detected per ART-02 |
| T2-02 | Stale subscription | Diagnostics surface divergence |
| T2-03 | WAN-down HVAC | No silent Google cloud fallback for HVAC |

## CI

Harness emits pass/fail report (FR-H2). 100% pass required for G2.
