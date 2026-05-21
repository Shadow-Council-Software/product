---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
inputDocuments:
  - "/Users/onimurasame/workspaces/product/mechanistic-interpreter-testing/prd.md"
  - "/Users/onimurasame/workspaces/product/mechanistic-interpreter-testing/architecture.md"
  - "/Users/onimurasame/workspaces/product/mechanistic-interpreter-testing/prd-validation-report.md"
---

# product - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for product, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

### Domain and Language Boundary

- **Primary domain:** Assurance-Oriented Inference Systems (AOIS) within the scientific/developer-tool context defined in `prd.md`.
- **Domain language rule:** Story wording MUST use AOIS-relevant terminology and avoid generic technical jargon that is not mapped to domain meaning.
- **Canonical glossary:** `glossary.md` is the source of truth for approved domain terms, aliases, and statuses.
- **Term mapping rule:** Every domain-significant term MUST be either:
  - defined in an existing glossary/domain artifact,
  - referenced to a canonical project source (`prd.md`, `architecture.md`, `evidence-decision-matrix.md`, ADRs), or
  - explicitly defined inline at first use.
- **Review gate:** Any story containing unmapped or domain-ambiguous terminology fails approval until terms are mapped.
- **Conflict precedence:** When terms or intent conflict across artifacts, apply this order: ADRs -> PRD -> Epic/Story text -> glossary aliases.
- **Domain boundary exit criteria (binary):**
  1. All domain-significant terms in the story are defined or mapped.
  2. No deprecated term is used as a primary term.
  3. Every control/governance claim links to a canonical source.
  4. Domain Integrity Evidence section is fully populated.
  5. Story AC language is domain-outcome first, mechanism second.
  6. Undefined or ambiguous terms count is zero.

### Domain Integrity Methodology (Mandatory)

- **Methodology-first principle:** Domain language MUST be defined and validated before being used in requirements, stories, acceptance criteria, ADRs, and evidence artifacts.
- **Utilize existing methodologies:** Domain definition and maintenance MUST continuously use existing project methodologies and artifacts, including:
  - PRD domain sections and AOIS framing (`prd.md`)
  - architecture glossary and decision constraints (`architecture.md`)
  - evidence/decision traceability mappings (`evidence-decision-matrix.md`)
  - story-level ADR references (`decision-records/story-1-1-adr.md` and successors)
- **Lifecycle rule:** For every new domain concept, teams MUST execute this order:
  1. Define term and domain meaning
  2. Map term to canonical source artifact
  3. Validate consistency with existing domain model
  4. Use term in story and implementation artifacts
- **Maintenance rule:** Domain glossary and mappings MUST be updated in the same change where new domain terms are introduced.
- **Invalidation rule:** Any documentation or story that uses undefined, unmapped, or domain-inconsistent language is considered invalid and cannot be approved.

## Requirements Inventory

### Functional Requirements

FR1: An Orchestration Engineer can create an equation artifact from a natural-language prompt.
FR2: An Orchestration Engineer can derive an equation artifact from a completed inference trace.
FR3: An Orchestration Engineer can view, compare, and branch equation artifact versions while preserving lineage to parent artifacts.
FR4: The system can attach immutable provenance metadata to every equation artifact (inputs, policy snapshot identity, model and tool identities, timestamps, and correlation identifiers).
FR5: An Orchestration Engineer can export an equation artifact and its evidence bundle for external review or archival.
FR6: The system can interpret equation artifacts through a mechanistic interpreter that produces structured, schema-valid intermediate representations.
FR7: An Orchestration Engineer can inspect mechanistic interpretation outputs and decision reason codes for a given run.
FR8: The system can enforce, per policy, one of these dispositions for unknown or indeterminate interpreter states: block execution; defer with explicit hold state; escalate for human review; or allow bounded-risk continuation with mandatory logging. None of these may be treated as silent passage as valid.
FR9: The system can execute orchestration using a hosted inference lane under tenant policy.
FR10: An ML or Platform Operator can configure which workloads are allowed on the hosted lane for a tenant or environment.
FR11: The system can record a complete decision trace for each hosted inference execution relevant to assurance.
FR12: An Orchestration Engineer can replay a prior execution from a pinned equation artifact, inputs, and policy snapshot within a declared replay envelope.
FR13: The system can detect replay divergence and classify root cause for diagnosis.
FR14: An Incident or Support Engineer can reconstruct a production incident timeline from stored traces and replay artifacts.
FR15: The system can produce a reproducible quickstart demonstration that runs end-to-end from artifact creation through replay and evidence output.
FR16: An Orchestration Engineer can run equivalence validation between a candidate artifact and a reference baseline using strict or governed semantic comparators.
FR17: An Assurance Analyst can approve or block promotion of a workflow based on replay, equivalence, and mutation evidence.
FR18: The system can enforce that critical-path promotions cannot proceed without passing required gates.
FR19: An Assurance Analyst can record a signed decision with rationale linked to the evidence bundle.
FR20: The system can run mutation analysis against equation or interpreter-critical surfaces and produce operator-level results.
FR21: An Orchestration Engineer can view mutation results and map surviving mutants to affected functions or rules.
FR22: The system can block promotion when mutation thresholds for the flagship workflow are not met.
FR23: An ML or Platform Operator can define and version policies for data handling, model allowlists, and lane usage for hosted execution.
FR24: The system can evaluate policy before inference execution and deny or reroute requests that violate policy.
FR25: An Assurance Analyst or auditor can export an audit-oriented evidence package for a selected run or promotion decision.
FR26: The system can maintain an append-only evidence log suitable for integrity verification.
FR27: An Integration Developer can invoke artifact creation, replay, equivalence, and mutation gates through stable programmatic interfaces.
FR28: An Integration Developer can integrate gate pass or fail outcomes into a CI or CD pipeline for the flagship workflow.
FR29: The system can notify integrators of schema or contract changes that affect programmatic consumers.
FR30: A Technical Author or Research Lead can publish a whitepaper-grade methodology document from the product's documented assumptions, methods, and limitations.
FR31: A Technical Author or Research Lead can publish a thesis-grade technical specification covering interpreter semantics, equivalence model, mutation methodology, and evidence model.
FR32: A Technical Author or Research Lead can publish a reproducibility protocol that allows independent replication of reported results using the product's artifacts and traces.
FR33: An ML or Platform Operator can enable a self-hosted inference lane for eligible tenants or workloads (post Phase 1).
FR34: The system can run parity validation between hosted and self-hosted lanes for the same governed workload class (post Phase 1).
FR35: The system can compute and store a trace completeness score for each run and block promotion when completeness falls below the flagship workflow threshold.
FR36: The system can enforce policy checks before exporting or sharing evidence bundles outside the tenant boundary.
FR37: An ML or Platform Operator can register, version, and deprecate equivalence comparators; the system can require impact review before activating a new comparator version for production gates.
FR38: The system can prohibit silent fallback from the mechanistic interpreter path to a non-mechanistic path unless an explicit policy allows it and the fallback is logged in the decision record.
FR39: An Assurance Analyst can issue a time-bounded promotion override with reason code; the system can require post-hoc review before the override can recur for the same gate class.
FR40: The system can enforce tenant isolation for all stored artifacts, traces, and evidence queries.
FR41: An ML or Platform Operator can rotate and revoke credentials used for hosted inference and programmatic interfaces.
FR42: The system can support replay of historical artifacts across supported schema versions using declared migration or compatibility shims validated by conformance tests.
FR43: A Product Owner can view dashboard status of program gates G1, G2, and G3 per partner cohort.
FR44: The system can emit a structured report artifact for each program gate evaluation with pass, fail, or incomplete status.
FR45: The system can verify integrity of stored evidence bundles and reject or flag tampered records on read.
FR46: The system can assign canonical ordering and trusted timestamps to all decision-record events.
FR47: An ML or Platform Operator can configure quotas and admission control for replay and mutation workloads per tenant.
FR48: An ML or Platform Operator can halt hosted orchestration execution for a tenant or globally; the system records actor, scope, duration, and reason in immutable audit evidence.
FR49: The system can enforce model allowlist freshness rules (expiry, review, or deprecation) before execution.
FR50: The system can promote a release only as an atomic bundle of equation artifact version, policy snapshot, and comparator configuration where required by the flagship workflow.
FR51: A Tenant Administrator can configure customer-managed encryption keys for evidence at rest where the product supports that deployment mode.
FR52: An Orchestration Engineer can record a declared manual change to an artifact; the system can require full re-execution of promotion gates after such a change.
FR53: An Orchestration Engineer can transition an equation artifact through governed lifecycle states draft, validation-in-progress, eligible-for-promotion, promoted, and retired, with mandatory evidence attachments per transition where required by policy.
FR54: When mechanistic interpretation cannot be completed, the system can produce a structured non-promotable outcome with required remediation steps (no silent downgrade to ungoverned execution for gated workflows).
FR55: An Orchestration Engineer can define and attach a replay envelope declaration to an artifact (declared allowed dependencies, side-effect class, and environment assumptions) for a flagship workflow.
FR56: The system can notify designated stakeholders when a promotion gate fails or when an emergency stop is activated (channels configurable per tenant policy).
FR57: A third-party reviewer can independently verify an exported evidence bundle's integrity and referenced versions using documented verification steps (offline-capable where applicable).
FR58: The system can produce a cryptographic attestation for an evidence bundle suitable for external verification, using at least one documented mechanism (signed manifest or hash-chain root) consistent with the verification procedure in FR57.

