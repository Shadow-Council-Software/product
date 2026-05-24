# Proposal: Sprint 1 runtime foundation

## Why

Architecture (D-01) and OpenSpec baseline are complete. Implementation must start with a deterministic foundation: monorepo scaffold, engine skeleton, mock Matter adapter, and LCARS security composites — without blocking on live Nest (sprint 2).

## What Changes

- Create `enterprise/runtime/` npm workspaces monorepo (engine, lcars-web, packages)
- Implement `MatterAdapterPort` types and `MockMatterAdapter`
- Boot Fastify engine with `/api/v1/stations`, `/api/v1/events/stream`, clearance middleware
- Scaffold LCARS with `ClearanceOverlay`, `BattleStationsConfirm`, alert chrome stubs
- Wire CI contract tests W-CT-01–03 against specs

## Capabilities

### New Capabilities

- `runtime-monorepo` — workspace layout, Docker compose stub, dev scripts

### Modified Capabilities

- `matter-adapter` — ADD runtime mock adapter behavior and env switch
- `lcars-security` — ADD concrete component acceptance scenarios for sprint 1
- `station-api` — ADD minimal endpoint set implemented in sprint 1

## Impact

- New code under `enterprise/runtime/`
- No change to sidecar production image pin until live W0 on rack
- OpenSpec specs gain sprint-1 implementation deltas; archive after merge

## Gates & contracts in scope

| Tag | Scope |
|-----|--------|
| W-CT-01 | ClearanceOverlay E2E |
| W-CT-02 | chrome.session contrast contract |
| W-CT-03 | BattleStationsConfirm non-skippable |
| G3 | Partial — mock freshness only; live Nest deferred sprint 2 |

## Non-goals

- Live Nest commissioning (sprint 2)
- ART-01 CI harness D-13
- Full Environmental loop UI (sprint 2)
