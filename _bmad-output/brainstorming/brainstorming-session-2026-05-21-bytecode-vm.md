---
stepsCompleted: [1]
inputDocuments:
  - mechanistic-interpreter-testing/prd.md
  - mechanistic-interpreter-testing/architecture.md
  - mechanistic-interpreter-testing/glossary.md
session_topic: 'Process to identify deterministic paths in LLM/agent inference and refactor them into equation artifacts or minimal bytecode—bypassing human-readable codegen in favor of a mechanistic VM/compiler substrate'
session_goals: 'Design discovery/refactoring pipeline; define bytecode vs equation semantics; align with AOIS mechanistic interpreter PRD; explore mathematical assurance beyond unit testing'
selected_approach: 'progressive-flow'
techniques_used:
  - 'Phase 1: What If Scenarios (complete)'
  - 'Phase 2: Morphological Analysis'
  - 'Phase 3: First Principles Thinking'
  - 'Phase 4: Decision Tree Mapping'
ideas_generated: 72
trace47_protocol: mechanistic-interpreter-testing/experiments/trace-47-catastrophe-protocol.md
session_notes: 'DMN/Drools = precedent only; trace node schema is open design space'
prior_art_notes: 'DMN spec + Drools + Python bytecode compiler reducing DMN to assembler-like CPU instructions'
stepsCompleted: [1, 2, '4-atomic-wins', 'v0-shipped']
convergence_mode: atomic-wins-backlog
v0_release: mechanistic-interpreter-testing/V0-RELEASE.md
v0_closed: 2026-05-21
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** Onimurasame
**Date:** 2026-05-21

## Session Overview

**Topic:** Process to identify deterministic paths in LLM/agent inference and refactor them into equation artifacts or minimal bytecode—bypassing human-readable codegen in favor of a mechanistic VM/compiler substrate.

**Goals:** Design discovery/refactoring pipeline; define bytecode vs equation semantics; align with AOIS mechanistic interpreter PRD; explore mathematical assurance beyond unit testing.

### Context Guidance

Loaded from repository (mechanistic-interpreter-testing):

- **AOIS / equation-as-tools:** Orchestration encoded as governed equation artifacts with synthesis-from-prompt and extraction-from-trace paths.
- **Mechanistic interpreter (FR6–FR7, FR54):** Structured schema-valid IR; reason codes; no silent downgrade on failure.
- **Assurance model:** Replay envelope, equivalence validation, mutation analysis—not conventional unit-test-only gates.
- **User thesis:** Human-readable codegen is the wrong target audience (LLMs read execution artifacts); bytecode may be non-deterministic at runtime but must be *mechanistically testable*; traditional testing is insufficient for this assurance class.

### Session Setup

Confirmed progressive flow. Phase 1 started 2026-05-21. Prior art: DMN→assembler bytecode compiler (Python).

## Phase 1 — What If Scenarios (Wave 1)

### Technique Execution Results (Phase 1 — partial)

