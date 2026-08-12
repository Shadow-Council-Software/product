## ADDED Requirements

### Requirement: Layout Studio floor editing

Layout Studio SHALL let an operator edit per-floor room polygons (vertex drag, add/delete room, room kind) over an aligned source-document underlay, and save each floor to its layout JSON without hand-editing.

#### Scenario: Vertex adjustment round-trip

- **WHEN** the operator drags a room vertex on the main floor and saves
- **THEN** the floor layout JSON SHALL persist the updated polygon

### Requirement: Layout Studio compile pipeline

Layout Studio SHALL compile saved floor layouts into the Unity layout artifacts via the existing compile pipeline, so edits are reflected in the Unity extrusion without manual steps.

#### Scenario: Compile after save

- **WHEN** the operator triggers compile after saving a floor
- **THEN** the compiled Unity layout artifacts SHALL reflect the saved polygons

### Requirement: Sources alignment manifest

Layout Studio SHALL persist scan-alignment metadata (offset, scale) for source documents in `layouts/sources/manifest.json`, keeping underlay alignment reproducible across sessions.

#### Scenario: Alignment persists

- **WHEN** the operator adjusts underlay alignment and saves the manifest
- **THEN** reopening the floor SHALL restore the same underlay alignment
