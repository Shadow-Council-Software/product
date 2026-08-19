# alert-fsm Specification

## Purpose

Alert phase state machine owned by engine (ADR-MA-05). Implements FR44–FR52, ART-08, NFR-UX4–UX6.

## Requirements

### Requirement: AlertPhase enumeration

The engine SHALL maintain AlertPhase as one of: `Green`, `Yellow`, `RedAlert`, `BattleStations`, `StandDownSummary`.

#### Scenario: Green default

- **WHEN** no alert condition is active
- **THEN** AlertPhase SHALL be `Green`

### Requirement: Engine ownership

Alert FSM state SHALL be owned exclusively by the orchestration engine. LCARS SHALL mirror engine snapshots; LCARS SHALL NOT advance FSM transitions without engine confirmation.

#### Scenario: LCARS reload during Red Alert

- **WHEN** LCARS reloads mid-incident
- **THEN** AlertPhase SHALL restore from engine snapshot — not localStorage alone

### Requirement: Visual law mapping

RedAlert SHALL use animated-red presentation; BattleStations SHALL use static-red (NFR-UX4).

#### Scenario: Phase transition latency

- **WHEN** AlertPhase changes
- **THEN** LCARS banner and layout mode SHALL update within 1s p95

### Requirement: [Contract:W-CT-03] Battle Stations confirm gate

BattleStations actuation SHALL require BattleStationsConfirm completion. The gate MUST NOT be disableable via configuration or experience pack (NFR-UX6).

#### Scenario: Pack attempts to skip gate

- **WHEN** experience pack manifest omits confirm gate
- **THEN** engine SHALL still enforce BattleStationsConfirm before destructive actuation

### Requirement: Stand-down before Green

Transition to Green from elevated alert SHALL require stand-down acknowledgment (FR47, ADR-CS-05).

#### Scenario: [Contract:W-CT-06] AlertBanner at Green

- **WHEN** AlertPhase is Green
- **THEN** AlertBanner SHALL be hidden except during `StandDownSummary` intercept

### Requirement: [Gate:G4] Degraded fail-closed

Under degraded mode per ART-06, alert transitions SHALL fail-closed or read-only as specified — never silent escalation.

#### Scenario: Fault injection blocks escalation

- **WHEN** degraded matrix marks subsystem read-only
- **THEN** operator SHALL NOT receive Verified outcome for blocked actuation
