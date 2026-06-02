## ADDED Requirements

### Requirement: Sim Matter adapter mode

Engine SHALL support `MATTER_ADAPTER=sim` delegating to Sim Bridge without OHF sidecar or live Nest.

#### Scenario: Dev harness boot

- **WHEN** Sim Bridge is healthy and `MATTER_ADAPTER=sim`
- **THEN** engine SHALL connect and serve stations from spatial layout

#### Scenario: Sim Bridge down

- **WHEN** `MATTER_ADAPTER=sim` and Sim Bridge unreachable
- **THEN** engine startup SHALL fail with UnableToComply diagnostic
