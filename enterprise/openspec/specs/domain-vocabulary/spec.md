# domain-vocabulary Specification

## Purpose

Canonical ENTERPRISE domain terms. All other specs MUST use these definitions; aliases MUST be declared here before use.

## Requirements

### Requirement: Station identifier grammar

The system SHALL identify live and pending stations with IDs matching `{department}.{vendor}.{role}` (lowercase, dot-separated).

#### Scenario: Environmental Nest station

- **GIVEN** the golden MVP device
- **WHEN** registered in the engine
- **THEN** the station ID SHALL be `env.nest.primary` unless explicitly configured otherwise

### Requirement: Screen identifier grammar

LCARS screens SHALL use IDs matching `{area}.{name}` per [`lcars-screen-inventory.md`](../../lcars-screen-inventory.md).

#### Scenario: Ops hero screen

- **WHEN** the operator loads the default route
- **THEN** the active screen ID SHALL be `ops.overview`

### Requirement: Hybrid Mode definition

Hybrid Mode SHALL mean Google Home and Main Computer hold independent Matter fabrics on the same physical device without revoking the primary Google fabric.

#### Scenario: Honest posture labeling

- **WHEN** Google fabric remains active for Environmental control
- **THEN** HealthStrip SHALL display non-dismissible `POSTURE: HYBRID`

### Requirement: Truth ownership

The orchestration engine SHALL be the sole authority for device readings, alert FSM state, conflict state, and audit records. The experience pack SHALL NOT store authoritative device truth.

#### Scenario: Pack token change

- **WHEN** experience pack tokens or copy change
- **THEN** device readings and FSM state SHALL remain unchanged
