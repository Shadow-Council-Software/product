## ADDED Requirements

### Requirement: MockMatterAdapter synthetic Nest

MockMatterAdapter SHALL register station `env.nest.primary` with Thermostat attribute `1/513/0` and emit periodic `attribute_updated` events.

#### Scenario: Sprint 1 demo loop

- **WHEN** engine starts with `MATTER_ADAPTER=mock`
- **THEN** `getStations()` SHALL return one available Nest-like station within 1s

### Requirement: OhfSidecarAdapter stub

OhfSidecarAdapter SHALL exist as a typed stub delegating to `@matter-server/ws-client` but MAY remain unconnected until sprint 2.

#### Scenario: Sprint 1 build

- **WHEN** `MATTER_ADAPTER=ohf` without sidecar running
- **THEN** engine SHALL fail startup with explicit UnableToComply diagnostic — not silent mock fallback
