## ADDED Requirements

### Requirement: Sprint 1 minimal HTTP surface

Engine sprint 1 SHALL implement `GET /api/v1/stations`, `GET /api/v1/alerts`, and WebSocket `/api/v1/events/stream`.

#### Scenario: LCARS bootstrapping

- **WHEN** LCARS loads against local engine
- **THEN** stations snapshot and event stream SHALL connect without 404

### Requirement: Command endpoint stub

Engine SHALL expose `POST /api/v1/commands/setpoint` returning outcome envelope even when adapter is mock.

#### Scenario: Guest denial integration

- **WHEN** Guest clearance posts setpoint
- **THEN** response SHALL include OutcomeType `Denied` per tng-outcomes spec
