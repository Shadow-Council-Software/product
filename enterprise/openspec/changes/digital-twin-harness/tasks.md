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

- [ ] 6.1 Provide floor plan + coordinates → `house-layout.json`
- [ ] 6.2 Scale verification walkthrough in Unity
