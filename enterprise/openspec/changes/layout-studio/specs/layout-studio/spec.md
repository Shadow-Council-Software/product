## ADDED Requirements

### Requirement: Layout Studio editing workflow

Project SHALL provide a Layout Studio web app for aligning source documents, editing per-floor room polygons, and compiling layouts to Unity without hand-editing JSON.

#### Scenario: Edit and save a floor

- **WHEN** an operator loads a floor, adjusts a room polygon vertex, and saves
- **THEN** Layout Studio SHALL persist the per-floor layout JSON via the HTTP API

#### Scenario: Source document underlay

- **WHEN** a source document is registered in `layouts/sources/manifest.json`
- **THEN** Layout Studio SHALL render it as a canvas underlay for assisted tracing

#### Scenario: Compile to Unity

- **WHEN** the operator triggers the compile pipeline
- **THEN** Layout Studio SHALL produce an updated layout consumable by the Unity extrusion