### NonFunctional Requirements

NFR1: Delivery follows the sequencing principle of correctness and assurance validity first, then quality hardening, then optimization; quantitative SLOs are introduced only after validation on real traces.
NFR2: During early validation, record p50/p95/p99 latency distributions for interpreter, replay, and gate pipelines.
NFR3: Adopt defense-in-depth, default-deny security posture with explicit threat modeling and continuous hardening.
NFR4: Enforce strong logical tenant isolation across data, metadata, credentials, and administrative actions.
NFR5: Support encryption in transit and at rest, with customer-managed keys where deployment mode allows.
NFR6: Enforce least-privilege access and auditable elevation paths.
NFR7: Track dependencies and vulnerabilities, and use signed artifacts plus reproducible build practices for assurance-critical releases.
NFR8: Log security-relevant events immutably and correlate them to execution and promotion evidence.
NFR9: Produce a dedicated security specification with mandatory controls and compliance mapping, including checklist IDs SEC-CTRL-001 through SEC-CTRL-006.
NFR10: Embed a mechanistic-interpreter-discoverable integrity marker derived from build and assurance metadata, including sequencing quote payload requirements, with anti-tamper binding defined in the security specification.
NFR11: Define RPO/RTO, backup-restore drills, and multi-site posture through dedicated reliability review before production commitments, with checklist IDs REL-DR-001 through REL-DR-004.
NFR12: Maintain durability of promotion and audit evidence across planned and unplanned failures once reliability targets are set.
NFR13: Support tenant-level quotas and fairness controls for replay and mutation workloads.
NFR14: Support horizontal scaling of gate workers without weakening tenant isolation or audit integrity.
NFR15: Maintain backward compatibility for public programmatic interfaces within a declared versioning policy; breaking changes require migration guidance and conformance tests.
NFR16: Gate integrations fail with actionable, machine-readable diagnostics suitable for automated pipelines.
NFR17: Published methodology and results are reproducible from stored artifacts, traces, and documented protocols.
NFR18: Performance and security claims in scientific materials are bounded to validated configurations and threat models.
NFR19: WCAG-aligned accessibility requirements apply from Phase 2 onward for user-facing surfaces, unless a public UI ships earlier.
NFR20: Deferred metric obligations must be closed at specified gates with named measurement artifacts and owners.
NFR21: The system must enforce token-economy controls for resource-constrained operation, including per-workflow token budgets, budget overrun alerts, and mandatory optimization/fallback behavior when token thresholds are exceeded.

#### NFR21 Formalization: Token-Economy Control Specification

**Scope**
- Applies to all LLM-orchestrated workflows in this plan, including replay, gate evaluation, and policy-bound inference.
- Covers token lifecycle controls: estimate, reserve, consume, overrun handling, fallback, and audit evidence.
- Excludes deep margin optimization and dynamic pricing strategy in this phase.

**Immediate Decisions (story-blocking, required now)**
1. Canonical budget unit and accounting rule (`input + output` tokens per workflow run).
2. Baseline budget ceilings per workflow class (normal, replay, mutation) in a versioned policy snapshot.
3. Threshold bands and actions (`warn`, `enforce`, `hard-stop`) with no silent pass.
4. Deterministic fallback sequence under scarcity (ordered, reason-coded, auditable).
5. Overrun alert contract (payload, recipients, severity, escalation path).

