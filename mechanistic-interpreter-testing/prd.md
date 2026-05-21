---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - './university-research-sources.md'
workflowType: 'prd'
releaseMode: phased
briefCount: 0
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
classification:
  projectType: developer_tool
  domain: scientific
  complexity: medium
  projectContext: greenfield
date: '2026-05-04'
lastEdited: '2026-05-04'
editHistory:
  - date: '2026-05-04'
    changes: 'Edit workflow (validation-driven): document map; cross-links; computational assumptions; developer_tool language/install/examples; NFR deferred metrics table; FR–journey map; normative FR8/FR53/FR58 wording.'
---

# Product Requirements Document - product

**Author:** Onimurasame
**Date:** May 4, 2026

## Executive Summary

This product introduces an assurance-first delivery framework in which functionality is encoded as executable equation sets ("equations as tools") that models consume as structured control data. Instead of relying only on probabilistic prompt execution, teams gain a governed mechanism for orchestrating variable workflows with replayable behavior, explicit assumptions, and auditable outputs.

The framework operates through two controlled paths: **(1) equation synthesis from prompts** and **(2) equation extraction from completed inference traces**. In both paths, equation artifacts are validated and mutation-tested before deployment, so adaptation speed does not come at the expense of reliability or governance.

For MVP, scope is bounded to deterministic-first controls plus constrained stochastic orchestration. This enables measurable operational outcomes now (faster integration, improved orchestration reliability, reduced manual rule authoring) while preserving a staged path to broader non-deterministic and legacy modernization scenarios.

### What Makes This Special

The differentiator is not generic tool-calling or conventional mutation testing. This framework treats equations themselves as reusable functional assets: generated or extracted, tested, versioned, and re-used as machine-operable orchestration primitives.

This creates a practical bridge between agentic flexibility and engineering assurance. Teams can inspect why an orchestration decision occurred, replay it under controlled conditions, and improve it through equation-level mutation analysis rather than opaque prompt iteration. Compared with API-style tool orchestration, this method targets higher traceability, stronger reuse, and governance-grade confidence.

For phased delivery detail and program gates, see **Project Scoping & Phased Development**. For gate sequences, competitive framing, and bounded-claim model, see **Innovation & Novel Patterns**.

## Project Classification

- **Project Type:** Developer tool (equation-generation and assurance framework for orchestration systems)
- **Domain:** Scientific (formalized representation, validation, and assurance methodology)
- **Complexity:** Medium for MVP with bounded scope and explicit controls; escalates to high with stronger proof obligations, wider stochastic coverage, or deep legacy semantics
- **Project Context:** Greenfield

## Document map

| If you need… | Read first… |
|--------------|-------------|
| Vision and differentiator | **Executive Summary** |
| Quantified outcomes | **Success Criteria** (including Measurable Outcomes) |
| What ships when | **Product Scope**, then **Project Scoping & Phased Development** (G1–G3) |
| User flows and evidence artifacts | **User Journeys** |
| Capability contract | **Functional Requirements** and **Traceability** (FR↔journey map) |
| Assurance controls and AOIS | **Domain-Specific Requirements** |
| Gates, competition, validation philosophy | **Innovation & Novel Patterns** |
| Documentation rigor and interpreter sequencing | **Developer Tool Specific Requirements** |
| Quality attributes and staged numeric obligations | **Non-Functional Requirements** (including Deferred metrics) |
| Claims ↔ evidence ↔ owners | **Traceability** → [evidence-decision-matrix.md](./evidence-decision-matrix.md) |
| Academic foundations / university research | [university-research-sources.md](./university-research-sources.md) |

## Success Criteria

### User Success

Users can capture an inference run as a portable artifact containing equation set, inputs, constraints, toolchain versions, and provenance metadata. From that artifact, users can deterministically replay and regenerate functionally equivalent deliverables, even when runtime implementation paths are non-deterministic.

Users can branch from prior artifacts to produce updated deliverables while preserving full lineage of what changed, why it changed, and what effect it had on outcomes. The platform succeeds for users when replay and equivalence are trusted enough to become the default validation path before promotion.

### Business Success

**3-Month Success (science advancement + credibility):**
- Demonstrate repeatable deterministic replay and functional equivalence on real workloads (not toy examples).
- Establish 3-5 design partners with documented validation outcomes.
- Publish internal/external evidence of equation-as-tools viability (case-study quality artifacts and repeatable methodology).

**12-Month Success (MVP viability + adoption):**
- MVP is production-usable for core replay/trace workflows.
- Design-partner usage converts into sustained active adoption.
- Teams report measurable reduction in rework/debug cycle time attributable to replay/equivalence workflow.
- Platform establishes category credibility as assurance-first orchestration infrastructure.

### Technical Success

- Dual-lane inference architecture supports both external LLM and self-hosted LLM paths, policy-routed by workload sensitivity and assurance class.
- Deterministic replay is guaranteed when equation artifact, input payload, tool contract versions, and replay policy are fixed.
- All promoted runs include complete immutable provenance (artifact version, input digest, tool versions, policy, decision trace, and model execution metadata).
- Equivalence validation supports strict and semantic modes with explicit tolerances and domain-specific comparators.
- Mutation validation is enforced with operator-level quality tracking and release-gating thresholds.
- Non-deterministic execution remains policy-bounded, observable, and replay-resolvable.
- Artifact schema/versioning supports backward-compatible replay and controlled migrations.

