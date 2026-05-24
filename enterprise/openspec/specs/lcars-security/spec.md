# lcars-security Specification

## Purpose

Sprint 1 security composites and clearance UX. Implements W-CT-01–03, FR19–22.

## Requirements

### Requirement: [Contract:W-CT-01] ClearanceOverlay

ClearanceOverlay SHALL block Guest actuation on protected controls and SHALL provide read-only escape without entering Adjusting state.

#### Scenario: Guest setpoint attempt

- **GIVEN** clearance Guest
- **WHEN** guest triggers Environmental adjust
- **THEN** ClearanceOverlay SHALL display denial with TNG OutcomeType `Denied`

### Requirement: [Contract:W-CT-02] Session clearance label

The chrome session token SHALL display clearance tier with contrast meeting NFR-UX accessibility floor.

#### Scenario: Captain session at 1280×720

- **WHEN** viewport is 1280×720
- **THEN** clearance label SHALL meet contrast minimum without horizontal scroll (NFR-UX3)

### Requirement: [Contract:W-CT-03] BattleStationsConfirm

BattleStationsConfirm SHALL gate Battle Stations actuation. Neither engine config nor experience pack SHALL bypass the gate.

#### Scenario: Contract test enforcement

- **WHEN** CI runs W-CT-03 contract test
- **THEN** actuation without confirm SHALL fail with engine denial

### Requirement: Viewport minimum

LCARS MVP SHALL target viewport width ≥1024px (NFR-UX1). Phone layout is out of scope.

#### Scenario: Tablet landscape

- **WHEN** viewport width is 1024px
- **THEN** primary HVAC path SHALL remain operable
