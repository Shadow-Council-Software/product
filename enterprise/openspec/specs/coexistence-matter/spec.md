# coexistence-matter Specification

## Purpose

Google + ENTERPRISE Matter coexistence. Implements FR6, FR-H2, ART-01, [Gate:G2], [Gate:G5].

## Requirements

### Requirement: Path A primary commissioning

Multi-admin add SHALL use Google-first fabric share as the primary commissioning path (ART-01 Path A).

#### Scenario: Hybrid home Nest already in Google Home

- **GIVEN** Nest is controllable in Google Home
- **WHEN** operator adds ENTERPRISE sidecar fabric
- **THEN** Google control SHALL remain without factory reset requirement

### Requirement: [Gate:G2] Conformance scenario T1-01

After Path A, verification V-A1 through V-A3 SHALL pass: Google control retained, fabrics listed, sidecar node present.

#### Scenario: T1-01 pass criteria

- **WHEN** ART-01 T1-01 manual or CI harness runs
- **THEN** Google fabric SHALL NOT be revoked
- **AND** sidecar `get_nodes` SHALL include Nest node

### Requirement: [Gate:G2] Setpoint cross-check T1-02

Setpoint from LCARS SHALL match wall unit within 15s (G3 coupling).

#### Scenario: T1-02 lab measurement

- **WHEN** operator commands setpoint from LCARS
- **THEN** physical thermostat SHALL match within 15s

### Requirement: Dual-writer conflict detection

When Google and ENTERPRISE both command near-simultaneously, engine SHALL detect conflict per ART-02 before emitting OutcomeType `Verified`.

#### Scenario: T2-01 race

- **WHEN** dual command race is injected
- **THEN** conflict record SHALL be created and surfaced to `ops.conflict`

### Requirement: [Gate:G5] Fabric backup

Operator runbook SHALL support sidecar `/data` volume backup and restore with RTO ≤30 min and RPO ≤24h.

#### Scenario: Restore drill

- **WHEN** fabric restore drill completes
- **THEN** Nest node SHALL reappear on sidecar without re-share if backup valid

### Requirement: [Gate:G1] WAN-down HVAC local path

During WAN-down soak, HVAC control SHALL remain on LAN Matter path without silent Google cloud fallback for actuation.

#### Scenario: ART-01 T2-03

- **WHEN** WAN is down and Google app logged out
- **THEN** LCARS + engine + sidecar LAN path SHALL still command Environmental station
