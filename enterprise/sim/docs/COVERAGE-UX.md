# Outdoor coverage UX — Unity + LCARS

The digital twin supports **planning and auditing** Nest camera coverage before hardware install. Unity visualizes FOV cones; Sim Bridge reports gaps; LCARS will surface uncovered perimeter segments (future `ops.security` screen).

## Owner device registry (current)

| Device ID | Status | Location | UX role |
|-----------|--------|----------|---------|
| `sec.nest.doorbell.main` | **Installed** | Main door — Nest Doorbell 3rd gen | Entry / doorbell tile |
| `sec.nest.basement` | **Installed** | Basement (placeholder footprint) | Sublevel monitoring |
| `sec.nest.garage.floodlight` | **Planned** | Garage roof + dual rain lights | Driveway / exterior |
| `sec.nest.garage.indoor` | **Planned** | Garage interior | Garage indoor |

| `env.nest.thermostat.primary` | **Installed** | Central hall — kitchen-adjacent, faces front | Environmental LCARS + Matter sim (`env.nest.primary`) |

Environmental Matter sim is anchored to the owner **Nest Learning Thermostat (latest gen)** in central hall — not a separate simulated placement.

## Coverage workflow

1. **Layout** — devices in `onimurasame-residence-2026-05-24.json` with `coverage` FOV + range.
2. **Sim Bridge** — `GET /sim/coverage/report` samples exterior perimeter, returns `% covered` + gap points.
3. **Unity** — `CoverageVisualizer.cs` draws FOV wedges; red markers on gaps.
4. **LLM** — reads report + visual aid capture when advising camera placement.
5. **LCARS** — `uxRole` on each device maps to future security tiles.

## API

```bash
curl http://127.0.0.1:3002/sim/devices
curl http://127.0.0.1:3002/sim/coverage/report
```

## Refinement needed (no hardware)

- **Basement** — provide basement plan or nest room location for precise anchor.
- **Garage** — measured garage footprint + mount height for floodlight cam.
- **Perimeter** — replace `exterior-perimeter` polygon with lot line when available.
- **Additional exterior cams** — add `devices[]` entries as you plan full house wrap.

Goal: iterate in Unity until `coveragePercent` meets target, then install hardware to match model.