**Deferred Decisions (explicitly deferred with activation triggers)**
1. Dynamic budget auto-tuning (activate after stable G2 operational evidence).
2. Advanced cross-tenant fairness optimization (activate at multi-tenant scale claims).
3. Real-time provider price arbitration (activate with Phase-2 parity operations).
4. Long-horizon FinOps forecasting optimization (activate post-G3 sustained adoption).
5. Policy simulation sandbox for budget what-if analysis (activate after baseline stability).

**Provisional Defaults (planning defaults, not final commitments)**
- Per-run hard cap: `200000` tokens; soft warning threshold: `80%`.
- Per-tenant daily cap: `5000000` tokens; per-workflow daily cap: `1000000` tokens.
- Burst cap (5-minute window, per tenant): `500000` tokens.
- Retry budget after budget-triggered fallback: max `2` automated retries.
- Enforcement tiers: Observe -> Guarded -> Constrained -> Protection.

**Deterministic Fallback Order**
1. Optimize request shape (trim context and optional payload).
2. Apply lower-cost mode/comparator where policy allows.
3. Defer non-critical workloads before critical-path operations.
4. Throttle admission by tenant/workflow according to active policy.
5. Governed `defer` or `block` outcome with explicit reason code.

**Cross-Epic Ownership**
- Primary owner: Epic 3 (policy-bound operation, quotas, admission control, alerting).
- Required touchpoints: Epic 1 (token-aware replay/interpreter flows), Epic 2 (gate behavior under constrained evidence), Epic 4 (oversight telemetry and reporting), Epic 5 (cost-aware reproducibility and portability claims).

**Required Telemetry and Evidence**
- Required fields: `tenant_id`, `workflow_id`, `run_id`, `policy_snapshot_id`, `reason_code`, `timestamp`, estimated and actual token values.
- Required control events: threshold warning, hard-cap breach, fallback applied, defer/block outcome, override action.
- Required artifacts: budget policy snapshot, overrun alert records, fallback decision records, and linked evidence-bundle references.

**Pre-Story Pass/Fail Gates for NFR21-Affected Stories**
- Story declares cost surface and numeric budget envelope.
- Story links at least one acceptance criterion to NFR21 with objective verification.
- Story defines guardrail mechanism (throttle, fallback, defer, block, or kill switch).
- Story includes observability fields, alert thresholds, and ownership.
- Story includes rollout and rollback conditions tied to cost and reliability signals.
- Story uses only terms that are explained inline, referenced to an existing project artifact, or defined in a glossary entry; undefined terms fail review.

### Additional Requirements

- Use a contract-first local starter for Phase 1 with the sequencing principle: make it work, then good, then fast.
- Epic 1 Story 1 must initialize `mechanistic-interpreter-core` in a local-first structure with contracts, adapters, experiments, and evidence output paths.
- Story 1 implementation language is Python; contracts remain language-agnostic; Rust acceleration is explicitly evidence-gated for later phases.
- Enforce the Story-1 Go condition: Safety, Feasibility, Evidence, Accountability, and PolicyConformance.
- Ensure one-command deterministic local run that emits a run evidence bundle under `experiments/runs/<run_id>/`.
- Guardrail violations must return `BLOCKED` with reason code and no state mutation.
- Record deferred controls explicitly with owner, trigger, and residual risk rather than silently omitting them.
- Maintain capability ownership boundaries and single-writer authority via a capability authority registry.
- All cross-capability interactions must use versioned command/query/event contracts; direct internal-model coupling is forbidden.
- Enforce contract lifecycle states (`provisional`, `stable`) with compatibility checks for promotion.
- Add CI-verifiable controls: contract validation, authority registry sync checks, and forbidden boundary coupling checks.
- Pin and validate `policy_reason_schema_version` in all run evidence bundles; unknown reason codes are treated as blocked incompatibility.
- Keep inspection/dashboard scope read-only against run artifacts; no orchestration control-plane mutation in Phase 1.
- Use local-only baseline infrastructure in Phase 1; production DB, cloud topology, and full auth/authz remain deferred.
- Capture governance traceability chain: Requirement ID -> Contract Clause -> ADR ID -> Evidence Artifact -> Sign-off.
- Publish and enforce the Step-03 to Step-04 handoff artifacts (constraints, deferred list, trade-offs, acceptance criteria, unresolved risks).
- Respect architecture readiness gates IR-01 through IR-08 as implementation-start prerequisites for Story 1.
- Include token-economy policy controls in design and implementation planning so assurance workflows remain operable under constrained token and compute budgets.
- Reject any new technical term that is not explained, referenced to an existing artifact, or added to the project glossary before approval.

### UX Design Requirements

No UX design source document was provided for this step, so no UX-specific requirements were extracted.

### FR Coverage Map