### Measurable Outcomes

- **Replay Success Rate:** >= 99.5% deterministic-labeled scenarios replay without manual intervention.
- **Equivalence Pass Rate:** >= 98% on golden corpus and 100% on critical-path workflows.
- **Trace Completeness:** 100% promoted artifacts include full lineage bundle.
- **Time-to-Reproduce:** p95 <= 5 minutes for standard replay traces.
- **Failure Diagnosability:** >= 95% replay/equivalence failures auto-classified with root cause.
- **Active Replay Teams:** sustained month-over-month growth in teams using replay/branch workflow.
- **Mutation Kill Rate (critical modules):** >= 95%.
- **Escaped Regression Rate:** downward trend quarter-over-quarter with explicit incident attribution.
- **Sovereignty Compliance Rate:** >= 99.9% of inference requests satisfy configured residency/retention/redaction policy.
- **Hosted vs Self-Hosted Parity Delta:** <= 10% quality delta and <= 20% p95 latency delta across top use cases.
- **Inference Portability Effort:** backend switch achievable through adapter/config change without application-layer rewrites.

## Product Scope

### MVP - Minimum Viable Product

- Artifact capture from prompt/inference with full provenance.
- Strict deterministic replay engine for a narrow high-value workflow set.
- Functional equivalence validation with pass/fail evidence reporting.
- Core mutation analysis with release-gating integration.
- Basic branching from prior artifacts.
- Inference abstraction layer and policy engine for dual-lane routing.
- Reference self-hosted deployment path for sensitive workloads.
- Observability for logs, lineage, and failure classification.

### Growth Features (Post-MVP)

- Multi-workflow and multi-environment replay/forking.
- Rich semantic/domain-aware equivalence modes.
- Policy simulation and controlled canary rollout for orchestration strategies.
- Collaboration and approval trails for shared artifact governance.
- Reliability and migration hardening across runtime/tool version evolution.
- Cross-backend conformance test automation and governance analytics.

### Vision (Future)

- Equation-as-tools as a general execution substrate for reproducible AI delivery.
- Cross-organization artifact portability with verifiable equivalence bundles.
- Advanced bounded stochastic orchestration with stronger formal assurance coverage.
- Legacy modernization pathways that preserve replayability, traceability, and confidence semantics.

## User Journeys

### Journey 1 - Orchestration Engineer (Primary Success Path)
- **Trigger:** Engineer needs to ship an agentic workflow with hard reliability guarantees.
- **Decision:** Generate equation artifact from prompt, then choose whether to promote based on replay/equivalence/mutation gates.
- **Outcome metric:** Candidate reaches promotable state with deterministic replay success and critical-path equivalence pass.
- **Evidence artifact:** Signed lineage bundle (equation version, input digest, policy snapshot hash, model metadata, mutation report).

**Narrative arc:** The engineer starts in uncertainty after prior unpredictable releases, reaches a first-confidence win via deterministic replay, and ends with a governed promotion decision backed by machine-verifiable evidence.

### Journey 2 - Orchestration Engineer (Primary Edge/Recovery Path)
- **Trigger:** A previously passing workflow drifts after model/backend change.
- **Decision:** Retry, rollback, or route to self-hosted lane based on divergence classification.
- **Outcome metric:** Drift is localized and remediated without uncontrolled production impact.
- **Evidence artifact:** Replay diff report, hosted-vs-self-hosted parity output, policy-route decision log.

**Narrative arc:** A high-stress incident becomes a controlled recovery because the system explains exactly what changed and preserves deterministic rollback paths.

### Journey 3 - ML/Platform Operator (Admin/Governance)
- **Trigger:** New tenant/workload requires strict sovereignty controls.
- **Decision:** Route to external or self-hosted lane, apply retention/residency/redaction policies, enforce model allowlist.
- **Outcome metric:** Policy compliance and uptime targets are met without blocking delivery.
- **Evidence artifact:** Immutable policy evaluation log, compliance dashboard snapshot, audit export package.

**Narrative arc:** Operator moves from policy anxiety to audit confidence through policy-as-code and lane-aware orchestration controls.

### Journey 4 - Assurance Analyst (Validation Gate)
- **Trigger:** Critical workflow requests production promotion.
- **Decision:** Approve, block, or require remediation based on strict equivalence, mutation quality, and replay evidence.
- **Outcome metric:** Zero critical-path promotions without full assurance gate pass.
- **Evidence artifact:** Signed approval record, threshold rationale, immutable test evidence bundle.

**Narrative arc:** Assurance becomes repeatable and objective; promotion decisions shift from debate to evidence.

### Journey 5 - Incident/Support Engineer (Troubleshooting)
- **Trigger:** Customer reports unexpected orchestration behavior.
- **Decision:** Triage severity, replay immediately or collect telemetry first, escalate to platform/integration owner.
- **Outcome metric:** MTTR improves while preserving forensic trace integrity.
- **Evidence artifact:** Incident replay template output, timeline reconstruction, root-cause classification record.

**Narrative arc:** Support transitions from guesswork to auditable diagnosis with clear handoff boundaries.

### Journey 6 - Integration Developer (API/Integration)
- **Trigger:** Team embeds artifact generation/replay gates into CI/CD pipeline.
- **Decision:** Accept new schema/contract version, apply fallback policy, or defer rollout.
- **Outcome metric:** Backend portability with no application-layer rewrites during provider/model swaps.
- **Evidence artifact:** Contract test harness report, compatibility matrix result, deprecation warning trail.

