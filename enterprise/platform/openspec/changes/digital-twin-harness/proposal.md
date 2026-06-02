# Proposal: Digital twin house harness (Unity + Sim Bridge)

## Why

Sprint 2 rack tasks (#30/#31) require hardware not available on dev Mac. Operator needs **visual parity** with the real house and **LLM-enriched** LCARS interaction without live Nest or OHF sidecar.

## What Changes

- **Sim Bridge** — spatial physics + layout API + LLM visual aid store (`enterprise/sim/bridge/`)
- **SimMatterAdapter** — `MATTER_ADAPTER=sim` connects engine to Sim Bridge (replaces hardware)
- **House layout schema** — measured JSON for 100% floor-plan parity when operator provides docs
- **Unity harness** — 3D visualization, station markers, visual aid capture POST
- **Documentation** — layout ingestion, LLM visual aid protocol

## Capabilities

### New Capabilities

- `digital-twin-harness` — sim bridge, layout schema, Unity integration

### Modified Capabilities

- `matter-adapter` — ADD SimMatterAdapter (`sim` mode)
- `runtime-monorepo` — document sim dev stack

## Gates & contracts

| Tag | Scope |
|-----|--------|
| — | No new W-CT; supports existing Environmental/conflict demos without hardware |

## Non-goals

- Photoreal Unreal build (protocol-compatible later)
- Matter protocol emulation at packet level
- Replacing ART-01 live Nest scenarios

## Hardware substitution

| Real | Simulated |
|------|-----------|
| Nest thermostat | Spatial station `env.nest.primary` |
| OHF sidecar | Sim Bridge spatial tick |
| Google Home write | `POST /sim/simulate/google-setpoint` |
| Rack W0 | Layout validation + Unity walkthrough |