FR1: Epic 1 - Prompt to artifact creation
FR2: Epic 1 - Trace to artifact extraction
FR3: Epic 1 - Artifact versioning and branching
FR4: Epic 1 - Immutable provenance on artifacts
FR5: Epic 1 - Artifact/evidence export
FR6: Epic 1 - Mechanistic interpretation runtime
FR7: Epic 1 - Inspect interpreter outputs and reason codes
FR8: Epic 1 - Unknown-state governed dispositions
FR9: Epic 3 - Hosted lane orchestration execution
FR10: Epic 3 - Hosted lane workload policy controls
FR11: Epic 3 - Hosted execution decision tracing
FR12: Epic 1 - Deterministic replay from pinned inputs/policy
FR13: Epic 1 - Replay divergence classification
FR14: Epic 1 - Incident timeline reconstruction
FR15: Epic 1 - End-to-end reproducible quickstart
FR16: Epic 2 - Equivalence validation execution
FR17: Epic 2 - Assurance approval/block decision
FR18: Epic 2 - Enforced gate requirements for promotion
FR19: Epic 2 - Signed assurance decision records
FR20: Epic 2 - Mutation analysis execution
FR21: Epic 2 - Mutation result inspection and mapping
FR22: Epic 2 - Mutation-threshold promotion blocking
FR23: Epic 3 - Policy versioning/management
FR24: Epic 3 - Policy evaluation and deny/reroute
FR25: Epic 3 - Audit evidence export
FR26: Epic 3 - Append-only evidence log
FR27: Epic 4 - Stable programmatic gate interfaces
FR28: Epic 4 - CI/CD integration of gate outcomes
FR29: Epic 4 - Schema/contract change notifications
FR30: Epic 5 - Whitepaper-grade methodology publication
FR31: Epic 5 - Thesis-grade technical specification publication
FR32: Epic 5 - Reproducibility protocol publication
FR33: Epic 5 - Self-hosted lane enablement
FR34: Epic 5 - Hosted vs self-hosted parity validation
FR35: Epic 2 - Trace completeness scoring and enforcement
FR36: Epic 2 - Policy checks for external evidence sharing
FR37: Epic 2 - Comparator lifecycle governance
FR38: Epic 2 - No silent fallback from mechanistic path
FR39: Epic 2 - Time-bounded override with accountability
FR40: Epic 3 - Tenant isolation enforcement
FR41: Epic 3 - Credential rotation/revocation
FR42: Epic 5 - Cross-version replay compatibility
FR43: Epic 4 - Program gate dashboarding
FR44: Epic 4 - Structured gate evaluation reports
FR45: Epic 2 - Evidence integrity verification
FR46: Epic 3 - Canonical event ordering/timestamps
FR47: Epic 3 - Replay/mutation quotas and admission control
FR48: Epic 3 - Emergency stop with immutable audit record
FR49: Epic 3 - Model allowlist freshness enforcement
FR50: Epic 2 - Atomic promotion bundle enforcement
FR51: Epic 3 - Customer-managed key configuration
FR52: Epic 2 - Manual change declaration and re-gating
FR53: Epic 1 - Artifact lifecycle state transitions
FR54: Epic 1 - Structured non-promotable interpreter failures
FR55: Epic 1 - Replay envelope declaration
FR56: Epic 3 - Gate failure/emergency stakeholder notifications
FR57: Epic 2 - Third-party bundle verification
FR58: Epic 2 - Cryptographic attestation for external verification

## Epic List

### Epic 1: Create and Replay Governed Equation Artifacts
Users can create, extract, inspect, and replay equation artifacts with deterministic evidence and controlled unknown-state handling.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR12, FR13, FR14, FR15, FR53, FR54, FR55.

### Epic 2: Decide Promotion with Evidence-Backed Assurance Gates
Assurance teams can run equivalence and mutation gates, enforce promotion policy, and produce verifiable promotion evidence.
**FRs covered:** FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR35, FR36, FR37, FR38, FR39, FR45, FR50, FR52, FR57, FR58.

### Epic 3: Operate Secure, Policy-Bound, Multi-Tenant Inference
Operators can run hosted orchestration with policy controls, auditability, tenant isolation, emergency controls, and budget-aware resource governance.
**FRs covered:** FR9, FR10, FR11, FR23, FR24, FR25, FR26, FR40, FR41, FR46, FR47, FR48, FR49, FR51, FR56.

### Epic 4: Integrate Assurance into Delivery and Program Oversight
Integration teams can embed gates in CI/CD and product teams can monitor program gates and status reporting.
**FRs covered:** FR27, FR28, FR29, FR43, FR44.

### Epic 5: Publish Scientific Rigor and Expand Deployment Portability
Research and technical teams can publish reproducibility artifacts and extend toward self-hosted parity with schema-compatible replay.
**FRs covered:** FR30, FR31, FR32, FR33, FR34, FR42.

## Epic 1: Create and Replay Governed Equation Artifacts

Users can create, extract, inspect, and replay equation artifacts with deterministic evidence and controlled unknown-state handling.

### Story 1.1: Create Prompt-Derived Equation Artifacts with Full Inference Trace Provenance

As an Orchestration Engineer,
I want to generate an equation artifact from a natural-language prompt while fully capturing and optionally streaming the inference process in real time,
So that equation inputs are maximally enriched, observable during execution, and reproducible for validation, replay, and downstream extraction.

**Acceptance Criteria:**

**Given** valid prompt input and required workflow context
**When** generation executes
**Then** the system creates a unique `artifact_id` in lifecycle state `draft`
**And** the artifact payload validates against the active `artifact_schema_version`.

**Given** a generation run completes
**When** trace persistence executes
**Then** the system stores all mandatory trace fields:
`run_id`, `correlation_id`, `prompt_template_version`, `resolved_prompt_hash_sha256`, `resolved_input_payload_hash_sha256`, `model_provider`, `model_id`, `model_version_or_release`, `inference_parameters`, `tool_call_sequence`, `tool_outputs`, `policy_snapshot_id`, `trace_schema_version`, `started_at`, `completed_at`, `final_output_hash_sha256`, `token_usage_input`, `token_usage_output`, `token_usage_total`
**And** missing mandatory fields fail validation.

**Given** policy disallows raw intermediate reasoning
**When** trace data is persisted
**Then** the system stores `redacted_reasoning_summary` and `redaction_reason_code` only
**And** prohibited raw reasoning content is not persisted.

**Given** hash generation or validation runs
**When** canonicalization is applied
**Then** hashing uses UTF-8, canonical JSON key order, stable number formatting, and schema-defined null inclusion
**And** SHA-256 is computed over canonical bytes for all `*_hash_sha256` fields.

**Given** any mandatory trace field is missing, corrupted, or hash-invalid
**When** persistence validation executes
**Then** the artifact is marked `non-promotable` with error `TRACE_INCOMPLETE_OR_INVALID`
**And** remediation metadata identifies failed field checks.

**Given** provenance fields are written
**When** write, update, or delete is attempted on immutable fields (`artifact_id`, `run_id`, `correlation_id`, hashes, `policy_snapshot_id`, `trace_schema_version`, `created_at`)
**Then** the mutation is blocked with `IMMUTABLE_PROVENANCE_VIOLATION`
**And** an auditable violation record is emitted.

**Given** replay is requested
**When** version compatibility is checked
**Then** `prompt_template_version` and `trace_schema_version` require exact match
**And** `model_version_or_release` requires exact or allowlisted-compatible match from the active compatibility matrix
**And** incompatibility returns `VERSION_INCOMPATIBLE_FOR_REPLAY`.

**Given** NFR21 policy is active
**When** estimated tokens exceed 80% of run cap
**Then** fallback executes in strict order: context trim -> optional tool-call reduction -> lower-cost allowed model tier -> defer non-critical enrichment
**And** event `BUDGET_SOFT_THRESHOLD_CROSSED` is emitted with run and policy references.