**Narrative arc:** Integration becomes stable and low-risk because interfaces are versioned, testable, and provider-agnostic.

### Journey Requirements Summary
- **Artifact lifecycle:** generate/extract, version, branch, diff, and promote equation artifacts.
- **Deterministic execution envelope:** bind execution to equation version, model version, prompt template version, and policy snapshot hash.
- **Traceability fabric:** immutable signed lineage ledger with atomic writes and replay-verifiable hashes.
- **Policy/governance plane:** residency, retention, redaction, allowlists, and dual-lane routing controls.
- **Replay/equivalence/mutation gates:** strict critical-path criteria plus semantic comparators with explicit tolerances.
- **Operational resilience:** queue QoS for replay vs mutation workloads, deterministic fallback mode, and sovereignty exception handling.
- **Troubleshooting system:** correlation IDs, structured diagnostics, root-cause auto-classification, and incident replay templates.
- **Integration surface:** stable APIs, contract tests, schema evolution rules, and provider portability via adapter/config changes.

## Domain-Specific Requirements

### Compliance & Regulatory
- Audit-readiness is a core property of the process itself.
- Every promoted decision path must emit immutable, queryable evidence suitable for audit and post-incident review.
- Compliance framework finalization is tracked as a dedicated workstream with explicit decision gates rather than deferred implicitly.

### Technical Constraints
- MVP priority is proving the mechanistic interpreter premise against current technology.
- Domain controls are invariant-driven: each transition must satisfy versioned constraints and emit reason-coded decision records.
- Unknown conditions are typed and governed (`block`, `defer`, `default-with-risk`, `escalate`) and cannot silently pass.
- Round-trip integrity across representations remains a core objective and must be measured through deterministic replay and canonical equivalence checks.

### Integration Requirements
- Integration is required but intentionally staged by assurance impact.
- Day-1 integration classes to define and ratify: identity/access, CI/CD assurance gates, observability/audit pipeline, incident workflow, and model/runtime control-plane.
- Adapter-bound interfaces are required so backend model/runtime changes do not force application-layer rewrites.

### Risk Mitigations
- Priority risks: false-equivalence confidence, reproducibility drift, opaque model behavior, and governance drift under changing policies.
- Mitigation pattern: immutable evidence logs, replay harnesses, parity checks across inference lanes, and explicit promotion-block authority.
- Any policy or comparator changes must be versioned, approved, and impact-assessed before activation.

### Computational assumptions (Phase 1)

- **Interpreter and replay** workloads are treated as CPU-bounded on partner-realistic inputs; baseline sizing is recorded during G1 quickstarts as part of the reproducibility pack (FR32), not as fixed hardware commitments in this PRD revision.
- **Evidence storage** growth per tenant is bounded by policy and quotas (FR23, FR47; NFR-SCALE-001).
- **Network** latency is dominated by hosted inference round-trips; replay, equivalence, and mutation pipelines use admission control so gate traffic cannot starve production orchestration (FR47, NFR-SCALE-001).
- **Feasibility evidence** before capacity promises: NFR-PERF-002 distributions plus G1 quickstart wall-clock and resource footprint notes.

### Domain Overlay Direction (AOIS)
- Base taxonomy remains `scientific` for continuity.
- A product-specific overlay, **Assurance-Oriented Inference Systems (AOIS)**, is established to capture controls unique to equation-as-tools orchestration.
- AOIS scope at this stage: evidence integrity, replayability contracts, policy-bound inference routing, and governed uncertainty handling.

### Decision Register & Evidence Gates
- Unresolved decisions are tracked as explicit records with owner, decision deadline, required inputs, and fallback path.
- Mandatory tracked items: sovereignty trigger policy, replay class taxonomy, Day-1 integration priorities, promotion-block authority model, comparator governance, AOIS MVP control minimums, and 90-day viability mechanisms.
- Governance cadence:
  - Weekly risk/decision review
  - Biweekly gate review
  - Monthly stop/go checkpoint with documented outcomes

## Innovation & Novel Patterns

This section extends the **Executive Summary** and **Product Scope** with competitive positioning, gate ordering, and risk mitigations; it must stay consistent with **Project Scoping & Phased Development** (flagship workflow cap, G1–G3).

### Detected Innovation Areas
- **Equation-as-Tools runtime paradigm:** orchestration logic is represented as governed executable equation assets rather than prompt-only behavior.
- **Assurance DSL direction:** invariants, tolerances, and promotion rules are codified as portable, auditable controls.
- **Dual-lane inference control:** hosted and self-hosted execution lanes are policy-routed with parity evidence and portability constraints.
- **Trace-to-equation compounding loop:** successful inference traces can be converted into reusable equation artifacts with shared gate semantics.

### Market Context & Competitive Landscape
- Category position: **Assurance Infrastructure for AI Orchestration**.
- Differentiation is evidence-gated promotion (replay + equivalence + mutation), not observability-only or workflow-only orchestration.
- Initial buyer map:
  - **Economic buyer:** VP Engineering / Head of Platform.
  - **Champion:** Staff/Principal Platform Engineer or MLOps lead.
  - **Key stakeholder:** Security/compliance lead and SRE management.
