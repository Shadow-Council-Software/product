---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - '/Users/onimurasame/workspaces/product/mechanistic-interpreter-testing/prd.md'
  - '/Users/onimurasame/workspaces/product/mechanistic-interpreter-testing/evidence-decision-matrix.md'
  - '/Users/onimurasame/workspaces/product/mechanistic-interpreter-testing/prd-validation-report.md'
workflowType: architecture
lastStep: 8
status: complete
completedAt: '2026-05-05'
project_name: product
user_name: Onimurasame
date: '2026-05-04'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Purpose
Establish a decision-grade context model that constrains architecture choices for Phase 1 assurance validity, replay fidelity, governance integrity, and reproducibility.

### Inputs
- PRD (`prd.md`)
- Evidence and Decision Matrix (`evidence-decision-matrix.md`)
- PRD Validation Report (`prd-validation-report.md`)

### Decisions Required
- Phase-1 core vs deferred context variables
- Governance invariants and exception authority topology
- Boundary ownership and failure containment semantics
- Version compatibility and replay semantics
- Step-03 entry readiness gates

### Outputs
- Context constraint set for architecture decisions
- Temporal prioritization (Immediate vs Deferred)
- Governance and risk control interpretation layer
- Comprehensive glossary and nomenclature standard

### Out of Scope
- Technology stack selection
- Detailed component implementation design
- Non-Phase-1 expansion commitments

### Requirements Overview

**Functional Requirements:**  
58 FRs imply control-plane-centric architecture with governed artifact lifecycle, mechanistic interpretation, deterministic replay, gate adjudication, policy enforcement, and immutable evidence semantics.

**Non-Functional Requirements:**  
NFRs prioritize assurance correctness and reproducibility first, with staged quantitative commitments. Security, isolation, auditability, and scientific reproducibility are first-order architectural constraints.

**Scale & Complexity:**  
High complexity under phase-capped delivery due to governance depth, replay determinism obligations, comparator governance, and evidence integrity requirements.

### Top Architectural Drivers
1. Replay envelope determinism and divergence taxonomy
2. Evidence immutability and integrity verification
3. Policy-governed unknown-state handling
4. Atomic promotion bundle semantics
5. Comparator lifecycle governance
6. Tenant isolation invariants
7. Schema/version compatibility obligations
8. Hosted-first portability constraints for later parity

### Governance Interpretation Layer

**Non-negotiable invariants (MUST hold):**
- No silent passage of unknown states
- No silent fallback from governed mechanistic path
- Immutable append-only evidence semantics
- Strict tenant isolation boundaries
- Mandatory gate enforcement for critical promotions

**Staged obligations (SHALL activate via gates):**
- Quantitative performance and DR commitments
- Scale fairness proof points
- Security baseline conformance checkpoints

**Operational policy controls (versioned):**
- Comparator activation/deprecation and impact review
- Override governance with post-hoc accountability
- Export/control checks for evidence sharing
- Retention/residency/redaction policy evolution

### Phase-1 Temporal Prioritization Protocol

Each context variable is classified by:
- Assurance Criticality (AC)
- Phase-1 Utility Contribution (PUC)
- Coupling/Dependency Magnitude (CDM)
- Deferral Risk Index (DRI)

Immediate (Phase-1 Core) if any condition holds:
1. AC High and omission invalidates assurance claims
2. PUC High and omission degrades go/no-go fidelity
3. CDM High and omission introduces rework propagation
4. DRI High and deferral elevates governance, audit, or operational failure probability

All others are Deferred (Phase-2+) and must include:
- Deferral rationale
- Activation trigger
- Re-entry phase
- Residual risk statement

No Step-03 option may elevate Deferred items into Phase-1 blockers without explicit exception approval and section update.

### Trust Boundaries and Failure Domains
- Identity boundary
- Data boundary
- Compute/execution boundary
- Audit visibility boundary
- Key-management boundary

Each boundary MUST define enforcement owner, allowed failure propagation, containment mechanism, escalation path, and evidence requirements.

### Temporal, Versioning, and Replay Semantics
- Event time vs processing time preservation
- Effective-dating for policy/comparator/artifact versions
- Ordering and idempotency guarantees
- Backfill/reprocessing constraints
- Canonical replay input contract
- Compatibility matrix obligations (N-1/N/N+1 and unknown/removed field behavior)

### Evidence Lifecycle and Stakeholder Context
- Evidence is a first-class output (not incidental telemetry)
- Minimum provenance schema is mandatory
- Acceptance authority spans Product, Engineering, Security, Compliance, Audit, Legal, and Operations
- Reversible vs irreversible decisions must be explicitly classified

### Decision-Rights and Exception Authority
Define authority map for security/privacy exceptions, retention/residency exceptions, comparator/policy emergency overrides, and promotion exceptions.  
Each exception class MUST define required evidence and post-decision review protocol.

### Operational Risk Thresholds
For key incident classes, define trigger threshold, owner, required action (rollback/quarantine/escalate/override), and emitted evidence artifact.

### Step-03 Readiness Gates (Mandatory)
Step-03 MUST NOT start until:
1. Decision-rights map approved
2. Compatibility matrix complete
3. Invariant-violation handling policy complete
4. Boundary ownership map ratified
5. Assurance packet schema frozen
6. Immediate/Deferred tags applied across major context variables