**Given** hard-threshold breach is predicted pre-dispatch by internal estimator or reached in-flight by runtime metering
**When** enforcement executes
**Then** generation is blocked (pre-dispatch) or terminated (in-flight) with `BUDGET_HARD_CAP_ENFORCED`
**And** telemetry records `estimator_source`, `estimate_tokens`, `actual_tokens`, and `policy_snapshot_id`.

**Given** a client subscribes to inference streaming before run start
**When** the run is active
**Then** the system emits ordered real-time stream events for lifecycle milestones, tool-call boundaries, token-usage updates, fallback transitions, and completion/failure state
**And** each stream event includes `run_id`, monotonic sequence number, event type, timestamp, and policy/redaction metadata needed for safe consumption.

**Given** stream subscription is active
**When** policy redaction applies
**Then** stream payloads enforce the same redaction rules as persisted traces
**And** prohibited content is never emitted on the stream.

**Given** stream delivery is interrupted
**When** client reconnects with last acknowledged sequence
**Then** the system supports deterministic resume or explicit gap signaling
**And** final persisted trace remains authoritative for reconciliation.

**Given** run finalization executes
**When** observability publishes completion
**Then** exactly one logical `inference_run_recorded` exists per `run_id`
**And** idempotency key `run_id+trace_schema_version+policy_snapshot_id` is enforced with consumer deduplication.

**Given** compatibility governance is active
**When** model, prompt template, or trace schema changes
**Then** Architecture Lead owns compatibility matrix updates and monthly review cadence
**And** rollback to prior approved matrix is executable within 1 hour during compatibility incidents.

**Given** estimator reliability is monitored over trailing 7 days
**When** p95 absolute token estimation error exceeds 20% or p99 exceeds 35%
**Then** predictive hard-block is disabled
**And** system switches to conservative defer plus runtime metering enforcement until SLO is restored and re-enable criteria are met.

**Given** governance evidence is required
**When** run-family evidence package is assembled
**Then** package completeness is validated in CI/release gate for references to `requirement_trace_matrix`, `provenance_schema_required_fields`, `control_ownership_raci`, `verification_evidence_plan`, `decision_log_record`, and `operational_go_no_go_gates`
**And** gate fails if any required reference is missing or unresolved.

**Given** stream events are produced
**When** sequence integrity is evaluated
**Then** `event_seq` remains strictly monotonic for each `run_id`
**And** any sequence gap or reorder marks run `non-promotable` with `STREAM_SEQUENCE_INVALID`.

**Given** stream session lifecycle is evaluated
**When** run completes or fails
**Then** exactly one terminal stream event exists per run (`COMPLETED`, `BLOCKED`, or `FAILED`)
**And** missing terminal event after timeout yields `STREAM_TERMINAL_MISSING`.

**Given** required finalization records are validated
**When** completion gating runs
**Then** fields `tenant_id`, `workflow_id`, `run_id`, `policy_snapshot_id`, `reason_code`, token estimate/actual, and timestamps are non-null
**And** any missing field fails gate.

**Given** budget or policy breach occurs
**When** enforcement path is selected
**Then** only governed outcomes (`defer`, `block`, `terminate`) are permitted
**And** silent continuation is prohibited.

**Given** threshold or integrity alert triggers
**When** alerting dispatch executes
**Then** alert payload is delivered to configured recipients within 60 seconds
**And** delivery SLA breach is recorded as operational check failure.

**Given** estimator failover mode is active
**When** evaluating re-enable eligibility
**Then** predictive hard-block can be re-enabled only after two consecutive daily windows satisfy estimator SLO (`p95 <= 20%`, `p99 <= 35%`)
**And** approval is recorded in decision log.

**Given** evidence-package gate executes
**When** CI/release checks required references
**Then** references `requirement_trace_matrix`, `provenance_schema_required_fields`, `control_ownership_raci`, `verification_evidence_plan`, `decision_log_record`, and `operational_go_no_go_gates` are present and resolvable
**And** gate fails if any reference is missing.
**And** all required references must resolve to versioned artifacts in repository or approved registry; unresolved external placeholders fail gate.

**Given** compatibility matrix update is proposed
**When** governance validation executes
**Then** named owner sign-off, change record, and tested rollback within one hour are required
**And** promotion is blocked if any requirement is unmet.

**Given** streamed records and persisted trace are both available
**When** reconciliation checks detect divergence
**Then** the system emits `STREAM_TRACE_MISMATCH`
**And** marks the run `non-promotable` until reconciliation is completed.

**Given** policy redaction is applied to required trace elements
**When** completeness status is evaluated
**Then** run status may be `complete-with-redaction` only if all mandatory fields are present and each redacted field has a valid `redaction_reason_code`
**And** otherwise the run is treated as incomplete.

**Given** estimator failover mode is active
**When** failover duration exceeds 7 consecutive days
**Then** mandatory governance escalation is triggered
**And** promotion for affected workflow class is temporarily frozen until review resolution.

**Given** a `trace_schema_version` change is proposed
**When** promotion readiness checks execute
**Then** backward-compatibility validation for all mandatory fields must pass
**And** promotion is blocked on compatibility failure.

**Given** CI executes Story 1.1 validation
**When** tests run
**Then** minimum passing suite includes: happy-path trace completeness, policy-redaction, hard-cap breach, hash-corruption, version-mismatch replay, idempotent-event dedup, estimator-SLO failover/re-enable, evidence-package completeness, stream ordering, stream redaction, stream reconnect/resume, and ADR-reference integrity tests.

**Decision Record References:**
- `ADR-S1.1-001` to `ADR-S1.1-007`: [`decision-records/story-1-1-adr.md`](./decision-records/story-1-1-adr.md)
- Story implementation MUST reference these ADR IDs in design notes, test plans, and change records.
- CI MUST verify referenced ADR IDs exist and are unique in the linked ADR document.
- If any ADR is superseded, update this reference block in the same change that updates the ADR file to prevent stale links.

### Story 1.2: Extract Equation Artifacts from Completed Inference Traces

As an Orchestration Engineer,
I want to extract a governed equation artifact from a completed inference trace bundle,
So that successful execution paths can be converted into reusable, versioned artifacts with full lineage and assurance metadata.

**Acceptance Criteria:**

**Given** a completed run with a valid persisted trace bundle
**When** I request extraction
**Then** the system generates a new equation artifact with unique `artifact_id` and lifecycle state `draft`
**And** links it to source `run_id` and source artifact lineage (if present).