- 90-day evidence package target: 3-5 design partners, repeatable replay/equivalence datasets, and benchmarkable reliability outcomes.

### Validation Approach
- Bounded claim model:
  - Deterministic replay is guaranteed only within a defined replay envelope.
  - Functional equivalence is asserted within declared comparator contracts and tolerances.
- Gate sequence:
  - Gate 0 Integrity -> Gate 1 Replay-envelope qualification -> Gate 2 Deterministic replay -> Gate 3 Equivalence -> Gate 4 Mutation adequacy -> Gate 5 Promotion authority.
- Validation cadence:
  - 30/60/90 partner milestones with conversion evidence (rework reduction, incident MTTR improvement, audit stakeholder acceptance).
- Engineering enforcement:
  - risk-tiered test depth, canary + rollback controls, observability readiness, and anti-gaming metric constraints.

### Risk Mitigation
- **Overclaim risk:** use bounded-envelope language and comparator-governed equivalence.
- **Adoption risk:** lead with one high-value workflow and integration templates, not broad paradigm rollout.
- **Governance drift risk:** immutable evidence, version-pinned policy snapshots, and explicit decision authority.
- **Validation theater risk:** stop/go checkpoints tied to measurable partner outcomes.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Flagship-workflow mechanistic-core MVP with evidence-first validation and peer-review-grade documentation starting in Phase 1.

**Strategic intent:** Prove mechanistic interpretability under real workloads quickly enough to convert partners, without collapsing under governance or documentation overhead.

**Resource Requirements (Phase 1 baseline):** mechanistic interpreter and assurance engineers, platform engineer, product lead, and dedicated scientific documentation authorship and review capacity.

### MVP Feature Set (Phase 1 - Mechanistic Core)

**Flagship workflow constraint:** Phase 1 explicitly targets **one primary high-value workflow class** as the must-win adoption path. Broader journey coverage is deferred unless strictly required by that flagship workflow.

**Core user journeys supported in Phase 1 (minimum viable set):**
- Orchestration engineer success path (flagship)
- Drift and recovery path (flagship-adjacent)
- Assurance analyst promotion gate (flagship promotion)
- Incident and support replay troubleshooting (operational necessity)
- Minimal CI integration path for gating the flagship workflow

**Must-have capabilities (Phase 1):**
- Hosted inference lane first (self-hosted deferred to Phase 2)
- Mechanistic interpreter core
- Artifact generation and extraction baseline
- Deterministic replay within a defined replay envelope
- Equivalence validation with governed comparators
- Mutation gates for flagship critical modules
- Immutable evidence bundles and structured decision records
- Correlation identifiers and diagnosability for failures
- One authoritative quickstart (end-to-end)
- Phase 1 scientific documentation package (publishable core): whitepaper methodology, thesis-grade technical specification, reproducibility protocol

**Phase 1 program gates (pre-mortem):**
- **G1 (Day 30):** one partner completes the end-to-end quickstart with reproducible evidence output
- **G2 (Day 60):** flagship workflow runs deterministic replay gate in regular operational use
- **G3 (Day 90):** measurable operational pain reduction and explicit partner continue or convert signal
- **Stop rule:** if G3 fails, narrow the workflow class further and defer non-critical controls and features

### Post-MVP Features

**Phase 2 - Assurance Expansion**
- Self-hosted inference lane with policy-routed parity checks
- Cross-backend conformance automation
- Expanded semantic and domain-aware equivalence comparators
- Deeper integrations (identity, audit pipelines, incident systems)
- Expanded journey coverage beyond the flagship workflow class

**Phase 3 - Ecosystem & Autonomy**
- Cross-organization artifact portability
- Ecosystem scale-out and advanced bounded stochastic assurance
- Legacy modernization pathways with replayability guarantees

### Risk Mitigation Strategy

**Technical:** bounded replay envelope, golden and adversarial corpora, hard gate sequence, flagship scope cap

**Market:** one workflow win, measurable pain reduction, conversion evidence

**Resource:** publishable documentation core first; expand monograph breadth after Phase 1 proof

**Governance:** minimum viable governance until G3 evidence; scale controls with adoption

## Developer Tool Specific Requirements

### Project-Type Overview
This product is a developer-facing assurance tool with a research-grade rigor profile. MVP implementation prioritizes runtime performance and deterministic control surfaces, while preserving a long-term direction where hand-coded implementation burden is reduced through higher-level functional representations.

### Technical Architecture Considerations
- Performance-first core for interpreter, replay, and assurance-gate critical path.
- Language/runtime selection must support strict reproducibility constraints (version pinning, deterministic controls, stable traces).
- Architecture must support publication-grade reproducibility artifacts and peer-review scrutiny.
- Package/distribution and IDE surface decisions are intentionally deferred until core mechanistic validity is proven.

### Documentation & Knowledge System
- Documentation standard is scientific-community grade, not only developer onboarding quality.
- Required artifacts:
  - Whitepaper-level method documentation (assumptions, limits, validation methods).
  - Thesis-grade technical specification (interpreter semantics, equivalence model, mutation methodology, evidence model).
  - Reproducibility protocol documentation (corpora, execution envelopes, statistical treatment, result traceability).
  - Operational assurance documentation (audit model, governance controls, decision-record semantics).
- Claims must be falsifiable, reproducible, and accompanied by method + evidence instructions.