### Constraint Formalization
Each mandatory constraint MUST include:
- Owner
- Verification artifact
- Validation method
- Failure action
- Conflict precedence binding

### Constraint Conflict Precedence
If constraints conflict, precedence is:
Safety/Legal > Security > Data Integrity > Functional > Performance > UX

### Context Formalization Addendum
All normative statements use RFC-2119 modality:
- MUST / MUST NOT (gating)
- SHOULD (default with explicit exception rationale)
- MAY (optional non-gating)

Each high-criticality variable MUST define verification method, falsification condition, remediation pathway, and ownership/escalation path.

### Context Model Versioning
- `contextModelVersion`: `0.2.0`
- `changeLog`: Step-02 integrated with party-mode and advanced-elicitation refinements
- `breakingChange`: `false`

### Ontology Links (Assurance Semantics)
- Assurance Claim requires Evidence Bundle
- Evidence Bundle inherits constraints from Evidence Integrity
- Promotion Bundle depends on Policy Snapshot and Comparator Governance
- Deterministic Replay is bounded by Replay Envelope

### Comprehensive Glossary of Domain Nomenclature

**AOIS (Assurance-Oriented Inference Systems)** *(Scope: Context-Core)*  
Domain overlay for inference systems that prioritize bounded claims, explicit controls, immutable evidence, and governed uncertainty handling.

**Artifact (Equation Artifact)** *(Scope: Context-Core)*  
Versioned machine-operable representation of orchestration logic with lifecycle state, provenance, and assurance metadata.

**Artifact Lineage** *(Scope: Context-Core)*  
Directed ancestry graph of artifact derivations (create, branch, extract, mutate) used for audit reconstruction and impact analysis.

**Assurance** *(Scope: Context-Core)*  
Evidence-backed degree of validity for claims within declared assumptions, constraints, and verification methods.

**Assurance Claim** *(Scope: Context-Core)*  
Falsifiable statement of system behavior under explicit scope conditions and proof obligations.

**Assurance Packet** *(Scope: Context-Core)*  
Structured gate-review bundle containing evidence artifacts, test outputs, decision records, residual risks, and approvals.

**Bounded Claim Model** *(Scope: Context-Core)*  
Rule that all claims must define validity boundaries and must not be generalized beyond proven contexts.

**Canonical Ordering** *(Scope: Context-Core)*  
Deterministic event ordering model ensuring reproducible interpretation under concurrent or delayed writes.

**Comparator** *(Scope: Context-Core)*  
Governed mechanism for evaluating equivalence under strict or semantic comparators with versioned tolerances.

**Comparator Governance** *(Scope: Context-Core)*  
Lifecycle controls for comparator registration, activation, deprecation, and impact review.

**Control Plane** *(Scope: Context-Core)*  
Subsystem responsible for policy evaluation, routing, lifecycle transitions, and gate orchestration decisions.

**Cross-Cutting Concern** *(Scope: Context-Core)*  
System-wide property (for example auditability, isolation, idempotency, retention) requiring explicit enforcement mapping.

**Decision Record** *(Scope: Context-Core)*  
Immutable representation of a governance-relevant decision with actor identity, rationale, evidence links, and version anchors.

**Deferral Risk Index (DRI)** *(Scope: Context-Core)*  
Expected assurance/operational harm introduced by postponing a context variable.

**Deterministic Replay** *(Scope: Context-Core)*  
Re-execution property where fixed inputs and pinned versions produce reproducible behavior within a replay envelope.

**Divergence Classification** *(Scope: Context-Core)*  
Taxonomy for replay mismatch causes (for example policy drift, version mismatch, non-deterministic dependency behavior).

**Evidence Bundle** *(Scope: Context-Core)*  
Cryptographically verifiable set of artifacts, traces, and metadata sufficient to evaluate a claim or decision.

**Evidence Integrity** *(Scope: Context-Core)*  
Property that evidence is tamper-evident, provenance-preserving, and authenticity-verifiable across lifecycle stages.

**Evidence Lifecycle** *(Scope: Context-Core)*  
Policy-governed evolution of evidence from generation to retention, controlled access, archival, and constrained deletion.

**Exception Authority** *(Scope: Context-Core)*  
Role-bound authority for approving controlled deviations with mandatory evidence and post-hoc review.

**Failure Domain** *(Scope: Context-Core)*  
Containment boundary limiting fault propagation and protecting higher-order invariants.

**Flagship Workflow** *(Scope: Context-Core)*  
Primary high-value Phase-1 workflow used to validate product viability and assurance credibility.

**Gate (Assurance Gate)** *(Scope: Context-Core)*  
Checkpoint applying acceptance criteria to allow, block, or conditionally override progression.

**Immediate (Phase-1 Core)** *(Scope: Context-Core)*  
Classification for variables that are indispensable to Phase-1 assurance fidelity or architectural coherence.

**Invariant** *(Scope: Context-Core)*  
Non-negotiable condition that must always hold during operation and promotion evaluation.

**Invariant Violation Handling Policy** *(Scope: Context-Core)*  
Prescribed response model (reject, quarantine, compensate, escalate) when invariants are breached.

**Mechanistic Interpreter** *(Scope: Context-Core)*  
Transformation engine interpreting equation artifacts into schema-valid intermediate representations and reason-coded outputs.