**Given** extraction input is evaluated
**When** required trace sections are validated
**Then** extraction proceeds only if mandatory trace segments and hashes are present and valid
**And** invalid input returns deterministic error `EXTRACTION_INPUT_INVALID`.

**Given** multiple eligible traces exist
**When** extraction is performed from a selected source trace
**Then** the generated artifact contains explicit source trace reference and extraction timestamp
**And** no ambiguity exists about which source run produced the artifact.

**Given** policy redaction exists in the source trace
**When** extraction logic resolves equation inputs
**Then** extraction uses only policy-permitted fields and redacted summaries where required
**And** prohibited raw reasoning content is never reconstructed or persisted.

**Given** extraction creates a derived artifact
**When** provenance is written
**Then** immutable provenance includes `source_run_id`, `source_trace_hash`, `extraction_policy_snapshot_id`, `trace_schema_version`, `model_version_or_release`, and `correlation_id`
**And** mutation attempts on immutable provenance are blocked and audited.

**Given** versioning and compatibility rules apply
**When** derived artifact is saved
**Then** the system records compatibility metadata against active prompt, trace, and model compatibility matrix
**And** incompatible extraction context returns `VERSION_INCOMPATIBLE_FOR_EXTRACTION`.

**Given** NFR21 policy is active
**When** extraction or enrichment steps approach budget thresholds
**Then** ordered fallback and hard-cap enforcement follow governed behavior with reason-coded events
**And** extraction never silently bypasses budget controls.

**Given** extraction completes (success or governed failure)
**When** final observability record is emitted
**Then** exactly one logical `extraction_run_recorded` exists per extraction run with idempotency key enforcement
**And** evidence references for traceability and governance are resolvable at CI or release gate.

### Story 1.3: Manage Artifact Lineage and Lifecycle States

As an Orchestration Engineer,
I want to transition equation artifacts through governed lifecycle states with explicit lineage links,
So that artifact evolution is policy-compliant and traceable for promotion decisions.

**Acceptance Criteria:**

**Given** an artifact exists in `draft` state
**When** I request transition to `validation-in-progress`
**Then** transition is allowed only if required provenance and trace references are complete
**And** transition event is recorded with actor, timestamp, and reason code.

**Given** an artifact is in lifecycle processing
**When** a state transition is requested
**Then** only allowed transitions are accepted (`draft -> validation-in-progress -> eligible-for-promotion -> promoted -> retired`)
**And** invalid transition attempts return deterministic error `LIFECYCLE_TRANSITION_INVALID`.

**Given** a derived artifact is created from an existing artifact
**When** lineage is persisted
**Then** parent-child linkage is written immutably with lineage edge type (`derived-from`, `extracted-from`, `manually-modified`)
**And** lineage graph remains queryable by artifact ID and run ID.

**Given** policy requires evidence attachments for specific transitions
**When** transition gate executes
**Then** required evidence references must be present and resolvable
**And** transition is blocked with `EVIDENCE_ATTACHMENT_MISSING` if requirements are unmet.

**Given** an artifact is manually modified
**When** modification is declared
**Then** lifecycle is reset to require full gate re-execution before promotion eligibility
**And** change declaration is attached to lineage and decision references.

**Given** NFR21 constraints are active
**When** lineage graph operations or lifecycle checks exceed soft budget thresholds
**Then** governed fallback is applied without skipping required lifecycle validation
**And** lifecycle integrity remains enforced under constrained mode.

**Given** this story is implemented
**When** audit and governance linkage is validated
**Then** Story 1.3 MUST reference existing controls rather than redefine them, including:
- `evidence-decision-matrix.md` for evidence and decision traceability mapping
- Story 1.1 decision references: [`decision-records/story-1-1-adr.md`](./decision-records/story-1-1-adr.md)
- required evidence-package reference set defined in Story 1.1 (`requirement_trace_matrix`, `provenance_schema_required_fields`, `control_ownership_raci`, `verification_evidence_plan`, `decision_log_record`, `operational_go_no_go_gates`)

### Story 1.4: Execute Deterministic Replay with Replay Envelope Controls

As an Orchestration Engineer,
I want to execute deterministic replay using a declared replay envelope and pinned versions,
So that replay outcomes are reproducible and any divergence is governed, diagnosable, and policy-compliant.

**Acceptance Criteria:**

**Given** a selected equation artifact with linked provenance and trace references
**When** replay is initiated
**Then** replay requires a declared `replay envelope` with dependency, side-effect class, and environment assumptions
**And** replay is blocked with `REPLAY_ENVELOPE_MISSING` if envelope declaration is absent.

**Given** replay envelope and pinned versions are present
**When** replay executes
**Then** the system enforces exact or allowlisted-compatible versions for artifact, policy snapshot, comparator, prompt template, trace schema, and model version
**And** incompatibility returns deterministic error `REPLAY_VERSION_INCOMPATIBLE`.

**Given** deterministic replay runs with identical pinned inputs and envelope
**When** replay is executed repeatedly
**Then** output equivalence and trace integrity must satisfy configured deterministic replay criteria
**And** failed criteria mark run `non-promotable` with reason-coded divergence classification.

**Given** replay produces differences from baseline
**When** divergence analysis executes
**Then** system classifies divergence cause (`policy drift`, `version mismatch`, `input mismatch`, `non-deterministic dependency`, or `unknown`)
**And** emits `REPLAY_DIVERGENCE_CLASSIFIED` with run linkage and evidence pointers.

**Given** NFR21 controls are active
**When** replay approaches soft or hard token thresholds
**Then** replay follows governed fallback and hard-cap behavior without bypassing replay-integrity checks
**And** emits budget control events with reason codes and policy snapshot references.

**Given** replay run finalizes
**When** observability and evidence records are written
**Then** exactly one logical `replay_run_recorded` event exists per replay run with idempotency enforcement
**And** required traceability and governance references resolve at CI or release gate.

**Given** this story is implemented
**When** domain integrity review runs
**Then** all Story 1.4 domain terms are defined or mapped in `glossary.md` and canonical artifacts
**And** any unmapped domain term fails approval.

### Story 1.5: Detect and Classify Replay Divergence with Incident Reconstruction Outputs

As an Incident or Support Engineer,
I want replay divergence to be automatically detected, classified, and packaged with incident reconstruction outputs,
So that root cause can be identified quickly without losing AOIS governance and evidence integrity.

**Acceptance Criteria:**