### Implementation Considerations
- MVP investment order: mechanistic interpreter correctness and evidence pipeline first, ecosystem breadth later.
- Deferred decisions tracked explicitly: package manager strategy and IDE integrations.
- Launch requires one authoritative quickstart path demonstrating end-to-end value quickly:
  - artifact generation/extraction -> replay -> equivalence/mutation gate -> evidence output.

### Language and runtime matrix (Phase 1 — binding where known)

| Surface | Phase 1 obligation | Version / pinning policy | Notes |
|---------|-------------------|--------------------------|-------|
| Mechanistic interpreter (flagship path) | Required | Semantic version pinned in promotion bundle (FR50) | Phase-1 implementation language is Python for Story-1; contracts remain language-agnostic and Rust stays evidence-gated for acceleration |
| Programmatic APIs and schemas | Required (FR27–FR29) | Declared versioning and deprecation (NFR-INT-001) | Phase-1 authoritative SDK/examples are Python-first; additional SDK languages are optional post contract freeze |
| Published quickstart and CI templates | Required (FR15, FR28) | Pinned to schema and product major.minor used in G1 evidence | Repository path for snippets is an architecture deliverable |

### Installation and distribution

- **Phase 1 hosted:** Ship a reproducible reference form for operators and partners (for example OCI image or equivalent) with locked dependencies; exact packaging is architecture-owned, but G1 requires a partner-completable install path with reproducible evidence output (FR15, Project Scoping G1).
- **Phase 2 self-hosted:** FR33 reference path must not claim platforms or topologies beyond what parity evidence (FR34) supports.

### Code and integration examples

- **Authoritative example:** FR15 end-to-end quickstart remains the primary runnable reference for Phase 1.
- **CI integration:** FR28 requires minimal pass/fail wiring examples; full snippet location and filenames are specified in architecture, not duplicated here.
- **Constraint:** Published examples MUST declare the same versions as the promotion bundle they accompany; “latest” pulls are forbidden in official examples.

## Functional Requirements

### Equation artifacts and versioning

- **FR1:** An Orchestration Engineer can create an equation artifact from a natural-language prompt.
- **FR2:** An Orchestration Engineer can derive an equation artifact from a completed inference trace.
- **FR3:** An Orchestration Engineer can view, compare, and branch equation artifact versions while preserving lineage to parent artifacts.
- **FR4:** The system can attach immutable provenance metadata to every equation artifact (inputs, policy snapshot identity, model and tool identities, timestamps, and correlation identifiers).
- **FR5:** An Orchestration Engineer can export an equation artifact and its evidence bundle for external review or archival.
- **FR53:** An Orchestration Engineer can transition an equation artifact through governed lifecycle states **draft**, **validation-in-progress**, **eligible-for-promotion**, **promoted**, and **retired**, with mandatory evidence attachments per transition where required by policy.

### Mechanistic interpretation

- **FR6:** The system can interpret equation artifacts through a mechanistic interpreter that produces structured, schema-valid intermediate representations.
- **FR7:** An Orchestration Engineer can inspect mechanistic interpretation outputs and decision reason codes for a given run.
- **FR8:** The system can enforce, per policy, one of these dispositions for unknown or indeterminate interpreter states: **block** execution; **defer** with explicit hold state; **escalate** for human review; or **allow** bounded-risk continuation with mandatory logging. None of these may be treated as silent passage as valid.
- **FR54:** When mechanistic interpretation cannot be completed, the system can produce a structured non-promotable outcome with required remediation steps (no silent downgrade to ungoverned execution for gated workflows).

### Hosted inference execution (Phase 1)

- **FR9:** The system can execute orchestration using a hosted inference lane under tenant policy.
- **FR10:** An ML or Platform Operator can configure which workloads are allowed on the hosted lane for a tenant or environment.
- **FR11:** The system can record a complete decision trace for each hosted inference execution relevant to assurance.

### Replay and reproducibility

- **FR12:** An Orchestration Engineer can replay a prior execution from a pinned equation artifact, inputs, and policy snapshot within a declared replay envelope.
- **FR13:** The system can detect replay divergence and classify root cause for diagnosis.
- **FR14:** An Incident or Support Engineer can reconstruct a production incident timeline from stored traces and replay artifacts.
- **FR15:** The system can produce a reproducible quickstart demonstration that runs end-to-end from artifact creation through replay and evidence output.
- **FR55:** An Orchestration Engineer can define and attach a replay envelope declaration to an artifact (declared allowed dependencies, side-effect class, and environment assumptions) for a flagship workflow.

### Equivalence and promotion gates

- **FR16:** An Orchestration Engineer can run equivalence validation between a candidate artifact and a reference baseline using strict or governed semantic comparators.
- **FR17:** An Assurance Analyst can approve or block promotion of a workflow based on replay, equivalence, and mutation evidence.
- **FR18:** The system can enforce that critical-path promotions cannot proceed without passing required gates.
- **FR19:** An Assurance Analyst can record a signed decision with rationale linked to the evidence bundle.

### Mutation and test assurance

- **FR20:** The system can run mutation analysis against equation or interpreter-critical surfaces and produce operator-level results.
- **FR21:** An Orchestration Engineer can view mutation results and map surviving mutants to affected functions or rules.
- **FR22:** The system can block promotion when mutation thresholds for the flagship workflow are not met.

### Policy, governance, and audit