**Mutation Analysis** *(Scope: Adjacent)*  
Assurance method introducing controlled perturbations to validate defect-detection effectiveness of test/gate suites.

**Now/Later Temporal Partitioning** *(Scope: Context-Core)*  
Governance process classifying variables as immediate Phase-1 obligations or deferred Phase-2+ items.

**Phase-1 Utility Contribution (PUC)** *(Scope: Context-Core)*  
Degree to which a variable improves flagship go/no-go decision quality in Phase 1.

**Policy Snapshot** *(Scope: Context-Core)*  
Version-pinned representation of active policy at execution time for replay and audit fidelity.

**Precedence Rule** *(Scope: Context-Core)*  
Conflict-resolution hierarchy among constraints (Safety/Legal > Security > Data Integrity > Functional > Performance > UX).

**Promotion Bundle** *(Scope: Context-Core)*  
Atomic unit for promotion consisting of artifact version, comparator configuration, and policy snapshot.

**Replay Envelope** *(Scope: Context-Core)*  
Explicit declaration of dependencies, side-effect class, and environment assumptions under which replay claims are valid.

**Residual Risk** *(Scope: Context-Core)*  
Risk remaining after controls are applied, documented with acceptance rationale and sign-off authority.

**Segregation of Duties** *(Scope: Adjacent)*  
Governance principle separating author, approver, and verifier responsibilities to reduce control-capture risk.

**Temporal Semantics** *(Scope: Context-Core)*  
Formal treatment of event time, processing time, effective dates, ordering guarantees, and replay causality.

**Tenant Isolation** *(Scope: Context-Core)*  
Strict separation of data, execution, credentials, and governance visibility across tenants.

**Trace Completeness** *(Scope: Context-Core)*  
Measure of required evidence availability and linkability for a governed run or decision.

**Unknown-State Disposition Policy** *(Scope: Context-Core)*  
Governed handling of indeterminate outcomes: block, defer, escalate, or bounded-risk allow with mandatory logging.

**Verification Method** *(Scope: Context-Core)*  
Defined procedure proving conformance (test, audit query, replay run, cryptographic verification, or review protocol).

**Version Compatibility Matrix (N-1/N/N+1)** *(Scope: Context-Core)*  
Interoperability rules for adjacent versions including behavior for unknown fields, removed fields, and semantic reinterpretation.

## Starter Template Evaluation

### Objective
Establish a reversible, local-first starter strategy that maximizes learning velocity for mechanistic interpretation while preserving migration portability and governance continuity.

### Primary Technology Domain
Backend/API plus local research harness for mechanistic interpretation and assurance gate development.

### Starter Options Considered
- Rust-first backend starter templates (high performance, lower early iteration velocity)
- Python-first backend starter templates (high iteration velocity, later performance migration risk)
- Hybrid contract-first approach (language-agnostic contracts with optional Rust acceleration seam)

### Selected Starter
Custom minimal contract-first local starter.

### Rationale
- Aligns with sequencing principle: make it work, make it good, then make it fast.
- Avoids premature lock-in on database, cloud, and vendor infrastructure.
- Preserves direct migration path for performance-critical surfaces into Rust when justified by evidence.
- Supports local-first execution and scientific reproducibility before production hardening.

### Initialization Command
```bash
mkdir -p mechanistic-interpreter-core/{contracts,contracts/schemas,notes,experiments,experiments/runs,adapters} && \
printf "# Contract-First Core\n\nPhase: make-it-work\n" > mechanistic-interpreter-core/README.md
```

### Step-03 Minimal Decision Kernel (Occam)

**Goal:**  
Prove one deterministic, local mechanistic-interpretation slice with reproducible evidence.

**Go Condition:**  
`Go = Safety && Feasibility && Evidence && Accountability && PolicyConformance`

Where:
- **Safety:** rollback path plus non-mutating failure behavior
- **Feasibility:** runnable local slice plus baseline operational readiness
- **Evidence:** reproducible run evidence bundle plus pre/post-go verification checkpoint
- **Accountability:** named owner, approver, and escalation path
- **PolicyConformance:** minimum privacy, security, and contractual conformance checks

### In Scope (Phase-1 Starter)
- One local contract-first starter substrate
- One end-to-end Story-1 slice proving mechanistic interpretation behavior
- Minimal control floor only
- Reproducible run artifacts and explicit Step-04 handoff outputs

### Out of Scope (Deferred to Story-2+)
- Production DB selection and cloud IaC commitments
- External vendor SDK lock-in and distributed messaging substrate decisions
- Advanced governance automation and full compliance depth
- Scale hardening and broad integration expansion

### Story-1 Definition of Done
1. Single command executes one deterministic local run.
2. Run emits a `run evidence bundle` under `experiments/runs/<run_id>/` containing run ID, run manifest, trace/result artifacts, and interpretation link.
3. Guardrail violation returns `BLOCKED` with reason code and performs no state mutation.
4. Deferred controls are explicitly listed and non-blocking for Story-1.

### Non-Negotiables vs Preferences
**Non-Negotiables (Story-1):**
- One rollback path with owner and maximum rollback time
- Minimum compatibility floor declaration for runtime/dependency versions
- Baseline SLO/health objective and measurement method
- Supply-chain floor: lockfile, vulnerability scan, pinned build image/toolchain

**Preferences (deferred unless blocking):**
- Expanded compatibility matrix depth
- Advanced resilience/compliance automation
- Detailed role/RACI expansion
- Broad NFR optimization commitments

