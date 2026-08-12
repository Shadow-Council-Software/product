## ADDED Requirements

### Requirement: Matterport mesh ingest pipeline

Project SHALL provide a repeatable pipeline that aligns Matterport OBJ geometry to the traced survey layout and publishes it for engine consumers.

#### Scenario: Ingest from inbox

- **WHEN** a Matterpak bundle is placed in `layouts/matterport/inbox/` with an alignment manifest
- **THEN** the `matterport-ingest` CLI SHALL publish assets and merge a `geometry` block into `house-layout.json`

#### Scenario: Parity report

- **WHEN** ingest completes
- **THEN** the CLI SHALL emit a parity report with PASS/FAIL results against the ≤1 cm wall tolerance targets

#### Scenario: Engine-agnostic geometry access

- **WHEN** an engine consumer requests `GET /sim/geometry/manifest`
- **THEN** Sim Bridge SHALL return the published geometry manifest

#### Scenario: Unity mesh loading

- **WHEN** the Unity harness starts with published geometry available
- **THEN** `MatterportMeshLoader` SHALL load the geometry (bounds proxy MVP) via Sim Bridge or StreamingAssets
