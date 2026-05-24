## ADDED Requirements

### Requirement: Sprint 1 component inventory

LCARS sprint 1 SHALL ship components `ClearanceOverlay`, `BattleStationsConfirm`, and chrome session clearance label required by W-CT-01–03.

#### Scenario: Storybook or test harness mount

- **WHEN** components render in isolation at 1280×720
- **THEN** all three components SHALL mount without runtime errors

### Requirement: W-CT automated coverage

Repository SHALL include automated tests mapped to W-CT-01, W-CT-02, and W-CT-03 in CI.

#### Scenario: CI gate

- **WHEN** merge pipeline runs on sprint 1 branch
- **THEN** W-CT-01–03 tests SHALL execute and block merge on failure
