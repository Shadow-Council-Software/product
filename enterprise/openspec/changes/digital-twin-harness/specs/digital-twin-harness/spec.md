## ADDED Requirements

### Requirement: Digital twin harness

Project SHALL provide Sim Bridge + Unity house harness for software-only spatial simulation and LLM visual aids.

#### Scenario: Layout-driven stations

- **WHEN** house-layout.json defines station positions
- **THEN** Sim Bridge SHALL expose matching stationId anchors to Unity and SimMatterAdapter

#### Scenario: Visual aid for agents

- **WHEN** Unity posts visual aid capture
- **THEN** Sim Bridge SHALL persist latest capture retrievable via GET `/sim/visual-aid/latest`
