# AOIS Domain Glossary

This glossary is the canonical source for domain language used in `prd.md`, `architecture.md`, `epics.md`, and related decision artifacts.

## Usage Rules

- New domain-significant terms must be added here before they are used in stories or acceptance criteria.
- Preferred term must be used in story text; aliases are for search and migration only.
- `status` values:
  - `approved`: allowed for active usage
  - `alias`: non-preferred synonym of an approved term
  - `deprecated`: avoid in new content; map to replacement

## Glossary Governance

- **Owner:** Product + Architecture (joint ownership); reviewers: BA and Engineering.
- **Change protocol:** Any new or modified term requires:
  1. glossary entry update in same change,
  2. impacted artifact list (`epics`, ADRs, tests, matrices),
  3. status and rationale update.
- **Approval SLA:** term changes must be reviewed before related story approval.
- **Rollback rule:** if term change introduces ambiguity or conflicts, revert to prior approved definition and mark candidate as `deprecated` or `alias` until resolved.
- **Review cadence:** monthly glossary review and on-demand review for story-blocking terminology conflicts.

## Terms

| term | status | definition | aliases | source artifacts |
|---|---|---|---|---|
| Assurance-Oriented Inference Systems (AOIS) | approved | Domain overlay for governed inference systems emphasizing bounded claims, immutable evidence, replayability, and controlled uncertainty handling. | AOIS | `prd.md`, `architecture.md` |
| equation artifact | approved | Versioned machine-operable representation of orchestration logic with lifecycle and provenance metadata. | artifact | `prd.md`, `architecture.md` |
| inference trace bundle | approved | Persisted record of run-level inference events, inputs, policy context, tool interactions, and outputs used for replay and extraction. | trace bundle | `epics.md`, `architecture.md` |
| run evidence bundle | approved | Canonical evidence package emitted for a run, including trace/result artifacts and policy/decision metadata. | evidence bundle | `architecture.md`, `prd.md` |
| replay envelope | approved | Declared dependency and environment boundary under which replay claims are valid. | replay contract | `prd.md` |
| policy snapshot | approved | Version-pinned policy state applied at execution time for determinism and auditability. | policy version snapshot | `prd.md`, `architecture.md` |
| reason code | approved | Machine-readable coded explanation for governed decisions and outcomes. | decision code | `architecture.md`, `prd.md` |
| complete-with-redaction | approved | Trace completeness status where mandatory fields are present and sensitive segments are redacted with valid reason codes. | redacted-complete | `epics.md` |
| compatibility matrix | approved | Governance artifact specifying allowed version combinations for prompt, trace schema, and model versions. | version compatibility matrix | `epics.md`, `architecture.md` |
| token economy | approved | Domain control framework for budget-aware execution with threshold-based enforcement and fallback actions. | NFR21 controls | `epics.md`, `prd.md` |
| deterministic fallback | approved | Ordered, policy-governed degradation path applied under constrained conditions. | fallback chain | `epics.md` |
| non-promotable | approved | Artifact or run state indicating blocked promotion due to failed required controls/evidence. | promotion-blocked | `epics.md`, `prd.md` |
| control catalog | approved | Canonical list of governance controls referenced by IDs instead of duplicated prose. | control register | `epics.md` |
| requirement trace matrix | approved | Artifact mapping requirements to stories, tests, controls, and evidence outputs. | traceability matrix | `epics.md`, `evidence-decision-matrix.md` |
| governed export package | approved | Policy-evaluated, integrity-sealed export artifact that bundles a referenced equation artifact, linked run evidence bundle(s), and export metadata for external review or archival; excludes silent omission of mandatory provenance fields. | export bundle, external review package | `epics.md`, `prd.md` (FR5, FR36) |
| export manifest | approved | Machine-readable index inside a governed export package listing included object identifiers, schema versions, content hashes, policy snapshot identity, and verification procedure references. | package manifest | `epics.md`, `prd.md` (FR57) |
| external sharing boundary | approved | Policy-defined limit for exporting or sharing evidence outside the owning tenant context; export and share operations evaluate this boundary before release of bytes (FR36). | tenant boundary (export) | `prd.md`, `epics.md` |

## Trace & Span Ontology (v0-approved — AW-001)

_Status: **approved for v0 fixture scope** (2026-05-21). Global ontology decisions remain open in `docs/open-decisions-trace-v0.md`; terms below are frozen for calculator and trace-47 workflows only._