**[Category #1]**: DMN-as-Genome
_Concept_: Treat DMN decision tables as the first "equation artifact" format; LLM traces that resemble decision flows compile to DMN-IR then to your existing assembler-like opcodes.
_Novelty_: Reuses proven Drools/DMN semantics instead of inventing a new orchestration language from scratch.

**[Category #2]**: Drools Bytecode Port
_Concept_: Lift your Python DMN→CPU-instruction compiler into the AOIS mechanistic interpreter as a backend target; Drools becomes reference semantics, your VM becomes execution semantics.
_Novelty_: Assurance = "bytecode replay matches Drools reference evaluation" on golden DMN corpora.

**[Category #3]**: Trace Feels Like DMN
_Concept_: Path-identification heuristics flag inference subgraphs that are structurally isomorphic to decision tables (inputs → rules → outputs) for automatic DMN extraction.
_Novelty_: Deterministic-path discovery is pattern matching to DMN shapes, not generic control-flow recovery.

**[Category #4]**: FEEL-as-Opcodes
_Concept_: Map DMN FEEL expressions to a minimal fixed opcode set (compare, hit policy accumulate, unary test, interval) shared by LLM-extracted and hand-authored rules.
_Novelty_: One opcode vocabulary spans business rules and agent orchestration.

**[Category #5]**: Hit Policy in GPU
_Concept_: What if FIRST/UNIQUE/PRIORITY hit policies are SIMD lanes—each rule row is a parallel predicate vector, bus delivers input features once, lanes vote.
_Novelty_: Decision tables become a native GPU kernel class, not a CPU interpreter loop.

**[Category #6]**: No Source, Only Proofs
_Concept_: What if the only human-facing artifact is a proof obligation list; bytecode is emitted solely for mechanistic interpreter + solver consumption.
_Novelty_: Inverts CI—promotion requires proof pass, not test pass.

**[Category #7]**: LLM Writes Opcodes Not Python
_Concept_: Codegen target is always your assembler-like IR; Python/Rust are deprecated emitters for Story-1 compatibility only.
_Novelty_: Aligns PRD "equation artifact" with physical ISA-like tokens LLMs can diff and mutate.

**[Category #8]**: Stochastic Opcodes Legal
_Concept_: Bytecode includes PRNG-seeded opcodes with envelope metadata; mechanistic tests verify distribution bounds, not single outcomes.
_Novelty_: Non-deterministic bytecode is first-class with mathematical contracts (moments, quantiles, invariants).

**[Category #9]**: Inference Trace = Bootloader
_Concept_: A completed agent run is a one-time bootloader that compiles itself down to bytecode, then never runs the LLM path again for that workflow class.
_Novelty_: LLM is extraction cost, VM is marginal cost—economic forcing function for refactor.

**[Category #10]**: Mutation at Opcode Level
_Concept_: Mutation testing swaps opcodes and table rows (DMN-style) rather than mutating prompts or Python ASTs.
_Novelty_: Directly extends PRD mutation gates to ISA-level surfaces.

**[Category #11]**: Orchestration Engineer = ISA Designer
_Concept_: Role shifts from "review generated code" to "approve opcode vocabulary extensions and bus contracts."
_Novelty_: UX pivot—governance on instruction set architecture, not pull requests on .py files.

**[Category #12]**: Design Partner KPI: ISA Shrinks
_Concept_: Success = median promoted workflows use fewer distinct opcodes quarter over quarter (compression without capability loss).
_Novelty_: Business metric tied to minimal representation thesis.

**[Category #13]**: Equation Artifact = DMN Package
_Concept_: equation artifact serializes as DMN XML + bytecode twin; mechanistic interpreter checks bijection between them.
_Novelty_: Dual representation for audit (DMN) vs execution (bytecode).

**[Category #14]**: Drools as Oracle Lane
_Concept_: Dual-lane architecture adds "reference lane" (Drools JVM) vs "fast lane" (your VM); equivalence gate must pass before promotion.
_Novelty_: Mirrors PRD hosted/self-hosted parity but for rule semantics.

**[Category #15]**: Reason Codes = CPU Flags
_Concept_: FR7 reason codes map to flag register bits set by last opcode (HIT, MISS, CONFLICT, BOUNDED_STOCH).
_Novelty_: Inspection UX is debugger-style register dump, not log archaeology.

**[Category #16]**: Deterministic Path Paint
_Concept_: Trace visualization "paints" edges green where entropy collapses (single successor, constant output); yellow where policy-bounded; red where forbidden for promotion.
_Novelty_: Discovery UI is thermodynamics of inference, not stack traces.

**[Category #17]**: Compiler Phases = OS Boot
_Concept_: Extract → normalize → DMN-ize → opcode emit → link → seal is explicit boot chain; each phase emits evidence bundle segment.
_Novelty_: AOIS promotion bundle mirrors boot attestations.

**[Category #18]**: Anti-Pattern: Readable Fallback
_Concept_: What if emitting Python is classified as policy violation unless explicit override with post-hoc accountability (FR38 analog).
_Novelty_: Makes your thesis enforceable in product, not philosophy.

**[Category #19]**: CXL Memory Fabric for Traces
_Concept_: What if inference trace bundles live in CXL-attached memory pools shared by CPU interpreter and GPU rule evaluator—zero-copy hot path.
_Novelty_: Hardware exploration—new data pathway for trace→bytecode hot loop.

**[Category #20]**: UCIe Orchestration Chiplet
_Concept_: Dedicated chiplets expose opcode dispatch and DMN row parallel eval; host CPU only schedules envelopes and policy.
_Novelty_: Processor architecture hypothesis—"decision accelerator" beside GPU/NPU.

**[Category #21]**: NVLink-Style "Policy Bus"
_Concept_: Separate low-latency bus carries policy snapshots and reason-code streams, never mixed with payload tensors on GPU paths.
_Novelty_: Data bus specialization—governance traffic isolated from compute traffic.

**[Category #22]**: NPU Runs Bytecode Not Models
_Concept_: After extraction, edge NPU executes fixed opcode programs; LLM only on cold-start extraction in cloud.
_Novelty_: Inverts typical NPU story (always inference) to always-VM.

**[Category #23]**: FPGA Hit-Policy Fabric
_Concept_: PRIORITY/RULE ORDER encoded in FPGA priority encoders; mechanistic tests are timing + equivalence vs software oracle.
_Novelty_: Hardware path for DMN hit policies you already understand semantically.

**[Category #24]**: Optical Bus for Evidence Bundles
_Concept_: Immutable evidence bundles stream optically between assurance appliance and execution fabric—tamper-evident physical layer.
_Novelty_: Wild hardware—assurance as physical layer problem.

## Phase 1 — What If Scenarios (Wave 2: Trace Thermodynamics / Determinability Signals)

**[Category #25]**: Zero Fan-In Collapse
_Concept_: A trace subgraph is determinizable when all decision nodes have fan-in=1 from typed inputs (no merge of ambiguous branches); paint green when collapse holds.
_Novelty_: Graph metric replaces "model said so" as promotion signal.

**[Category #26]**: Token Entropy Cliff
_Concept_: Per-step Shannon entropy on next-token distributions shows cliffs—post-cliff spans are frozen into bytecode; pre-cliff stays LLM-resolved.
_Novelty_: Uses model internals (if available) or logprob proxies from API traces.

**[Category #27]**: Tool Call Purity
_Concept_: Subgraph where every tool invocation has schema-valid I/O and identical output hash across N replays with fixed envelope is automatically "hard extracted."
_Novelty_: Determinism proven by replay hash, not by reading generated code.

**[Category #28]**: Argument Lattice Stability
_Concept_: Function/tool arguments form a lattice; determinizable when join (least upper bound) of arguments across branch variants is a single constant tuple.
_Novelty_: Abstract interpretation on trace args, not on source AST.

**[Category #29]**: Prompt Slice Invariance
_Concept_: Ablate prompt segments in replay; subgraph determinizable if output unchanged under all ablations except one labeled "control slice."
_Novelty_: Sensitivity analysis as discovery—finds minimal causal prompt surface.

**[Category #30]**: DMN Footprint Match
_Concept_: Subgraph isomorphism score vs canonical DMN shapes (single table, chained tables, decision service); score > θ ⇒ route to DMN extractor.
_Novelty_: Connects thread B directly to your prior DMN compiler.

**[Category #31]**: FEEL-Expressible Boundary
_Concept_: Only promote extraction when intermediate predicates are FEEL-expressible within opcode budget; else FR54 with "semantic gap" reason code.
_Novelty_: Compiler rejects traces language cannot lower—bounded claims.

**[Category #32]**: Branching Factor Budget
_Concept_: Agent trace nodes tagged with branching factor b; policy allows extraction only if b ≤ b_max or stochastic envelope declared.
_Novelty_: Makes "constrained stochastic orchestration" from PRD a measurable trace invariant.

**[Category #33]**: Time-Travel Consistency
_Concept_: Re-run subgraph with shifted timestamps/timezones; determinizable if outputs invariant—catches hidden Date.now() leakage in tool chains.
_Novelty_: Environmental perturbation as test, not unit assertion.

**[Category #34]**: Causal DAG Rank
_Concept_: Build causal DAG from trace events; determinizable components are nodes where all parents are green and no unobserved confounder (external API without contract).
_Novelty_: Imports causal discovery vocabulary into AOIS.

**[Category #35]**: Side-Effect Class Seal
_Concept_: Architecture's side-effect class on replay envelope—subgraphs touching WRITE_NETWORK without contract are yellow/red, never silently promoted.
_Novelty_: Aligns trace paint with architecture trust boundaries.

**[Category #36]**: Comparator Witness Nodes
_Concept_: Insert explicit witness events in trace where equivalence comparators must attach; missing witness = incomplete trace per FR completeness.
_Novelty_: Discovery knows *where* proof must land, not just end-state diff.

**[Category #37]**: Logit Temperature Floor
_Concept_: What if we only extract spans where decoding temperature → 0 replay matches temperature > 0 majority vote—"crystallized" decisions.
_Novelty_: Links sampling randomness to extractability without banning stochastic bytecode globally.

**[Category #38]**: Multi-Run Consensus Graph
_Concept_: N traces same input envelope; intersection of identical subgraph outputs defines determinizable core (voting on structure not tokens).
_Novelty_: Handles non-deterministic LLM—consensus extraction like Byzantine agreement lite.

**[Category #39]**: Divergence Taxonomy Tag
_Concept_: Architecture mentions divergence taxonomy—auto-tag trace forks as ENV, MODEL, POLICY, INPUT; only MODEL-fork-free subgraphs promote to bytecode.
_Novelty_: Root-cause aware extraction, not blind diff.

**[Category #40]**: Unknown State Quarantine
_Concept_: Any node emitting unknown-state reason code infects downstream paint red until decontamination via extra replay or human gate.
_Novelty_: FR "no silent unknown" applied topologically on trace graph.

**[Category #41]**: Thermodynamic Phase Diagram
_Concept_: 2D phase map: entropy (x) vs side-effect risk (y); quadrants define SOLID (extract), LIQUID (stochastic bytecode), GAS (stay LLM), PLASMA (block).
_Novelty_: UX for orchestration engineers—literally shows where workflow "condenses."

**[Category #42]**: Extract = Condensation Enthalpy
_Concept_: Metric ΔE = cost(LLM path) − cost(VM path); only auto-extract if ΔE > threshold and assurance passes—economic signal combined with thermodynamics metaphor.
_Novelty_: Business-technical hybrid on same diagram.

**[Category #43]**: Trace Diff as Calorimetry
_Concept_: Heat map of token/tool churn between runs; cold regions are deterministic candidates.
_Novelty_: Visual discovery from differential traces, not single run.

**[Category #44]**: Legacy COBOL Shape Echo
_Concept_: Pattern library includes legacy rule shapes (not just DMN)—trace segments matching GO TO-less decision blocks get modernization tags.
_Novelty_: Domain pivot—legacy modernization path from PRD vision.

**[Category #45]**: Regulatory Retention Hot
_Concept_: Subgraphs handling PII emit heat on retention policy axis; determinizable only with redaction opcode path proven.
_Novelty_: Compliance dimension orthogonal to entropy.

**[Category #46]**: Adversarial Trace Injection
_Concept_: Red team poisons traces with near-DMN shapes that fail opcode lowering—trains extractors and blocks false green paint.
_Novelty_: Security pivot—discovery must be adversarially robust.

**[Category #47]**: Black Swan: Oracle Drift
_Concept_: What if model firmware update shifts logprobs but output text identical—extractor must version model execution metadata (PRD provenance) or false determinizable.
_Novelty_: Edge case forcing envelope pinning.

**[Category #48]**: Hardware Trace Snoop
_Concept_: On decision accelerator, performance counters (branch mispredict, row hit counts) feed back to confirm software-painted green regions.
_Novelty_: Hardware validates thermodynamics paint—closes loop to thread C later.

## Atomic Wins Convergence (2026-05-21)

Fuzzy whole-system scope decomposed into **22 atomic wins** + **3 expert packets**.

**Backlog:** [atomic-wins-backlog.md](./atomic-wins-backlog.md)

**Principle:** Expert conversations attach to one AW-* item (schema, freeze, NSHR gate), not "bytecode agents" wholesale.

**Shipped:** AW-001, AW-010, AW-011, AW-050, AW-021 ✅ + expert-feedback scaffold.

**Status:** Atomic wins through AW-042, expert packets A/B/C, party-mode review complete.

**Next (v0.5):** production capture hooks, content-addressed prereg, one partner claim end-to-end.

**Artifacts:** `mechanistic-interpreter-testing/docs/expert-packet-a-trace-node-v0.md`

---

## Trace-47 Adversarial Acceptance Protocol

Designed per party-mode option 4 (Mary's Clean Compile Catastrophe). Full spec: [trace-47-catastrophe-protocol.md](../../mechanistic-interpreter-testing/experiments/trace-47-catastrophe-protocol.md). Evidence matrix: **E-014**.

**Core rule:** Phase A (replay/compile/mutation green) is insufficient; Phase C (ablation necessity vs random-span control) gates Tier-A promotion.

---

## Phase 1 — What If Scenarios (Wave 3: Trace Node Ontology — greenfield)

**[Category #49]**: Five Primitive Event Kinds
_Concept_: Every trace event is exactly one of: OBSERVE (read world), TRANSFORM (pure fn), COMMIT (write world), CHOOSE (branch), DELEGATE (spawn sub-agent). Subgraphs determinizable when no COMMIT without contract and CHOOSE has bounded fan-out.
_Novelty_: Minimal ontology—no DMN, no code AST—just epistemic classes.

**[Category #50]**: Span Tree Not Chat Log
_Concept_: Trace is OpenTelemetry-style span tree: parent workflow span, child LLM spans, leaf tool spans. Determinizable = subtree where all leaves are TRANSFORM or contracted COMMIT.
_Novelty_: Industry-familiar structure; avoids inventing chat-turn semantics.

**[Category #51]**: Token Span as Filler
_Concept_: LLM token streams are optional annotations on CHOOSE/DELEGATE spans—not first-class nodes—reducing noise for extraction.
_Novelty_: Text is evidence, not program; lowers false "determinizable" from fluent prose.

**[Category #52]**: Input Digest Anchors
_Concept_: Each span carries input_digest; determinizable if child output is function(output_digest(parent_inputs)) verified by replay.
_Novelty_: Pure replay hash signal (#27) without understanding content.

**[Category #53]**: Boundary at Side-Effect
_Concept_: Extraction frontier stops at first COMMIT unless commit_semantics in replay envelope; everything before frontier is candidate SOLID.
_Novelty_: Aligns with architecture side-effect classes without DMN shapes.

**[Category #54]**: CHOOSE Without LLM
_Concept_: Branch decided by tool JSON field or router policy, not sampling—CHOOSE span tagged source=policy|tool|model; only policy|tool extract by default.
_Novelty_: Separates "agent felt like deciding" from machine-decidable branch.

**[Category #55]**: DELEGATE Depth Cap
_Concept_: Nested agents increase DELEGATE depth; policy: extract only depth≤d and summarize deeper agents as opaque DELEGATE blobs with hash contract.
_Novelty_: Handles multi-agent without full recursive decompilation.

**[Category #56]**: Witness Span Type
_Concept_: Explicit WITNESS spans emitted at comparator points (architecture #36); trace incomplete if promotion path lacks witnesses.
_Novelty_: Schema-first assurance, not post-hoc log scraping.

**[Category #57]**: Frozen Subgraph Certificate
_Concept_: When SOLID, compiler emits certificate: span_ids, digests, opcode_len—replay verifies certificate before running bytecode.
_Novelty_: Promotion artifact smaller than full trace.

**[Category #58]**: LIQUID Spans Carry Envelope Ops
_Concept_: Non-frozen spans compiled to stochastic opcodes + envelope {seed_policy, quantile_bounds, sample_count}.
_Novelty_: Makes partial extraction normal—workflow is patchwork not monolith.

**[Category #59]**: GAS Spans Stay Interpreted
_Concept_: Unbounded CHOOSE/model branches remain GAS—executed only via LLM lane in dual-lane architecture; never silent fallback.
_Novelty_: Matches PRD dual-lane without requiring full determinism.

**[Category #60]**: Trace Node = Tuple Not Text
_Concept_: Canonical node payload is (kind, inputs_digest, outputs_digest, policy_snapshot_id, parent_id); natural language is attachment.
_Novelty_: LLM-readable via attachments; VM reads tuples—your "wrong audience for code" thesis at schema level.

**[Category #61]**: Provenance Edge Labels
_Concept_: Edges labeled derives_from (data), triggered_by (control), constrained_by (policy)—extraction preserves edge labels in bytecode linking table.
_Novelty_: Lineage is graph semantics, not metadata footer.

**[Category #62]**: Unknown Node Type
_Concept_: Events that fail classifier emit kind=UNKNOWN with reason code; downstream paint red (#40)—forces schema evolution explicitly.
_Novelty_: Unknown is first-class, not parsing failure buried in logs.

**[Category #63]**: What If Traces Are Written by VM
_Concept_: Instrumentation API only—agents cannot "log"; they request OBSERVE/COMMIT through VM syscalls so trace is always well-typed.
_Novelty_: Radical—no post-hoc recovery from messy logs; greenfield discipline.

**[Category #64]**: What If Traces Are Inferred Post-Hoc
_Concept_: Brownfield: infer span tree from existing logs via LLM-assisted structuring—lower assurance tier, cannot promote without upgrade path.
_Novelty_: Two-tier adoption; matches phased PRD.

**[Category #65]**: Diff-Only Trace Storage
_Concept_: Store span deltas between steps; determinizable when delta chain collapses to constant propagation (like partial eval).
_Novelty_: Compression + signal: stable deltas = extractable.

**[Category #66]**: User Correction Spans
_Concept_: Human edit mid-run inserts CORRECT span; breaks determinizable paint until re-simulated under envelope.
_Novelty_: HITL reality for agent workflows.

**[Category #67]**: Equiv Span Pairing
_Concept_: After extraction, run spawns EQUIV_TEST child span; must match parent outputs—embedded self-check in trace schema.
_Novelty_: Assurance is part of trace grammar, not external CI only.

**[Category #68]**: Minimal Viable Trace (MVT)
_Concept_: MVP requires only: span tree, digests, policy_snapshot_id, model_metadata—tokens optional; proves path without full observability.
_Novelty_: Answers "what node looks like" for Phase 1 scope cut.

**[Category #69]**: Non-DMN Determinizable Example: Pure Calculator
_Concept_: Tool chain `parse_json → compute_tax → format` with stable hashes—SOLID, zero DMN—lowers to TRANSFORM opcodes only.
_Novelty_: Concrete answer to "seen without DMN?"—yes, pure transforms.

**[Category #70]**: Non-DMN Example: Policy Router
_Concept_: Branch on header tenant_id to shard—CHOOSE source=policy, bounded fan-out—extracts to jump table bytecode.
_Novelty_: Business logic without decision tables.

**[Category #71]**: Non-DMN Example: Retrieval Gate
_Concept_: RAG retrieve + score threshold CHOOSE; LIQUID if score noisy, SOLID if top-k stable across replays.
_Novelty_: Shows retrieval workflows aren't automatically GAS.

**[Category #72]**: MVP Signal Priority: Hash First
_Concept_: Ship with Layer 1 only—replay hash stability + side-effect seal; defer entropy/DMN footprint to Growth.
_Novelty_: Direct answer to Q3 reframed: not DMN-first, hash-first.
