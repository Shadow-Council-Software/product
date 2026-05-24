# Tasks: Sprint 2 — live Environmental loop

## 1. Live W0 & sidecar pin

- [ ] 1.1 Run live W0 on rack (`enterprise/spike/w0/run-w0.mjs` without `--simulate`) — **operator rack**
- [ ] 1.2 Update `w0-spike.certificate.yaml` with rack evidence and `architectureUnblock: true` — **blocked on 1.1**
- [x] 1.3 Pin sidecar image digest in `docker-compose.yml` and document in architecture open items

## 2. OhfSidecarAdapter

- [x] 2.1 Implement connect/disconnect via `@matter-server/ws-client`
- [x] 2.2 Implement getStations, readAttribute, writeAttribute, subscribe
- [x] 2.3 Reconnect backoff + sidecar_disconnected/reconnected events
- [x] 2.4 Engine startup: fail explicit on `MATTER_ADAPTER=ohf` when sidecar unreachable

## 3. Setpoint command API

- [x] 3.1 `POST /api/v1/commands/setpoint` with clearance middleware (Crew+)
- [x] 3.2 Guest denial returns OutcomeType Denied (extends W-CT-01)
- [x] 3.3 Emit SetpointCommanded envelope on success
- [x] 3.4 Contract test: setpoint guest denial + mock write path

## 4. LCARS Environmental

- [x] 4.1 Environmental panel with live temp + setpoint control
- [x] 4.2 Freshness badge from snapshot `freshnessTs` (fail-closed stale)
- [x] 4.3 QuickEnvPin component (W-CT-04)
- [x] 4.4 Wire setpoint POST from LCARS with clearance headers

## 5. Conflict UX

- [x] 5.1 Engine conflict detection stub → ConflictDetected envelope
- [x] 5.2 ConflictReconcile modal (W-CT-05)
- [x] 5.3 Disable command controls during CONFLICT state

## 6. ART-01 harness (D-13 entry)

- [x] 6.1 Scaffold `enterprise/runtime/harness/art-01/` with T1-01 scenario
- [x] 6.2 CI job optional profile for sidecar + ohf adapter

## 7. Verification & gates

- [x] 7.1 Contract test W-CT-04 — QuickEnvPin Green-only width
- [x] 7.2 Contract test W-CT-05 — no command during CONFLICT
- [x] 7.3 `openspec validate --all --strict` passes
- [x] 7.4 Document live dev startup in `runtime/README.md`

## 8. GitHub tracking

- [x] 8.1 Create Sprint 2 epic + task issues (mirror tasks 1.1–7.4)
- [x] 8.2 Milestone Sprint 2 — Live Environmental loop
