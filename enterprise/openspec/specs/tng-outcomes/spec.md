# tng-outcomes Specification

## Purpose

Deterministic operator-facing command outcomes. Implements FR15 and [`tng-interaction-contract.md`](../../tng-interaction-contract.md).

## Requirements

### Requirement: OutcomeType enumeration

Every operator command routed through Main Computer SHALL resolve to exactly one OutcomeType: `Acknowledged`, `Pending`, `Verified`, `Denied`, `UnableToComply`, or `Warning`.

#### Scenario: Successful setpoint with confirmation

- **WHEN** a setpoint write is accepted and device state matches within freshness SLA
- **THEN** the engine SHALL emit OutcomeType `Verified`

#### Scenario: Sidecar unreachable

- **WHEN** Matter sidecar is disconnected
- **THEN** actuation commands SHALL resolve to `UnableToComply` or `Pending` — never silent success

### Requirement: Message structure

Every outcome payload SHALL include `outcomeType`, primary `message`, optional `cause`, optional `remediation`, `receiptId`, and `freshnessTs`.

#### Scenario: Denied guest actuation

- **WHEN** Guest clearance attempts a write command
- **THEN** OutcomeType SHALL be `Denied`
- **AND** message SHALL follow TNG denial grammar (no generic "Access denied")

### Requirement: Cause before remedy

Failure outcomes SHALL state cause (or best-known cause) before remediation text.

#### Scenario: Unable to comply on Matter timeout

- **WHEN** sidecar does not confirm write within policy timeout
- **THEN** OutcomeType SHALL be `UnableToComply`
- **AND** `cause` SHALL identify Matter path or sidecar state

### Requirement: [Contract:W-CT-01] Guest clearance denial path

Guest clearance SHALL NOT complete actuation commands on protected controls.

#### Scenario: Guest adjusts Environmental setpoint

- **GIVEN** operator session clearance is Guest
- **WHEN** guest submits a setpoint change
- **THEN** OutcomeType SHALL be `Denied`
- **AND** ClearanceOverlay SHALL offer read-only escape without entering Adjusting state