### Governance and Traceability Minimums
- ADR required for this starter decision with context, options, risks, owner, and revisit trigger.
- Minimal traceability chain required: `Requirement ID -> Contract Clause -> ADR ID -> Evidence Artifact -> Sign-off`.
- Deferred decisions must include owner, risk rating, and pin-by trigger.

### First-Principles Invariant
If a proposed Step-03 addition does not increase the probability of a correct Go/No-Go decision for Story-1, it MUST be deferred to Story-2+.

### Terminology and Modality Normalization
- Canonical term: `PolicyConformance`
- Canonical modality: `MUST / MUST NOT / MAY`
- Canonical artifact name: `run evidence bundle`

### Step-03 -> Step-04 Handoff Contract
Step-03 output MUST include:
1. Non-negotiable constraints
2. Deferred list with triggers
3. Trade-off register with confidence levels
4. Architecture acceptance criteria
5. Unresolved risks with owners

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data architecture: contract-only data model (no persistent DB commitment in Phase-1)
- Security posture: local single-operator mode with mandatory audit/provenance fields
- Invocation pattern: CLI-first local contract invocation
- Infrastructure baseline: local-only execution (no cloud/deployment commitment)
- Control gate model: `Go = Safety && Feasibility && Evidence && Accountability && PolicyConformance`

**Important Decisions (Shape Architecture):**
- Frontend architecture: minimal local dashboard for run/evidence inspection
- Dashboard scope limited to read-oriented inspection (non-orchestration-heavy)
- Canonical contract artifacts remain the system boundary for CLI and dashboard paths

**Deferred Decisions (Post-MVP / Story-2+):**
- Production database engine selection
- Cloud hosting, CI/CD hardening, and deployment topology
- Full auth/authz and multi-user policy enforcement
- Broad integration and distributed messaging substrate
- Performance-oriented runtime lock-in (Rust-first commitment pending evidence checkpoint)

### Data Architecture

- **Decision:** Contract-only data model
- **Version policy:** Schema-first artifacts in `contracts/schemas`; persistence engine deferred
- **Rationale:** Working interpreter POC must precede infrastructure commitment
- **Affects:** run artifact schema, evidence bundle structure, migration portability
- **Starter-provided:** yes

### Authentication & Security

- **Decision:** Local single-operator mode (Phase-1)
- **Security invariants:**
  - Every run includes operator identity metadata
  - Guardrail failures MUST emit `BLOCKED` with reason code and no state mutation
  - Artifact provenance/integrity metadata REQUIRED in run evidence bundle
- **Rationale:** Preserve assurance integrity without premature auth system complexity

### API & Communication Patterns

- **Decision:** CLI-first local invocation
- **Pattern:** Contract-validated input/output at CLI boundary; HTTP/API layer deferred
- **Error standard:** Explicit reason-coded blocked outcomes and deterministic failure semantics
- **Rationale:** Maximize determinism and iteration speed for interpreter core proof

### Frontend Architecture

- **Decision:** Minimal local dashboard now
- **Scope boundary:** Inspect run/evidence outputs only; no orchestration control plane
- **Technology options verified (current):**
  - Textual stable line (reported latest: `8.2.3`)
  - Streamlit stable line (reported latest: `1.56.0`)
- **Version commitment:** deferred until first dashboard slice acceptance criteria are frozen
- **Rationale:** Lightweight observability without committing to full UI stack

### Infrastructure & Deployment

- **Decision:** Local-only baseline
- **Operational floor:**
  - Reproducible local run path
  - Run manifest captured in run evidence bundle
  - Deferred infra controls logged with owner/trigger
- **Rationale:** POC-first posture; infra commitment follows demonstrated interpreter behavior

### Story-1 Implementation Language (closure for READY)

- **Decision:** Primary Story-1 implementation language is **Python** for `mechanistic-interpreter-core` (CLI, runtime, adapters, tests).
- **Rationale:** Maximizes iteration speed for interpreter POC while keeping contracts language-agnostic for later Rust acceleration.
- **Migration rule:** Rust introduction requires evidence checkpoint + ADR; must not fork contract semantics.

### Decision Impact Analysis

**Implementation Sequence:**
1. Define canonical contracts and run evidence bundle schema
2. Implement CLI deterministic invocation path
3. Enforce guardrail and `BLOCKED` semantics
4. Add minimal read-only local dashboard bound to contract artifacts
5. Execute Story-1 Go/No-Go triad checkpoint

**Cross-Component Dependencies:**
- Dashboard consumes CLI-emitted artifacts; it must not redefine schemas
- Security/audit metadata is embedded at run-generation time, not post-processed
- Deferred infra/auth decisions are isolated through contract and adapter boundaries

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

Critical conflict points identified for multi-agent implementation:
1. Domain ownership and boundary drift
2. Cross-capability interface coupling
3. Mutation authority conflicts
4. Contract evolution and schema drift
5. Governance overhead vs Story-1 execution speed

### Step-05 Minimal Reverse-Conway Kernel (Phase-1)

**Purpose:** Prevent cross-agent architectural drift while keeping Story-1 executable.

#### 1) Domain Ownership (MUST)
- Core capabilities:
  - Equation Interpretation
  - Contract/Schema Governance
  - Run Evidence Production
  - PolicyConformance Evaluation
  - Local Inspection Interface
