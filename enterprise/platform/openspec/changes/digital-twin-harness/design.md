# Design: Digital twin harness

## Decisions

### D-DT-01: Unity primary, Unreal optional

Unity for iteration speed and LCARS side-by-side workflow. Sim Bridge protocol is engine-agnostic for future Unreal.

### D-DT-02: Sim Bridge as spatial source of truth

Separate process (port 3002) decouples 3D harness from Matter engine. Unity and `SimMatterAdapter` both consume it.

### D-DT-03: Layout JSON schema

Operator supplies measured `house-layout.json`. Schema version 1; rooms as XZ polygons; stations with 3D anchors.

### D-DT-04: LLM visual aids

Unity POSTs captures to `/sim/visual-aid`. Agents GET `/sim/visual-aid/latest` before LCARS guidance.

### D-DT-05: MATTER_ADAPTER=sim

Third adapter mode alongside mock and ohf. CI continues mock; dev/demo uses sim when bridge running.

## Dev stack

```
sim-bridge :3002 → engine (sim) :3001 → lcars :5173
Unity Play → sim-bridge (spatial + captures)
```
