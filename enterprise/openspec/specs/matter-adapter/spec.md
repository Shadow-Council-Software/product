# matter-adapter Specification

## Purpose

Normative Matter integration boundary (D-12). Implements ADR-MA-01–04 and [`architecture.md`](../../architecture.md) MatterAdapterPort.

## Requirements

### Requirement: MatterAdapterPort interface

The engine SHALL depend on `MatterAdapterPort` for all Matter operations. Direct sidecar imports outside adapter implementations are forbidden.

#### Scenario: Adapter swap

- **WHEN** sidecar migrates from python-matter-server to matterjs-server
- **THEN** engine domain code SHALL require no changes beyond adapter configuration

### Requirement: Sidecar isolation

Matter fabric credentials and CASE operations SHALL exist only in the sidecar process (ADR-MA-01).

#### Scenario: LCARS network inspection

- **WHEN** LCARS web client traffic is captured
- **THEN** no WebSocket connection to sidecar port SHALL be present

### Requirement: Attribute path convention

Matter attributes SHALL be addressed as `endpoint_id/cluster_id/attribute_id` strings (e.g. `1/513/0` for Thermostat local temperature).

#### Scenario: Nest read path

- **WHEN** reading Environmental temperature for Nest 4th gen
- **THEN** adapter SHALL use capability profile paths from Matter Survey baseline

### Requirement: Subscription-driven freshness

The adapter SHALL propagate sidecar `attribute_updated` events to the engine; the engine SHALL NOT poll Matter per LCARS tile render.

#### Scenario: [Gate:G3] Freshness without poll

- **WHEN** Google Home changes setpoint
- **THEN** engine read model SHALL update within 15s p95 without LCARS polling sidecar

### Requirement: Sidecar reconnect policy

On sidecar disconnect, the adapter SHALL apply exponential backoff reconnect and emit `sidecar_disconnected` / `sidecar_reconnected` events.

#### Scenario: Stale during disconnect

- **WHEN** sidecar is disconnected for more than policy threshold
- **THEN** affected stations SHALL transition to PENDING or OFFLINE — not silent Green

### Requirement: Mock adapter sprint 1

A `MockMatterAdapter` implementation SHALL satisfy MatterAdapterPort for CI and LCARS sprint 1 without live Nest.

#### Scenario: W-CT contract tests without hardware

- **WHEN** CI runs with `MATTER_ADAPTER=mock`
- **THEN** engine SHALL boot and emit synthetic Nest-like attribute events

### Requirement: MockMatterAdapter synthetic Nest

MockMatterAdapter SHALL register station `env.nest.primary` with Thermostat attribute `1/513/0` and emit periodic `attribute_updated` events.

#### Scenario: Sprint 1 demo loop

- **WHEN** engine starts with `MATTER_ADAPTER=mock`
- **THEN** `getStations()` SHALL return one available Nest-like station within 1s

### Requirement: OhfSidecarAdapter stub

OhfSidecarAdapter SHALL connect to OHF sidecar via WebSocket and implement full MatterAdapterPort for live Nest operations.

#### Scenario: Live W0 connect

- **WHEN** `MATTER_ADAPTER=ohf` and sidecar is healthy
- **THEN** adapter SHALL connect and return real station snapshots within 5s

#### Scenario: Sidecar unreachable

- **WHEN** `MATTER_ADAPTER=ohf` and sidecar is down
- **THEN** engine startup SHALL fail with UnableToComply diagnostic