| term | status | definition | aliases | source artifacts |
|---|---|---|---|---|
| trace span | approved-v0 | Minimal named unit in an inference trace tree with `kind`, `inputs_ref`, `outputs_ref`, `parent_span_id`, and `lifecycle_state`. Not a log line or raw token. | span | `trace/schema/trace-v0.schema.json`, `docs/expert-packet-a-trace-node-v0.md` |
| span kind OBSERVE | approved-v0 | Ingress/read of world state into the workflow carrier (API response, request body, retrieval result). Anti-pattern: labeling model paraphrase as authoritative OBSERVE without provenance. | observe | AW-001 |
| span kind TRANSFORM | approved-v0 | Computation intended pure under replay envelope; v0 requires `effect_class: pure`. Anti-pattern: hiding LLM sampling inside TRANSFORM without CHOOSE + pinned completion. | transform | AW-001 |
| span kind COMMIT | approved-v0 | Durable or external write; requires `commit_seal.durability_class` (`ephemeral`, `audit`, `external`). Anti-pattern: COMMIT without seal. | commit | AW-001, AW-023 |
| span kind CHOOSE | approved-v0 | Branch taken; requires `choose_ledger` with `choose_source` (`policy`, `tool`, `model`, `env`). Model-sourced CHOOSE is residual, not silently promoted to bytecode. | choose | AW-001, AW-013 |
| span kind DELEGATE | approved-v0 | Sub-workflow invocation; requires `delegate_target_hash` and `capability_bound_hash`. Anti-pattern: DELEGATE without child trace closure. | delegate | AW-001 |
| span lifecycle state | approved-v0 | Per-span state: `CAPTURED` → `CANDIDATE` → `FROZEN` → `PROMOTED`. Distinct from run-level exploratory phases (see open decision OD-002). | span state | AW-003 |
| carrier (digest) | approved-v0 | Fields included in certificate/replay hash: `inputs_ref`, `outputs_ref`, ledger/seal fields per kind. | semantic carrier | `docs/expert-packet-a-trace-node-v0.md` |
| attachment (witness) | approved-v0 | Optional human-readable or diagnostic payload excluded from certificate digest unless explicitly promoted via policy. | witness | AW-004 |
| frozen span certificate | approved-v0 | Immutable digest over a selected span subtree under a replay envelope (`certificate-v0`); attachments excluded from digest; authoritative for replay claims when lowering is lossy. | span certificate | `trace/scripts/freeze_certificate.py`, Trace-47 protocol |
| assurance tier A | approved-v0 | Mechanistic: counterfactual necessity demonstrated (e.g. NSHR ≥ θ). | Tier A | `docs/claim-template-v0.md`, Trace-47 |
| assurance tier B | approved-v0 | Narrative: replay/compile/mutation green; necessity not shown. Promotion blocked for mechanistic claims. | Tier B | Mary party-mode |
| assurance tier C | approved-v0 | Forensic: trace archived only; no promotion claim. | Tier C | Mary party-mode |
| inference trace v0 | approved-v0 | JSON trace document conforming to `trace-v0` schema for orchestration-scale fixtures. | trace-v0 | `trace/schema/trace-v0.schema.json` |
| replay divergence SCHEMA_DRIFT | approved-v0 | FR13-direction reason code: trace/certificate structure, validation, or schema version mismatch. | schema drift | `trace/scripts/classify_replay_divergence.py` |
| replay divergence ENV_DRIFT | approved-v0 | FR13-direction reason code: replay envelope, policy snapshot, or model identity mismatch. | environment drift | `trace/scripts/classify_replay_divergence.py` |
| replay divergence OUTPUT_DRIFT | approved-v0 | FR13-direction reason code: replayed outputs differ from expected under fixed envelope. | output drift | `trace/scripts/classify_replay_divergence.py` |
| Trace-47 preregistration | approved-v0 | Pre-registered experiment parameters (θ, α, perturbation families) before ablation; `trace-47-prereg-v0`. | prereg | `experiments/fixtures/trace-47-prereg.example.json` |
| CERT_MISMATCH | approved-v0 | Promotion integrity reason: frozen certificate does not bind to trace (SWAP-CERT / wrong trace_id, envelope, or span_ids). | swap cert | `trace/scripts/verify_certificate_binding.py` |
| certificate binding | approved-v0 | Verification that certificate v0 fields match trace v0 before NSHR or promotion gates run. | cert binding | AW-036 |

### Worked examples (AW-001)

1. **Calculator pipeline (SOLID):** OBSERVE request → TRANSFORM parse → TRANSFORM tax → TRANSFORM format. See `trace/fixtures/trace-calculator-v0.json`.
2. **Policy router (CHOOSE):** CHOOSE with `choose_source: policy` on `tenant_id`; bounded fan-out.
3. **Retrieval gate (LIQUID candidate):** OBSERVE retrieval + CHOOSE on score; may stay CANDIDATE until replay-stable across envelope.

### Carrier vs attachment (AW-004)

| Class | In digest? | Examples |
|-------|-----------|----------|
| Carrier | Yes | `inputs_ref`, `outputs_ref`, `choose_ledger`, `commit_seal` |
| Attachment | No (default) | NL prompt text, token stream dumps, UI labels |

Violation: putting prompt prose in carrier while claiming byte-stable replay without pinning completion.
