## ADDED Requirements

### Requirement: [Contract:W-CT-04] QuickEnvPin Green-only width

QuickEnvPin SHALL render Green authority path at full Environmental panel width without horizontal scroll at 1280×720. Non-Green (shared) authority SHALL render width-capped at 480px. The pin is read-only informational chrome at every AlertPhase — it exposes no actuation.

#### Scenario: Green pin layout

- **WHEN** station authority is enterprise Green at 1280×720
- **THEN** QuickEnvPin SHALL occupy full Environmental panel width without horizontal scroll

#### Scenario: Shared authority pin layout

- **WHEN** station authority is shared (non-Green)
- **THEN** QuickEnvPin SHALL render width-capped at 480px maximum

### Requirement: Environmental setpoint control

LCARS Environmental panel SHALL display current temperature, target setpoint, and freshness badge from engine snapshot.

#### Scenario: Live freshness display

- **WHEN** engine emits StationUpdated with fresh attribute
- **THEN** Environmental panel SHALL update freshness badge within one render frame
