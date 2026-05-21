# Story 1.1 Architecture Decision Records

This record is the canonical source for Story 1.1 decision intent and constraints.

## ADR-S1.1-001 - Full Trace as First-Class Artifact

- **Decision:** Treat full inference trace bundle as a required output, not optional telemetry.
- **Rationale:** Supports reproducibility, incident reconstruction, and equation enrichment.
- **Constraint:** Missing or invalid required trace fields result in `non-promotable` outcome.

## ADR-S1.1-002 - Stream Is Operational, Persisted Trace Is Authoritative

- **Decision:** Real-time stream is a consumption channel; persisted trace remains source of truth.
- **Rationale:** Avoids audit disputes from transient transport issues.
- **Constraint:** Stream and persisted-trace divergence triggers `STREAM_TRACE_MISMATCH` and reconciliation gating.

## ADR-S1.1-003 - Redaction Preserves Completeness Semantics

- **Decision:** Allow `complete-with-redaction` status only when mandatory fields are present and redactions are reason-coded.
- **Rationale:** Preserves privacy/security while maintaining assurance semantics.
- **Constraint:** Missing `redaction_reason_code` on required redacted fields marks trace incomplete.

## ADR-S1.1-004 - Deterministic NFR21 Enforcement

- **Decision:** Enforce ordered fallback and governed hard-stop behavior with explicit eventing.
- **Rationale:** Prevents silent cost overruns and non-deterministic behavior.
- **Constraint:** Silent continuation after policy/budget breach is invalid.

## ADR-S1.1-005 - Compatibility Governance as Release Control

- **Decision:** Compatibility matrix requires named owner, review cadence, and tested rollback SLA.
- **Rationale:** Prevents replay/schema drift in production.
- **Constraint:** Compatibility changes without governance checks block promotion.

## ADR-S1.1-006 - Estimator Failover Safety Loop

- **Decision:** Disable predictive hard-block during estimator SLO breach; re-enable only after sustained recovery.
- **Rationale:** Reduces false-positive denials while retaining runtime protection.
- **Constraint:** Failover beyond 7 days triggers governance escalation and temporary promotion freeze for affected workflow class.

## ADR-S1.1-007 - Evidence References Must Resolve

- **Decision:** CI/release gate enforces resolvable, versioned references for required governance artifacts.
- **Rationale:** Prevents placeholder-only compliance.
- **Constraint:** Missing or unresolved required references fail gate.

## Maintenance Rule

- Update this file and the `Decision Record References` block in `mechanistic-interpreter-testing/epics.md` in the same change to avoid stale or orphaned references.
- Any ADR status change (`active` or `superseded`) MUST include a synchronized update in `mechanistic-interpreter-testing/epics.md` in the same pull request.