- **FR23:** An ML or Platform Operator can define and version policies for data handling, model allowlists, and lane usage for hosted execution.
- **FR24:** The system can evaluate policy before inference execution and deny or reroute requests that violate policy.
- **FR25:** An Assurance Analyst or auditor can export an audit-oriented evidence package for a selected run or promotion decision.
- **FR26:** The system can maintain an append-only evidence log suitable for integrity verification.

### Trace completeness, exports, and integrity

- **FR35:** The system can compute and store a trace completeness score for each run and block promotion when completeness falls below the flagship workflow threshold.
- **FR36:** The system can enforce policy checks before exporting or sharing evidence bundles outside the tenant boundary.
- **FR45:** The system can verify integrity of stored evidence bundles and reject or flag tampered records on read.

### Comparator governance

- **FR37:** An ML or Platform Operator can register, version, and deprecate equivalence comparators; the system can require impact review before activating a new comparator version for production gates.

### Overrides and accountability

- **FR38:** The system can prohibit silent fallback from the mechanistic interpreter path to a non-mechanistic path unless an explicit policy allows it and the fallback is logged in the decision record.
- **FR39:** An Assurance Analyst can issue a time-bounded promotion override with reason code; the system can require post-hoc review before the override can recur for the same gate class.

### Multi-tenancy and credentials

- **FR40:** The system can enforce tenant isolation for all stored artifacts, traces, and evidence queries.
- **FR41:** An ML or Platform Operator can rotate and revoke credentials used for hosted inference and programmatic interfaces.

### Quotas, ordering, and emergency controls

- **FR46:** The system can assign canonical ordering and trusted timestamps to all decision-record events.
- **FR47:** An ML or Platform Operator can configure quotas and admission control for replay and mutation workloads per tenant.
- **FR48:** An ML or Platform Operator can halt hosted orchestration execution for a tenant or globally; the system records actor, scope, duration, and reason in immutable audit evidence.

### Model allowlists and atomic promotion

- **FR49:** The system can enforce model allowlist freshness rules (expiry, review, or deprecation) before execution.
- **FR50:** The system can promote a release only as an atomic bundle of equation artifact version, policy snapshot, and comparator configuration where required by the flagship workflow.

### Encryption and schema evolution

- **FR51:** A Tenant Administrator can configure customer-managed encryption keys for evidence at rest where the product supports that deployment mode.
- **FR42:** The system can support replay of historical artifacts across supported schema versions using declared migration or compatibility shims validated by conformance tests.

### Manual changes and notifications

- **FR52:** An Orchestration Engineer can record a declared manual change to an artifact; the system can require full re-execution of promotion gates after such a change.
- **FR56:** The system can notify designated stakeholders when a promotion gate fails or when an emergency stop is activated (channels configurable per tenant policy).

### Program gate reporting

- **FR43:** A Product Owner can view dashboard status of program gates G1, G2, and G3 per partner cohort.
- **FR44:** The system can emit a structured report artifact for each program gate evaluation with pass, fail, or incomplete status.

### Integrations and developer experience

- **FR27:** An Integration Developer can invoke artifact creation, replay, equivalence, and mutation gates through stable programmatic interfaces.
- **FR28:** An Integration Developer can integrate gate pass or fail outcomes into a CI or CD pipeline for the flagship workflow.
- **FR29:** The system can notify integrators of schema or contract changes that affect programmatic consumers.

### Scientific documentation and reproducibility (Phase 1)

- **FR30:** A Technical Author or Research Lead can publish a whitepaper-grade methodology document from the product’s documented assumptions, methods, and limitations.
- **FR31:** A Technical Author or Research Lead can publish a thesis-grade technical specification covering interpreter semantics, equivalence model, mutation methodology, and evidence model.
- **FR32:** A Technical Author or Research Lead can publish a reproducibility protocol that allows independent replication of reported results using the product’s artifacts and traces.

### Self-hosted inference (Phase 2)

- **FR33:** An ML or Platform Operator can enable a self-hosted inference lane for eligible tenants or workloads (post Phase 1).
- **FR34:** The system can run parity validation between hosted and self-hosted lanes for the same governed workload class (post Phase 1).

### Third-party verification

- **FR57:** A third-party reviewer can independently verify an exported evidence bundle’s integrity and referenced versions using documented verification steps (offline-capable where applicable).
- **FR58:** The system can produce a cryptographic attestation for an evidence bundle suitable for external verification, using at least one documented mechanism (signed manifest or hash-chain root) consistent with the verification procedure in FR57.

## Non-Functional Requirements

### Engineering sequencing principle

- **NFR-ENG-001:** Delivery follows the sequencing principle attributed to George Smith: *"Make it work, make it good, make it fast; in that order."* Phase 1 emphasizes correctness and assurance validity before optimization. Quantitative performance SLOs are set only after the mechanistic interpreter and evidence pipeline are validated on real traces; until then, measure p50/p95/p99 for interpreter, replay, and gate pipelines to inform later targets without premature numeric commitments.

### Performance

- **NFR-PERF-001 (Staged):** Quantitative performance SLOs follow the staging rule in NFR-ENG-001 (correctness before numeric latency commitments).
- **NFR-PERF-002 (Measurement):** During early validation, record p50/p95/p99 latency distributions for interpreter, replay, and gate pipelines to inform later SLO definition.

### Security

