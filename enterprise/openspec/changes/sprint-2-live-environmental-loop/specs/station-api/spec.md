## MODIFIED Requirements

### Requirement: Command endpoint stub

Engine SHALL implement `POST /api/v1/commands/setpoint` with clearance enforcement and MatterAdapterPort write delegation.

#### Scenario: Crew setpoint success

- **WHEN** Crew clearance posts valid setpoint for registered station
- **THEN** response SHALL include OutcomeType Acknowledged or Pending with receiptId

#### Scenario: Guest denial integration

- **WHEN** Guest clearance posts setpoint
- **THEN** response SHALL include OutcomeType `Denied` per tng-outcomes spec