- Each capability MUST have one named owner.

#### 2) Legal Interface Seams (MUST)
- Cross-capability interactions MUST use versioned contract artifacts only (`commands`, `queries`, `events`).
- Direct internal-model access across capabilities is forbidden.

#### 3) Single-Writer Rule (MUST)
- Exactly one capability owner may mutate each aggregate/state authority.
- Other capabilities request changes through command contracts.

#### 4) Contract States (MUST)
- `provisional`: rapid bounded iteration
- `stable`: compatibility-governed for shared use
- Promotion to `stable` requires compatibility check + owner approval.

#### 5) Risk-Tiered Change Control (MUST)
- Non-breaking/additive: owner approval + asynchronous review
- Breaking/high-impact: dual approval + migration note + compatibility window

#### 6) Story-1 Composite Conway Gate (MUST)
Story-1 is Go only if:
- ownership clarity is documented
- forbidden cross-boundary coupling checks pass
- contract drift check passes

#### 7) Anti-Bloat Invariant (MUST)
Any Step-05 control that does not increase correctness of Story-1 Go/No-Go is deferred to Story-2+.

### Critical Clarifications

1. Capability boundaries:
- `Run Evidence Production` owns artifact assembly and persistence semantics.
- `PolicyConformance Evaluation` owns conformance decision logic and reason-code taxonomy.
- Evidence capability MUST consume, not redefine, policy reason semantics.

2. Provisional contract expiry:
- Every `provisional` contract MUST include `expires_on` and `owner`.
- Expired provisional contracts MUST block merge until renewed or promoted to `stable`.

3. Single-writer continuity:
- Each capability MUST declare a primary owner and one delegate.
- Delegate may approve emergency non-breaking changes when primary is unavailable.

4. Composite gate executable criteria:
- Forbidden coupling check passes only if no cross-capability internal imports/reads are detected outside declared contract paths.
- Contract drift check passes only if emitted artifacts validate against current declared `schema_version`.

5. Authority registry:
- Aggregate/state mutation authority MUST be declared in a single `capability_authority_registry` artifact.
- Any mutation path not listed in registry is invalid.

### Final Consistency Micro-Guards

1. Registry coupling rule:
- Any change to cross-capability contract or mutation path MUST include synchronized update to `capability_authority_registry`.
- CI MUST fail if contract diff is detected without registry diff.

2. Reason taxonomy pinning:
- Every run evidence bundle MUST include `policy_reason_schema_version`.
- Consumers MUST validate reason codes against that version; unknown reason codes are treated as `BLOCKED` with explicit incompatibility reason.

### Deadlock Prevention and Execution Safety

#### Deadlock prevention patches
- Kernel interfaces are frozen on schedule by platform ownership; security review may open hardening follow-ups but does not block freeze unless Severity-1 risk is documented.
- During incidents, Runtime owns technical rollback decision and Ops owns execution orchestration; if unclear, Runtime acts by default within 15 minutes.
- Readiness is two-stage: provisional readiness with baseline hooks, then final readiness with optional enhancements; Stage 1 is sufficient to proceed.
- Non-breaking schema extensions are pre-approved under versioned namespaces; production proof required only for breaking changes.

#### Multi-agent execution safety patches
- Ownership validation MUST run pre-dispatch; unauthorized actions are rejected before state mutation or external calls.
- Invocation MUST perform contract-version handshake; mismatch fails fast and forces re-fetch.
- Parallel mutation attempts MUST use short-lived ownership lease tokens; only lease-holder may commit.
- Retry/compensation handlers MUST pass the same ownership and contract checks as primary flows.

### Governance Friction Calibration (Phase-1)

- Dual approval is required only for material-impact changes (timeline, budget, compliance, customer commitment); low-risk changes use single-owner approval.
- Governance documentation is two-tier: decision stub first, full template only for decisions that persist beyond one sprint.
- Governance cadence is fortnightly by default with asynchronous escalation for urgent/high-risk exceptions.
- Required reviewers are decision-type scoped; broader audience receives optional digest.

### Enforcement Guidelines

All AI agents MUST:
- Respect capability ownership boundaries and legal seams.
- Emit and consume canonical contract artifacts only.
- Preserve single-writer and authority-registry semantics.
- Maintain run evidence bundle schema and reason-taxonomy version pinning.
- Apply anti-bloat and risk-tiered governance rules during Story-1.

Pattern enforcement checks:
- Coupling lint (forbidden cross-capability access)
- Contract drift validation against declared schema versions
- Registry sync validation in CI
- Policy reason taxonomy validation in consumers

## Project Structure & Boundaries

### Phase-1 Decision Packet (Committed Now)
- Target surface: local-first mechanistic interpreter POC with CLI-first execution and minimal read-only inspection
- Top jobs-to-be-done:
  1. Execute deterministic interpreter run from contract-valid input
  2. Emit complete run evidence bundle with policy conformance reasoning
  3. Inspect run outputs without mutating runtime state
- Ship gates: value clarity, feasible Story-1 execution, measurable adoption/usage signal
- Top risks: boundary drift, schema drift, ownership ambiguity, governance overhead

