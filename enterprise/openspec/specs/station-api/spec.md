# station-api Specification

## Purpose

Engine ↔ LCARS (and future bridge-station) contract. Implements FR-H3, architecture REST/WS surface.

## Requirements

### Requirement: API version prefix

All engine HTTP routes SHALL be under `/api/v1/`.

#### Scenario: LCARS base URL

- **WHEN** LCARS connects to engine on rack
- **THEN** snapshot and command paths SHALL use `/api/v1/*`

### Requirement: Event envelope v1

WebSocket stream `/api/v1/events/stream` SHALL emit events with `schemaVersion: 1`, `eventId`, `type`, `timestamp`, and `payload`.

#### Scenario: Station update event

- **WHEN** engine read model changes for a station
- **THEN** stream SHALL emit `StationUpdated` with envelope v1 fields

### Requirement: Outcome-typed command responses

Command endpoints SHALL return TNG outcome payloads per `tng-outcomes` spec — not bare HTTP status alone.

#### Scenario: Setpoint command response

- **WHEN** operator POSTs setpoint change
- **THEN** response body SHALL include `outcomeType` and `receiptId`

### Requirement: [Gate:G1] WAN-down shell

LCARS console shell and alert FSM snapshot SHALL be servable from engine without cloud dependency during WAN-down soak (NFR-UX5).

#### Scenario: Cloud OAuth stale

- **WHEN** WAN is down and Google OAuth is stale
- **THEN** LCARS SHALL render Ops layout and alert chrome from engine LAN API
- **AND** subsystem tiles MAY show stale freshness per coexistence rules — not blank shell

### Requirement: Snapshot freshness metadata

Station snapshots SHALL include `freshnessTs` for each material attribute used by HealthStrip and tiles.

#### Scenario: [Gate:G3] HealthStrip staleness

- **WHEN** subscription age exceeds policy
- **THEN** snapshot SHALL reflect stale state explicitly for UI fail-closed rendering

### Requirement: Sprint 1 minimal HTTP surface

Engine sprint 1 SHALL implement `GET /api/v1/stations`, `GET /api/v1/alerts`, and WebSocket `/api/v1/events/stream`.

#### Scenario: LCARS bootstrapping

- **WHEN** LCARS loads against local engine
- **THEN** stations snapshot and event stream SHALL connect without 404

### Requirement: Command endpoint stub

Engine SHALL implement `POST /api/v1/commands/setpoint` with clearance enforcement and MatterAdapterPort write delegation.

#### Scenario: Crew setpoint success

- **WHEN** Crew clearance posts valid setpoint for registered station
- **THEN** response SHALL include OutcomeType Acknowledged or Pending with receiptId

#### Scenario: Guest denial integration

- **WHEN** Guest clearance posts setpoint
- **THEN** response SHALL include OutcomeType `Denied` per tng-outcomes spec