- **NFR-SEC-001 (Posture):** Adopt a defense-in-depth, default-deny security posture suitable for high-assurance tenants, with explicit threat modeling and continuous hardening. Aim for controls and assurance comparable in strictness to conservative, audit-heavy OS security-engineering practice (minimal attack surface, proactive review); exact control set is specified in a dedicated security specification rather than by slogan alone.
- **NFR-SEC-002 (Tenant isolation):** Enforce strong logical isolation for data, metadata, credentials, and administrative actions across tenants.
- **NFR-SEC-003 (Encryption):** Support encryption in transit and at rest for evidence stores and sensitive configuration; support customer-managed keys where the deployment mode allows (see FR51).
- **NFR-SEC-004 (Least privilege):** Operate all human and machine roles under least-privilege access with auditable elevation paths.
- **NFR-SEC-005 (Supply chain):** Track dependencies with vulnerability management; use signed artifacts and reproducible build practices for release candidates that touch assurance-critical components.
- **NFR-SEC-006 (Auditability):** Log security-relevant events immutably and correlate them to execution and promotion evidence.
- **NFR-SEC-007 (Specification):** Produce a dedicated security specification enumerating mandatory controls, forbidden configurations, and compliance mapping targets; treat it as a gated deliverable before general-availability assurance claims. The specification SHALL assign and maintain checklist IDs for audit closure: `SEC-CTRL-001` (posture and threat model), `SEC-CTRL-002` (tenant isolation), `SEC-CTRL-003` (encryption and key handling), `SEC-CTRL-004` (least privilege and elevation), `SEC-CTRL-005` (supply chain integrity), and `SEC-CTRL-006` (immutable security-event auditability).

#### Integrity marker (future specification)

- **NFR-SEC-EE-001:** Each application SHALL embed a unique, mechanistic-interpreter-discoverable integrity marker derived from build and assurance metadata, such that routine users and standard scanners are unlikely to encounter it while mechanistic verification can attest it is present and unmodified. The marker payload SHALL include the George Smith sequencing quote as part of its defined content. Encoding, discovery protocol, anti-tamper binding, and tests are specified in the security specification (security through obscurity alone is insufficient).

### Reliability and disaster recovery

- **NFR-REL-001:** RPO, RTO, backup and restore drills, and multi-site posture SHALL be defined through a dedicated reliability design review before production commitments; targets are not fixed in this PRD revision. The reliability review SHALL produce checklist IDs `REL-DR-001` (RPO target and validation), `REL-DR-002` (RTO target and validation), `REL-DR-003` (backup/restore drill cadence and pass criteria), and `REL-DR-004` (multi-site posture and failover evidence).
- **NFR-REL-002:** Evidence required for promotion and audit SHALL remain durable across planned maintenance and unplanned failures once RPO/RTO targets are set.

### Scalability

- **NFR-SCALE-001:** Support tenant-level quotas and fairness controls for replay and mutation workloads (see FR47).
- **NFR-SCALE-002:** Architecture SHALL support horizontal scaling of gate workers without weakening isolation or audit integrity.

### Integration quality

- **NFR-INT-001:** Public programmatic interfaces SHALL maintain backward compatibility within a declared versioning policy; breaking changes require migration guidance and conformance tests.
- **NFR-INT-002:** Gate integrations SHALL fail with actionable, machine-readable diagnostics suitable for automated pipelines.

### Scientific rigor and reproducibility

- **NFR-SCI-001:** Published methodology and results SHALL be reproducible from stored artifacts, traces, and documented protocols (see FR30–FR32).
- **NFR-SCI-002:** Performance and security claims in scientific materials SHALL be bounded to validated configurations and threat models.

### Accessibility

- **NFR-A11Y-001 (Phase 2):** WCAG-aligned accessibility requirements apply from Phase 2 onward for user-facing surfaces. Phase 1 may be CLI/API-first without broad public UI accessibility obligations unless a public UI ships earlier.

### Deferred metrics and measurement obligations

The following rows are **deferred-until-gate** obligations: they are intentional in Phase 1 and must close with named measurement artifacts before the stated claims apply.

| Obligation | Gate or trigger (no earlier than) | Measurement method when active | Owner (suggested) |
|------------|-----------------------------------|-------------------------------|-------------------|
| Numeric latency / throughput SLOs (interpreter, replay, gates) | After flagship replay, equivalence, and mutation correctness on real traces (align with G2 and NFR-ENG-001) | Published SLO document + dashboards or APM + synthetic canaries on pinned workload | Platform + Product |
| RPO, RTO, backup/restore, multi-site posture for evidence | NFR-REL-001 reliability design review complete (`REL-DR-001`..`REL-DR-004`) | RPO/RTO table + drill pass/fail record keyed by checklist IDs | Platform + Security |
| Security control baseline vs NFR-SEC-001–006 | NFR-SEC-007 specification “GA readiness” gate (`SEC-CTRL-001`..`SEC-CTRL-006`) | Conformance checklist score on internal audit keyed by checklist IDs | Security |
| Horizontal scale proof for gate workers under tenant isolation | Before multi-tenant scale claims | Load test report + isolation regression evidence | Platform |
| Scientific performance or security claims beyond bounded configs | External publication or formal review | Frozen artifact set + threat model version cited (NFR-SCI-002) | Research |

### Future product note

- **Backlog — Assurance signature generator:** A companion capability to generate per-application unique integrity markers (including quote payload, build attestation binding, and mechanistic verification hooks) across the product portfolio. Not in scope for this PRD beyond NFR-SEC-EE-001.