**Given** a replay run has a baseline reference and current output
**When** replay comparison executes
**Then** divergence detection evaluates output, trace, policy snapshot, and version metadata
**And** flags deterministic mismatch with `REPLAY_DIVERGENCE_DETECTED` when thresholds are exceeded.

**Given** divergence is detected
**When** classification runs
**Then** system assigns one primary divergence class (`policy drift`, `version mismatch`, `input mismatch`, `non-deterministic dependency`, `unknown`)
**And** emits `REPLAY_DIVERGENCE_CLASSIFIED` with `run_id`, `artifact_id`, `policy_snapshot_id`, `trace_schema_version`, and reason code.

**Given** divergence is classified
**When** incident reconstruction output is generated
**Then** the system produces a reconstruction package linking baseline run, replay run, event sequence deltas, and decision records
**And** package references are resolvable in canonical evidence artifacts.

**Given** reconstruction package is generated
**When** integrity validation executes
**Then** package includes required non-null identifiers (`tenant_id`, `workflow_id`, `run_id`, `correlation_id`, `reason_code`, timestamps)
**And** missing required fields fail with `INCIDENT_RECONSTRUCTION_INCOMPLETE`.

**Given** NFR21 controls are active
**When** divergence analysis or reconstruction reaches soft/hard token thresholds
**Then** governed fallback and hard-cap behavior is applied without skipping divergence classification integrity
**And** budget control events remain reason-coded and policy-linked.

**Given** unknown divergence class is returned
**When** classification confidence is below policy threshold
**Then** outcome is `unknown` with explicit confidence metadata and escalation recommendation
**And** run remains non-promotable until explicit review resolution is recorded.

**Given** this story is implemented
**When** governance linkage review runs
**Then** Story 1.5 references existing controls and artifacts rather than redefining them, including:
- `evidence-decision-matrix.md`
- Story 1.1 ADR references: [`decision-records/story-1-1-adr.md`](./decision-records/story-1-1-adr.md)
- required evidence-package reference set defined in Story 1.1 (`requirement_trace_matrix`, `provenance_schema_required_fields`, `control_ownership_raci`, `verification_evidence_plan`, `decision_log_record`, `operational_go_no_go_gates`)

**Domain Integrity Evidence:**
- **Defined terms used in this story:** replay divergence, incident reconstruction output, reason code, policy snapshot, trace schema version, non-promotable
- **Canonical references (required):** `glossary.md`, `prd.md`, `architecture.md`, `evidence-decision-matrix.md`
- **Validation method applied (define -> map -> validate -> use):** define in glossary/canonical source -> map to ACs -> validate with classification and completeness checks -> use in implementation/testing
- **Control IDs and ADR links referenced:** `NFR21`, `ADR-S1.1-001`..`ADR-S1.1-007`
- **Source artifacts reviewed (required):** `epics.md`, `glossary.md`, `decision-records/story-1-1-adr.md`, `evidence-decision-matrix.md`
- **Evidence IDs linked to ACs (required):** `EVID-S1.5-CLASSIFY`, `EVID-S1.5-RECONSTRUCT`, `EVID-S1.5-BUDGET`, `EVID-S1.5-ESCALATE`
- **Reviewer and review date (required):** `pending`
- **Status (required):** `draft-for-approval`
- **Deviation note (required; use "none" if no deviation):** none

### Story 1.6: Produce Governed Export Packages for External Review and Archival

As an Orchestration Engineer,
I want to export a governed package that binds an equation artifact to its run evidence bundle under policy and integrity rules,
So that external reviewers and archival processes receive verifiable AOIS material without breaching tenant boundaries or governance.

**Acceptance Criteria:**

**Given** a selected `artifact_id` and one or more linked `run_id` values with persisted run evidence bundles
**When** an export request is submitted with actor context and workflow class
**Then** the system assembles a `governed export package` with a resolvable `export manifest`
**And** the manifest lists `artifact_id`, `artifact_schema_version`, `run_id`(s), `trace_schema_version`, `policy_snapshot_id`, `correlation_id`, and SHA-256 `content_hash` entries for each included logical object.

**Given** active policy for external sharing and redaction
**When** pre-export evaluation executes
**Then** export proceeds only if policy permits moving the requested material across the external sharing boundary for that tenant and workflow class
**And** denial returns `EXPORT_POLICY_DENIED` with `reason_code` and `policy_snapshot_id` (FR36 enforcement at the export boundary; policy definitions remain owned by Epic 3 artifacts referenced from `prd.md`).

**Given** policy requires field-level redaction for external recipients
**When** the export payload is materialized
**Then** prohibited fields are removed or replaced with policy-approved summaries and each redaction carries a valid `redaction_reason_code`
**And** raw prohibited content never appears in the export bytes.

**Given** a completed manifest and payload canonicalization rules
**When** integrity sealing runs
**Then** the system computes `export_package_hash_sha256` over the canonical export bytes per Story 1.1 hashing contract
**And** mutating any included object without regenerating hashes fails verification with `EXPORT_INTEGRITY_MISMATCH`.

**Given** stored evidence bundles are read during export assembly
**When** integrity verification executes before sealing
**Then** the system applies FR45-class integrity checks (detect tampered or flagged records)
**And** tamper or verification failure returns `EVIDENCE_INTEGRITY_REJECTED` with no partial silent export.

**Given** NFR21 controls are active
**When** export assembly, redaction, or manifest generation approaches soft or hard token budgets
**Then** governed fallback and hard-cap enforcement apply without skipping policy or integrity gates
**And** budget events remain reason-coded with `tenant_id`, `workflow_id`, `run_id`, and `policy_snapshot_id`.

**Given** a successful export
**When** audit evidence is written
**Then** exactly one logical `export_recorded` event exists per export operation with idempotency key `export_id` (or equivalent)
**And** the record includes actor, timestamp, manifest hash, and destination class (`external_review`, `archival`, or policy-defined).

**Given** a sealed governed export package
**When** verification readiness is evaluated
**Then** the export manifest references the documented third-party verification procedure path consistent with FR57 (procedure document may be stubbed in Phase 1 but MUST be a resolvable repository or registry artifact, not an unresolved placeholder)
**And** Epic 2 attestation mechanisms (FR58) MAY extend the same package but Story 1.6 MUST NOT claim FR58 completion.

**Given** CI executes Story 1.6 validation
**When** tests run
**Then** the minimum suite includes: happy-path sealed export, policy-denied export, redaction enforcement, integrity rejection on tampered source, hash mismatch on post-seal mutation, NFR21 hard-cap path, and manifest completeness failure cases.

