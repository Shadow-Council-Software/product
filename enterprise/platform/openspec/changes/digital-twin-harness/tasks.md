# Tasks: Digital twin harness

## 1. Sim Bridge

- [x] 1.1 Spatial engine with layout load + temperature tick
- [x] 1.2 REST API spatial-state, setpoint, google simulate
- [x] 1.3 Visual aid store + GET/POST endpoints
- [x] 1.4 WS `/sim/events/stream`
- [x] 1.5 Layout validation script

## 2. Engine integration

- [x] 2.1 SimMatterAdapter implementing MatterAdapterPort
- [x] 2.2 `MATTER_ADAPTER=sim` in create-adapter
- [ ] 2.3 Integration test (sim bridge required)

## 3. Layout & docs

- [x] 3.1 house-layout.schema.json
- [x] 3.2 house-layout.example.json
- [x] 3.3 LAYOUT-INGESTION.md
- [x] 3.4 LLM-VISUAL-AID.md

## 4. Unity harness

- [x] 4.1 Project README + script scaffold
- [x] 4.2 HouseLayoutLoader (room extrusion + markers)
- [x] 4.3 SimBridgeClient poll loop
- [x] 4.4 VisualAidCapture POST pipeline
- [ ] 4.5 Operator layout import (waiting on house measurements)

## 5. Verification

- [x] 5.1 Sim README quick start
- [x] 5.2 docker-compose sim profile
- [x] 5.3 openspec validate --strict
- [x] 5.4 GitHub epic + issues (#55)

## 6. Operator deliverable (your input)

- [x] 6.1 Provide floor plan + coordinates → `onimurasame-residence-2026-05-24.json`
- [ ] 6.2 Scale verification walkthrough in Unity

## 7. Sim UX Sprint 1 (companion spec)

- [x] 7.1 `sim-ux-specification.md` — Party Mode Rounds 1–3
- [x] 7.2 Renderer ports in `architecture.md` (C-SIM-06)
- [x] 7.3 `renderer-capabilities-descriptor.yaml` + `engine-parity.certificate.yaml`
- [x] 7.4 `HealthStripRenderer.cs` + `HarnessAutoBootstrap.cs`
- [x] 7.5 `verify-sprint1-proof.mjs` CLI gate
- [ ] 7.6 Unity Play Mode proof — HealthStrip vs live FSM (SIM-AC-02)
- [ ] 7.7 okudaAudit capture — render target + frame (SIM-AC-05)
- [ ] 7.8 Okuda council sign-off on sim spec