## Traceability

**Evidence and decision matrix (living):** [evidence-decision-matrix.md](./evidence-decision-matrix.md)

Use the matrix to map claims, **FR**/**NFR** identifiers, decisions, proof artifacts, owners, and phases so rigor is not lost when the PRD or chat context changes. Optionally record **user journey** identifiers alongside **FR** rows when a requirement primarily serves a single journey, so traceability stays explicit without duplicating the full requirement text here.

### Compact evidence-operability map (gate-critical)

| FR/NFR cluster | Expected evidence artifact type | Primary owner |
|----------------|---------------------------------|---------------|
| FR6–FR8, FR54 (mechanistic interpretation and unknown-state control) | Interpreter decision trace + reason-code conformance report | Assurance + Platform |
| FR12–FR15, FR55 (replay envelope and reproducibility) | Replay run bundle (inputs, policy snapshot, divergence classification) | Platform |
| FR16–FR19, FR37 (equivalence and comparator governance) | Comparator run report + comparator version impact review record | Assurance |
| FR20–FR22 (mutation gates) | Mutation campaign report + threshold gate decision record | Assurance + Engineering |
| FR23–FR26, FR35–FR36, FR45 (policy/audit/integrity) | Policy evaluation log export + trace completeness scorecard + integrity verification report | Platform + Security |
| FR46, FR50, FR57–FR58 (ordering, atomic promotion, external verification) | Signed promotion bundle manifest + external verification transcript | Assurance + Security |
| NFR-SEC-001..NFR-SEC-007 (including `SEC-CTRL-001`..`SEC-CTRL-006`) | Security conformance checklist and internal audit scorecard keyed by control IDs | Security |
| NFR-REL-001..NFR-REL-002 (including `REL-DR-001`..`REL-DR-004`) | Reliability review packet (RPO/RTO table + drill pass/fail evidence) keyed by checklist IDs | Platform + Security |

### Checklist ID to artifact path map

The following artifact paths are authoritative placeholders until concrete files are produced. Paths are relative to the repository root.

| Checklist ID | Artifact path placeholder | Owner |
|--------------|---------------------------|-------|
| `SEC-CTRL-001` | `mechanistic-interpreter-testing/security/sec-ctrl-001-posture-threat-model.md` | Security |
| `SEC-CTRL-002` | `mechanistic-interpreter-testing/security/sec-ctrl-002-tenant-isolation.md` | Security |
| `SEC-CTRL-003` | `mechanistic-interpreter-testing/security/sec-ctrl-003-encryption-key-handling.md` | Security |
| `SEC-CTRL-004` | `mechanistic-interpreter-testing/security/sec-ctrl-004-least-privilege-elevation.md` | Security |
| `SEC-CTRL-005` | `mechanistic-interpreter-testing/security/sec-ctrl-005-supply-chain-integrity.md` | Security |
| `SEC-CTRL-006` | `mechanistic-interpreter-testing/security/sec-ctrl-006-security-auditability.md` | Security |
| `REL-DR-001` | `mechanistic-interpreter-testing/reliability/rel-dr-001-rpo-target-validation.md` | Platform + Security |
| `REL-DR-002` | `mechanistic-interpreter-testing/reliability/rel-dr-002-rto-target-validation.md` | Platform + Security |
| `REL-DR-003` | `mechanistic-interpreter-testing/reliability/rel-dr-003-backup-restore-drills.md` | Platform + Security |
| `REL-DR-004` | `mechanistic-interpreter-testing/reliability/rel-dr-004-multi-site-failover-evidence.md` | Platform + Security |

### Validation maintenance checklist

Use this checklist before re-running PRD validation after substantive edits:

- Update `inputDocuments` in frontmatter when new supporting artifacts are introduced.
- Confirm all `SEC-CTRL-*` and `REL-DR-*` IDs referenced in NFR sections are present in the checklist map.
- Keep FR/NFR cluster mappings synchronized with `evidence-decision-matrix.md`.
- Re-run validation after changes to scope, FR/NFR wording, or gate semantics.
- Record applied simple fixes in `prd-validation-report.md` for audit continuity.

### Functional requirements to user journey map

Journey titles match **User Journeys** (J1–J6). Coverage is **indicative**; authoritative pairing for audits lives in [evidence-decision-matrix.md](./evidence-decision-matrix.md).

| Journey | Primary FR coverage (clusters) |
|---------|-------------------------------|
| J1 — Orchestration engineer (success) | FR1–FR5, FR6–FR8, FR9–FR11, FR12–FR15, FR16–FR22, FR27–FR29, FR35–FR36, FR38–FR39, FR52–FR56, FR53, FR55 |
| J2 — Orchestration engineer (drift / recovery) | FR12–FR13, FR23–FR24; FR33–FR34 when Phase 2 self-hosted lane is active |
| J3 — ML/Platform operator | FR9–FR11, FR23–FR24, FR40–FR41, FR46–FR49, FR47–FR48, FR51 where deployment mode allows |
| J4 — Assurance analyst | FR16–FR19, FR25–FR26, FR35, FR37, FR39, FR43–FR44 |
| J5 — Incident/support engineer | FR13–FR14, FR35, FR56 |
| J6 — Integration developer | FR27–FR29, FR28, FR42 |

Cross-cutting verification (FR57–FR58) supports **J4** and any journey that exports bundles for external review.