### Complete Project Directory Structure
```
mechanistic-interpreter-core/
├── README.md
├── AGENTS.md
├── .gitignore
├── .editorconfig
├── .env.example
├── Makefile
├── capability_authority_registry.yaml
├── contracts/
│   ├── README.md
│   ├── schemas/
│   │   ├── input.schema.md
│   │   ├── trace.schema.md
│   │   ├── result.schema.md
│   │   ├── run_manifest.schema.md
│   │   ├── policy_conformance.schema.md
│   │   └── run_evidence_bundle.schema.md
│   ├── commands/
│   │   ├── run_interpreter.command.md
│   │   └── evaluate_policy.command.md
│   ├── queries/
│   │   ├── get_run.query.md
│   │   └── list_runs.query.md
│   ├── events/
│   │   ├── interpreter.blocked.event.md
│   │   ├── interpreter.completed.event.md
│   │   └── policy.nonconformant.event.md
│   ├── policy/
│   │   └── reason-taxonomy/
│   │       ├── schema.json
│   │       └── versions/
│   │           └── v1/
│   │               └── 0.1.0.json
│   ├── registry/
│   │   └── capability-authority.md
│   ├── compatibility/
│   │   ├── contract_states.md
│   │   ├── compatibility_windows.md
│   │   └── provisional_expiry_register.md
│   └── changelog/
│       └── contracts.md
├── src/
│   ├── agent-runtime/
│   │   ├── README.md
│   │   ├── interpreter_core.py
│   │   ├── state_machine.py
│   │   ├── invariants.py
│   │   └── transitions.py
│   ├── policy-engine/
│   │   ├── README.md
│   │   ├── reason_validator.py
│   │   └── conformance_evaluator.py
│   ├── cli/
│   │   ├── README.md
│   │   ├── main.py
│   │   ├── commands/
│   │   │   ├── run_interpreter.py
│   │   │   └── evaluate_policy.py
│   │   └── output_formatter.py
│   ├── inspection/ # post-S1 (read-only stub package in S1)
│   │   ├── README.md
│   │   ├── dashboard_adapter.py
│   │   └── run_reader.py
│   ├── adapters/
│   │   ├── contracts/
│   │   │   ├── validator.py
│   │   │   ├── schema_loader.py
│   │   │   └── version_handshake.py
│   │   └── local_ops/
│   │       ├── health_checks.py
│   │       ├── rollback.py
│   │       ├── lease_manager.py
│   │       └── telemetry.py
│   └── shared/ # allowlist-only
│       ├── README.md
│       ├── ids.py
│       ├── time.py
│       └── errors.py
├── experiments/
│   ├── README.md
│   ├── scenarios/
│   │   ├── baseline_input.json
│   │   └── blocked_case_input.json
│   └── runs/
│       └── .gitkeep
├── notes/
│   ├── README.md
│   ├── adr/
│   │   ├── ADR-0001-contract-first-starter.md
│   │   └── ADR-0002-reverse-conway-kernel.md
│   ├── decisions/
│   │   └── deferred-decisions.md
│   ├── pattern-violations.md
│   └── interpretations/
│       └── .gitkeep
├── docs/
│   └── START-HERE-STORY-1.md
├── tests/
│   ├── smoke/
│   ├── unit/
│   │   ├── agent-runtime/
│   │   ├── policy-engine/
│   │   ├── cli/
│   │   └── adapters/
│   ├── integration/
│   │   ├── contract_handshake/
│   │   ├── run_bundle_validation/
│   │   └── policy_reason_versioning/
│   ├── boundary/
│   │   ├── test_forbidden_cross_boundary_imports.py
│   │   └── test_dependency_direction.py
│   ├── conway/
│   │   ├── test_authority_registry_sync.py
│   │   └── test_single_writer_rules.py
│   └── fixtures/
│       ├── contracts/
│       └── runs/
├── scripts/
│   ├── bootstrap
│   ├── story-1-ready
│   ├── run_local.sh
│   ├── validate_contracts.sh
│   ├── check_registry_sync.sh
│   └── lint_boundaries.sh
└── .github/
    └── workflows/
        ├── ci.yml
        └── contract-drift.yml
```

