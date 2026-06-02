## MODIFIED Requirements

### Requirement: OhfSidecarAdapter stub

OhfSidecarAdapter SHALL connect to OHF sidecar via WebSocket and implement full MatterAdapterPort for live Nest operations.

#### Scenario: Live W0 connect

- **WHEN** `MATTER_ADAPTER=ohf` and sidecar is healthy
- **THEN** adapter SHALL connect and return real station snapshots within 5s

#### Scenario: Sidecar unreachable

- **WHEN** `MATTER_ADAPTER=ohf` and sidecar is down
- **THEN** engine startup SHALL fail with UnableToComply diagnostic
