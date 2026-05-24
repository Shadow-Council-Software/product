## ADDED Requirements

### Requirement: Runtime monorepo workspace

The implementation SHALL live under `enterprise/runtime/` as an npm workspaces root with packages `engine`, `lcars-web`, and shared packages under `packages/`.

#### Scenario: Developer bootstrap

- **WHEN** developer runs install from `enterprise/runtime/`
- **THEN** engine and lcars-web dependencies SHALL resolve via workspace links

### Requirement: MATTER_ADAPTER environment switch

The engine SHALL select Matter adapter implementation via `MATTER_ADAPTER` environment variable with values `mock` (default) or `ohf`.

#### Scenario: CI default

- **WHEN** `MATTER_ADAPTER` is unset in CI
- **THEN** engine SHALL use `MockMatterAdapter`