### Structure-to-Ownership Matrix
| Path | Owning stream | Allowed dependencies | Stability level |
|------|---------------|----------------------|-----------------|
| `contracts/**` | Contract/Schema Governance | none (source-of-truth) | stable/provisional by contract state |
| `src/agent-runtime/**` | Equation Interpretation | `contracts`, `src/adapters/contracts`, `src/shared` | stable |
| `src/policy-engine/**` | PolicyConformance Evaluation | `contracts/policy`, `src/adapters/contracts`, `src/shared` | stable |
| `src/cli/**` | Run Evidence Production | `src/adapters/contracts`, `src/agent-runtime`, `src/policy-engine`, `src/shared` | stable |
| `src/inspection/**` | Local Inspection Interface | run artifacts only, `src/shared` | provisional (# post-S1) |
| `src/adapters/**` | Bridge (owned by consuming stream) | contracts + external/local I/O only | mixed |
| `src/shared/**` | Shared allowlist | no domain logic | stable |

### Architectural Boundaries

**API Boundaries:**
- Phase-1 exposes CLI command/query contracts only.
- Future HTTP/API layer MUST wrap existing command/query contracts; schema forks are forbidden.

**Component Boundaries:**
- `contracts/` is canonical source of interface truth.
- Runtime, policy, and CLI streams interact only via versioned contracts.
- Inspection is read-only and MUST NOT mutate run state.

**Service Boundaries:**
- No direct cross-stream internal model access.
- Contract handshake runs at invocation start for every command path.
- Retry/compensation flows must pass same ownership and contract checks as primary flows.

**Data Boundaries:**
- Canonical persisted phase-1 truth is `experiments/runs/<run_id>/` run evidence bundles.
- Policy reason taxonomy is governed under `contracts/policy/reason-taxonomy/`.
- Persistent DB and cloud data boundaries remain deferred.

### Requirements to Structure Mapping

**Feature/Capability Mapping:**
- Equation Interpretation -> `src/agent-runtime/`
- Contract/Schema Governance -> `contracts/`, `src/adapters/contracts/`
- Run Evidence Production -> `src/cli/`, `experiments/runs/`
- PolicyConformance Evaluation -> `src/policy-engine/`, `contracts/policy/`
- Local Inspection Interface -> `src/inspection/`

**Cross-Cutting Concerns:**
- Single-writer authority -> `capability_authority_registry.yaml`, `tests/conway/test_single_writer_rules.py`
- Contract drift control -> `scripts/validate_contracts.sh`, `.github/workflows/contract-drift.yml`
- Registry sync micro-guard -> `scripts/check_registry_sync.sh`, CI
- Reason taxonomy pinning -> `contracts/policy/reason-taxonomy/`, integration tests

### Integration Points

**Internal Communication:**
1. CLI receives input
2. Contract adapter validates schema/version handshake
3. Runtime executes interpretation + invariants
4. Policy engine evaluates conformance reason taxonomy
5. CLI emits run evidence bundle
6. Inspection reads bundle

**External Integrations:**
- Deferred in Phase-1; only contract seam placeholders are defined.

**Data Flow:**
- All run paths produce canonical bundle artifacts with pinned schema and policy reason versions.

### File Organization Patterns

**Configuration Files:**
- Root-level files define reproducibility and authority registry.
- Contract lifecycle/compatibility is tracked only under `contracts/compatibility/`.

**Source Organization:**
- Stream-aligned folders mirror reverse-Conway ownership.
- Shared code is allowlist-only and non-domain.

**Test Organization:**
- Tiered: smoke, unit, integration, boundary, conway.
- Local default path is smoke + changed files; full suite enforced on merge.

**Asset Organization:**
- Run artifacts in `experiments/runs/`.
- Decisions, ADRs, interpretations in `notes/`.

### Governance and Traceability Minimums
- Minimum required governance set for Phase-1:
  - decision log entry
  - accountable owner
  - rationale
  - approval date
- Trace convention: `TRACE-XXXX` links requirement -> capability -> owner -> acceptance artifact.
- Single accountable owner per capability; contributors tracked separately.
- Cadence: weekly review plus release-gate check.

### Development Workflow Integration

**Development Bootstrap:**
- `scripts/bootstrap` performs dependency/runtime/env initialization only.
- `scripts/story-1-ready` provides fast preflight for immediate coding start.

**Build Process Structure:**
- Contract validation precedes execution.
- Registry sync and boundary lint checks gate merges.

**Deployment Structure:**
- Phase-1 local only.
- Deployment scaffolding remains deferred (`# post-S1`).

## Architecture Validation Results

### Readiness scope (non-negotiable clarity)

**READY FOR IMPLEMENTATION** in this document means: **authorized start of Phase-1 Story-1 engineering** for the `mechanistic-interpreter-core` artifact (contract-first, CLI-first, local-only, run-evidence-bundle semantics), with reverse-Conway boundaries enforced.

It does **not** mean: general availability, hosted multi-tenant product readiness, full FR1–FR58 product completion, or closure of all PRD deferred metrics tables. Those remain gated by later program phases and explicit promotion criteria.

### Party Mode — readiness convergence (Round: READY lock)

🏗️ **Winston:**  
Prior “enterprise closure” gates (production-like environment, 7-day SLO windows, cohort KPI lifts) were **mis-scoped** for this Phase-1 charter. **READY** must be declared against the **implementation charter** we already ratified: interpreter POC before infra, contracts as source of truth, single-writer authority, registry sync, and inspection read-only. Production-scale gates belong in a **separate promotion readiness record**, not as blockers to beginning Story-1 code in `mechanistic-interpreter-core`.

💻 **Amelia:**  
**READY** is defensible when Story-1 has a **machine-checkable definition of done** wired to repo mechanics: `scripts/bootstrap` + `scripts/story-1-ready` exit 0; `scripts/validate_contracts.sh` + `scripts/check_registry_sync.sh` + `scripts/lint_boundaries.sh` exist and are referenced by CI; smoke tests validate bundle schema + reason taxonomy pin; forbidden-import boundary tests exist. Language pin for Story-1: **Python** (contracts remain language-agnostic). Rust remains an **evidence-gated** acceleration path, not a Story-1 blocker.

📊 **Mary:**  
Audit defensibility requires explicit **scope tagging** on the READY claim. Add: *Evidence bundle ID + approver role + date* for this gate in `notes/decisions/` when implementation begins. Traceability chain for architecture readiness: **PRD scope cap (flagship / Phase-1) → this AD → capability map → structure tree → enforcement scripts/tests**. Any future “product READY” must cite a different gate record.

📋 **John:**  
Value authority for Phase-1 is **not** “15% cohort lift” pre-code. The authoritative value gate for Story-1 is: **repeatable end-to-end run** producing a **reviewable run evidence bundle** plus **named evaluator acceptance** (design partner or internal assurance role) recorded as `TRACE-XXXX` evidence. Broader adoption metrics activate post-interpreter POC per PRD program gates (G1–G3).

### Coherence Validation ✅

**Decision Compatibility:**  
Phase-1 decisions cohere: contract-only persistence, local single-operator security posture, CLI-first seam, minimal inspection, local-only infra deferral, reverse-Conway kernel, and physical structure alignment.

**Pattern Consistency:**  
Naming, modality (`MUST`/`MUST NOT`/`MAY`), contract states, authority registry coupling, and anti-bloat invariants are consistent across Steps 3–6.

**Structure Alignment:**  
Directory tree, ownership matrix, and integration flow implement the documented boundaries without contradictory second sources of truth.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**  
No epics artifact present; coverage is by **PRD FR clusters** mapped in **Project Structure & Boundaries**.

**Functional Requirements Coverage (Phase-1 interpretation):**  
Architecture supports the **Phase-1 mechanistic core slice**: interpretation semantics, schema-valid IR/trace outputs, governed unknown-state disposition, evidence bundle emission, policy conformance reasoning, and local inspection consumption paths. Full product FR coverage is explicitly **out of scope** until interpreter POC and program gates advance.

**Non-Functional Requirements Coverage (Phase-1 interpretation):**  
NFRs are handled as **staged obligations**: correctness/reproducibility/auditability enforced locally via contracts + bundles; quantitative SLOs, DR, and security GA baselines remain **deferred-until-gate** per PRD, with architecture providing hooks (telemetry/rollback scripts placeholders) rather than premature numeric promises.

### Implementation Readiness Validation ✅

**Decision Completeness:**  
Critical Phase-1 decisions documented; version pins for optional dashboard libraries remain **explicitly deferred** until inspection slice acceptance criteria freeze (documented).

**Structure Completeness:**  
Concrete tree + ownership matrix + integration points defined.

**Pattern Completeness:**  
Conflict points addressed with CI-enforceable checks where applicable; governance minimized to Story-1 throughput.

### Implementation Readiness Closure — Story-1 (objective)

The following define **Story-1 implementation start readiness** (local engineering, not GA):

| Gate ID | Criterion | Pass condition |
|--------|-----------|----------------|
| IR-01 | Repo bootstrap | `scripts/bootstrap` documented and executable from clean checkout |
| IR-02 | Preflight | `scripts/story-1-ready` runs smoke validations and exits 0 |
| IR-03 | Contract validation | `scripts/validate_contracts.sh` exits 0 |
| IR-04 | Registry sync | `scripts/check_registry_sync.sh` exits 0 on contract/registry diffs |
| IR-05 | Boundary lint | `scripts/lint_boundaries.sh` exits 0 |
| IR-06 | Bundle schema | `run evidence bundle` validates against `contracts/schemas/run_evidence_bundle.schema.md` |
| IR-07 | Reason taxonomy pin | `policy_reason_schema_version` present and validates against pinned taxonomy artifact |
| IR-08 | Value evidence stub | `notes/decisions/READY-STORY-1.md` records approver + date + scope tag |

### Gap Analysis Results

**Critical Gaps:** None for **Story-1 implementation start** per scope above.

**Important Gaps:**  
- Runtime performance proof and Rust acceleration decision remain **post-Story-1 evidence** items.  
- Hosted inference, tenant isolation product depth, and full authz remain **deferred** per Step-4.

**Nice-to-Have Gaps:**  
- Expanded adversarial corpora and publication-grade reproducibility packs (PRD FR30–FR32 trajectory).

### Validation Issues Addressed

- Recalibrated “READY” from enterprise production gates to **Phase-1 implementation charter**.  
- Added machine-checkable Story-1 readiness table.  
- Pinned Story-1 implementation language (**Python**) to resolve “stack unspecified” ambiguity without violating Rust aspiration (evidence-gated migration).

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions (where bounded); dashboard library versions explicitly deferred with recorded rule
- [x] Technology stack fully specified for **Story-1 implementation** (Python + contract artifacts + local CLI; Rust deferred)
- [x] Integration patterns defined (contract-first CLI; future HTTP wraps commands)
- [x] Performance considerations addressed (staged per PRD NFR-ENG-001; measurement hooks planned)

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION *(Phase-1 Story-1 scope: `mechanistic-interpreter-core` local POC)*

**Confidence Level:** high *(for scoped meaning above; not GA product readiness)*

**Key Strengths:**  
Contract-first kernel, reverse-Conway ownership matrix, enforceable boundary tests, registry coupling rule, reason taxonomy pinning, explicit deferral discipline.

**Areas for Future Enhancement:**  
Production deployment path, full authz, multi-tenant isolation productization, performance hardening and Rust acceleration decision package.

### Implementation Handoff

**AI Agent Guidelines:**  
Implement strictly within capability folders, contracts, and enforcement scripts defined herein. Do not introduce DB/cloud dependencies without ADR + registry update.

**First Implementation Priority:**  
Create `mechanistic-interpreter-core/` per **Project Structure & Boundaries**, then close **Implementation Readiness Closure — Story-1** gates IR-01–IR-08 with passing automation and recorded `READY-STORY-1` decision note.
