## ADDED Requirements

### Requirement: [Contract:W-CT-04] QuickEnvPin Green-only width

QuickEnvPin SHALL render Green authority path at full Environmental panel width without horizontal scroll at 1280×720.

#### Scenario: Green pin layout

- **WHEN** station authority is enterprise Green at 1280×720
- **THEN** QuickEnvPin SHALL occupy full Environmental panel width

### Requirement: Environmental setpoint control

LCARS Environmental panel SHALL display current temperature, target setpoint, and freshness badge from engine snapshot.

#### Scenario: Live freshness display

- **WHEN** engine emits StationUpdated with fresh attribute
- **THEN** Environmental panel SHALL update freshness badge within one render frame
