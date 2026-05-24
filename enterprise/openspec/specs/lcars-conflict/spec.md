# lcars-conflict Specification

## Purpose

Conflict reconciliation UX and engine conflict signals (W-CT-05, ART-02/03 entry).

## Requirements

### Requirement: [Contract:W-CT-05] ConflictReconcile no Command during CONFLICT

When engine reports CONFLICT state, LCARS SHALL disable setpoint and actuation commands until reconcile completes.

#### Scenario: CONFLICT blocks command

- **WHEN** ConflictDetected envelope received
- **THEN** setpoint controls SHALL be disabled and ConflictReconcile modal SHALL be shown

### Requirement: Conflict detection signal

Engine SHALL emit ConflictDetected envelope when authority divergence is detected per coexistence policy.

#### Scenario: Google vs enterprise write window

- **WHEN** competing writes occur within policy window
- **THEN** engine SHALL emit ConflictDetected with both authority labels
