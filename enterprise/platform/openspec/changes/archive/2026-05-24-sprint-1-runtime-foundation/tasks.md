# Tasks: Sprint 1 runtime foundation

## 1. Monorepo scaffold

- [x] 1.1 Create `enterprise/runtime/package.json` with workspaces
- [x] 1.2 Scaffold `lcars-web` via `npm create vite@latest -- --template react-ts`
- [x] 1.3 Create `packages/matter-port` with MatterAdapterPort types from architecture.md
- [x] 1.4 Create `packages/event-envelope` and `packages/tng-outcomes` type guards
- [x] 1.5 Add root `docker-compose.yml` stub (engine + lcars-web; sidecar profile optional)

## 2. Matter adapter (mock)

- [x] 2.1 Implement `MockMatterAdapter` with synthetic `env.nest.primary` node
- [x] 2.2 Emit `attribute_updated` on timer for freshness demos
- [x] 2.3 Stub `OhfSidecarAdapter` class (throws unless `MATTER_ADAPTER=ohf`)

## 3. Engine core

- [x] 3.1 Fastify boot with health route
- [x] 3.2 `GET /api/v1/stations` from adapter read model
- [x] 3.3 `WS /api/v1/events/stream` envelope v1 events
- [x] 3.4 Clearance middleware (Captain/Crew/Guest)
- [x] 3.5 Alert FSM module (engine-owned); expose `GET /api/v1/alerts`
- [x] 3.6 SQLite registry + audit table migrations (minimal)

## 4. LCARS sprint 1

- [x] 4.1 Okuda token CSS variables from visual foundation certificate
- [x] 4.2 `ClearanceOverlay` component (W-CT-01)
- [x] 4.3 `BattleStationsConfirm` gate UI (W-CT-03)
- [x] 4.4 `chrome.session` clearance label (W-CT-02)
- [x] 4.5 Wire TanStack Query + event stream hook

## 5. Verification & gates

- [x] 5.1 Contract test W-CT-03 — config cannot disable Battle Stations gate
- [x] 5.2 Contract test W-CT-01 — Guest denial path
- [x] 5.3 Contract test W-CT-02 — contrast token floor
- [x] 5.4 `openspec validate --all --strict` passes
- [x] 5.5 Document dev startup in `runtime/README.md`

## 6. OpenSpec archive prep

- [x] 6.1 Review spec deltas match implementation
- [ ] 6.2 `/opsx:archive sprint-1-runtime-foundation` after PR merge