**Given** this story is implemented
**When** governance linkage review runs
**Then** Story 1.6 references existing controls rather than redefining them, including:
- `evidence-decision-matrix.md` (e.g., evidence classes aligned with E-007 export verification)
- Story 1.1 ADR references: [`decision-records/story-1-1-adr.md`](./decision-records/story-1-1-adr.md)
- required evidence-package reference set defined in Story 1.1 (`requirement_trace_matrix`, `provenance_schema_required_fields`, `control_ownership_raci`, `verification_evidence_plan`, `decision_log_record`, `operational_go_no_go_gates`)

**Domain Integrity Evidence:**
- **Defined terms used in this story:** governed export package, export manifest, equation artifact, run evidence bundle, policy snapshot, reason code, external sharing boundary, non-promotable
- **Canonical references (required):** `glossary.md`, `prd.md`, `architecture.md`, `evidence-decision-matrix.md`
- **Validation method applied (define -> map -> validate -> use):** glossary entries for export terms -> map to FR5/FR36/FR45 hooks -> validate with policy, integrity, and manifest tests -> use in implementation
- **Control IDs and ADR links referenced:** `NFR21`, `FR5`, `FR36`, `FR45`, `FR57`, `ADR-S1.1-001`..`ADR-S1.1-007`
- **Source artifacts reviewed (required):** `epics.md`, `glossary.md`, `decision-records/story-1-1-adr.md`, `evidence-decision-matrix.md`, `prd.md`
- **Evidence IDs linked to ACs (required):** `EVID-S1.6-MANIFEST`, `EVID-S1.6-POLICY`, `EVID-S1.6-REDACT`, `EVID-S1.6-INTEGRITY`, `EVID-S1.6-BUDGET`, `EVID-S1.6-AUDIT`
- **Reviewer and review date (required):** `pending`
- **Status (required):** `draft-for-approval`
- **Deviation note (required; use "none" if no deviation):** none

### Epic 1 Traceability Matrix (Stories 1.1-1.6)

Coverage boundary: this matrix currently covers Epic 1 Stories 1.1-1.6; matrix rows for Story 1.7+ and Epics 2-5 are mandatory as those stories are approved.
Traceability update trigger: any story status change, AC change, ADR status change, or glossary term status change MUST update affected matrix rows in the same change.

Requirement and Control ID conventions:
- Functional requirements: `FR<number>` (e.g., `FR12`)
- Non-functional requirements: `NFR<number>` (e.g., `NFR21`)
- Decision records: `ADR-S<section>-<number>` (e.g., `ADR-S1.1-003`)
- Story acceptance criteria: `AC-<story>-<number>` or explicit Given/When/Then clause IDs where adopted
- Evidence and governance references must use resolvable artifact paths and stable IDs.

| Story | Primary outcome | FR coverage | NFR/control coverage | Domain term sources | Decision references |
|---|---|---|---|---|---|
| Story 1.1 | Prompt-derived artifact creation with full trace provenance and real-time stream visibility | FR1, FR4, FR6, FR7, FR8, FR12, FR15, FR54, FR55 | NFR21; evidence-package gate; compatibility governance; estimator failover governance | `glossary.md`, `prd.md`, `architecture.md` | `ADR-S1.1-001`..`ADR-S1.1-007` |
| Story 1.2 | Trace-to-artifact extraction with immutable source lineage and governed compatibility | FR2, FR3, FR4, FR6, FR12, FR53 | NFR21 fallback and hard-cap enforcement; evidence reference resolution gate | `glossary.md`, `prd.md`, `architecture.md` | Story 1.1 ADR set + extraction decision records |
| Story 1.3 | Lifecycle transitions and lineage management with mandatory evidence attachment gates | FR3, FR35, FR36, FR50, FR52, FR53 | NFR21 constrained-mode integrity; evidence attachment enforcement | `glossary.md`, `evidence-decision-matrix.md`, `architecture.md` | Story 1.1 ADR set + lifecycle transition records |
| Story 1.4 | Deterministic replay execution using replay envelope controls and governed divergence handling | FR12, FR13, FR14, FR35, FR42, FR55 | NFR21 replay budget enforcement; replay-integrity and version-compatibility gates | `glossary.md`, `prd.md`, `architecture.md`, `evidence-decision-matrix.md` | Story 1.1 ADR set + replay decision records |
| Story 1.5 | Replay divergence detection, classification, and incident reconstruction package generation | FR13, FR14, FR35, FR36, FR45 | NFR21 constrained analysis controls; reconstruction completeness gate; escalation governance linkage | `glossary.md`, `prd.md`, `architecture.md`, `evidence-decision-matrix.md` | Story 1.1 ADR set + replay divergence decision records |
| Story 1.6 | Governed export packages with policy, redaction, integrity sealing, and audit records | FR5, FR36, FR45 | NFR21 export-path budgets; FR45 pre-export integrity; FR57 verification procedure reference | `glossary.md`, `prd.md`, `architecture.md`, `evidence-decision-matrix.md` | Story 1.1 ADR set + export decision records |

> **Scaffolding note:** The template section below is non-authoritative scaffolding retained during incremental story authoring.
> Traceability, approvals, and implementation must use only concrete Epic/Story sections above this note.

<!-- Repeat for each epic in epics_list (N = 2, 3, 4...) -->

## Epic {{N}}: {{epic_title_N}}

{{epic_goal_N}}

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

**Domain Integrity Evidence:**
- **Defined terms used in this story:** {{terms_defined_or_referenced}}
- **Canonical references (required):** {{glossary_or_source_refs}}
- **Validation method applied (define -> map -> validate -> use):** {{validation_method}}
- **Control IDs and ADR links referenced:** {{control_and_adr_links}}
- **Source artifacts reviewed (required):** {{source_artifacts}}
- **Evidence IDs linked to ACs (required):** {{evidence_ids}}
- **Reviewer and review date (required):** {{reviewer_and_date}}
- **Status (required):** {{status}}
- **Deviation note (required; use "none" if no deviation):** {{deviation_note}}

**Evidence Acceptance Rubric (Pass/Fail):**
- Pass only when all required fields above are populated with resolvable references.
- Reject if any AC lacks linked evidence ID or source artifact.
- Reject if reviewer/date is missing.
- Reject if status is missing or ambiguous.
- Reject if deviation note is omitted (must be explicit, including "none").

<!-- End story repeat -->
