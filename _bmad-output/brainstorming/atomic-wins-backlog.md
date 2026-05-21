---
title: Atomic Wins Backlog
source_session: brainstorming-session-2026-05-21-bytecode-vm.md
purpose: Small falsifiable deliverables for expert-ready discussions — not whole-system delivery
updated: 2026-05-21
v0_status: closed
---

# Atomic Wins Backlog

**v0 closure (2026-05-21):** Tracks A–F v0 deliverables complete. See `mechanistic-interpreter-testing/V0-RELEASE.md`.

**Rule:** Each win fits one conversation with an expert, one demo, one evidence row. No win requires the full bytecode VM, hardware fabric, or settled ontology war.

**Deferred (explicitly not in this backlog):** GPU/chiplet buses, full agent→bytecode compiler, abstract interpretation story, DMN/Drools port, production multi-tenant scale.

---

## How to read this

| Field | Meaning |
|-------|---------|
| **ID** | Stable reference |
| **Done when** | Binary acceptance — no fuzzy "mostly works" |
| **Expert hook** | What to ask a PL/systems/partner reviewer |
| **Evidence** | Artifact a skeptic opens |
| **Depends on** | Prior win IDs |

---

## Track A — Language experts can argue about (1–2 weeks each)

### AW-001 — Span kind enum v0 (5 kinds, definitions only) ✅

- **Done when:** `glossary.md` adds five kinds with one paragraph each + anti-patterns; no implementation.
- **Expert hook:** "Are these five effect classes enough for orchestration agents (not training loops)?"
- **Evidence:** `glossary.md` § Trace & Span Ontology; `docs/open-decisions-trace-v0.md`
- **Depends on:** —
- **Completed:** 2026-05-21

### AW-002 — Claim template v0 (one page)

- **Done when:** Template: *Mechanism M / Rule R / Evidence E / Assumption A* with one filled example for replay-only Tier B.
- **Expert hook:** "Is this an honest assurance class statement?"
- **Evidence:** `docs/claim-template-v0.md` (or appendix in spec).
- **Depends on:** AW-001

### AW-003 — Phase state machine (span lifecycle only)

- **Done when:** Diagram + table: span states `CAPTURED → CANDIDATE → FROZEN → PROMOTED` vs run states; LIQUID/GAS mnemonic mapped to states (not separate physics).
- **Expert hook:** "Is phase a lifecycle or a timestep?" (Paige muddiness resolved.)
- **Evidence:** One-page state machine doc.
- **Depends on:** AW-001

### AW-004 — Attachment vs carrier rule

- **Done when:** Written rule: what goes in digest (carrier) vs witness attachment; 2 violations documented.
- **Expert hook:** "Does this prevent Winston's non-composing trace?"
- **Evidence:** Decision record ADR-sized.
- **Depends on:** AW-001

---

## Track B — Trace capture (minimal, orchestration-scale)

### AW-010 — Synthetic trace fixture (calculator) ✅

- **Done when:** Single JSON/CBOR file: 3–7 spans, pure TRANSFORM chain, no LLM; validates against schema v0.
- **Expert hook:** "Is this a sufficient minimal trace for replay tests?"
- **Evidence:** `trace/fixtures/trace-calculator-v0.json`
- **Depends on:** AW-001, AW-004
- **Completed:** 2026-05-21

### AW-011 — Trace schema v0 (JSON Schema or CBOR schema) ✅

- **Done when:** Schema validates AW-010; required fields: `span_id`, `kind`, `inputs_ref`, `outputs_ref`, `parent_id`, `policy_snapshot_id`.
- **Expert hook:** "What's missing for DELEGATE closure?"
- **Evidence:** `trace/schema/trace-v0.schema.json` + `trace/scripts/validate_trace.py` exit 0
- **Depends on:** AW-010
- **Completed:** 2026-05-21

### AW-012 — E1 run envelope only (Amelia coarse tier)

- **Done when:** Spec for run boundary record only (model hash, seed, envelope id); instrumented on one local demo run.
- **Expert hook:** "Is sub-1% overhead plausible on orchestration workloads?"
- **Evidence:** Sample E1 record + size/latency note.
- **Depends on:** —

### AW-013 — CHOOSE ledger stub

- **Done when:** One span with `choose_source: policy|tool|model` + `branch_inputs_hash` + `outcome_hash`; validator rejects orphan CHOOSE.
- **Expert hook:** "Is model-sourced CHOOSE always residual?"
- **Evidence:** Fixture + negative test fixture.
- **Depends on:** AW-011

---

## Track C — Freeze & replay (hash-first, no bytecode)

### AW-020 — Canonical serialization spec

- **Done when:** Document picks CBOR deterministic (or equivalent); excludes timestamps from digest; NFC rules for strings.
- **Expert hook:** "Where will cross-language drift bite us?"
- **Evidence:** Spec section + two implementations agree on hash (even if second is script).
- **Depends on:** AW-011

### AW-021 — `freeze_certificate()` on calculator fixture ✅

- **Done when:** Function returns `certificate_hash`; double-freeze stable; double-replay `output_ref` identical.
- **Expert hook:** "Is hash-without-replay insufficient?" (expect yes — document limitation.)
- **Evidence:** `trace/scripts/freeze_certificate.py` + `trace/fixtures/certificate-calculator-v0.json`
- **Depends on:** AW-010, AW-020
- **Completed:** 2026-05-21
- **Caveat:** Canonical JSON (sorted keys) for v0; CBOR spec deferred AW-020. Replay is fixture stub, not VM.

### AW-022 — Replay divergence classifier stub ✅

- **Done when:** Three reason codes for replay fail: `ENV_DRIFT`, `OUTPUT_DRIFT`, `SCHEMA_DRIFT` on injected failures.
- **Expert hook:** "Does this match FR13 taxonomy direction?"
- **Evidence:** `trace/fixtures/replay-divergence-test-log.jsonl` + `run_replay_divergence_demo.py`
- **Depends on:** AW-021
- **Completed:** 2026-05-21

### AW-023 — COMMIT side-effect seal enum

- **Done when:** Enum `ephemeral | audit | external` on COMMIT spans; promotion policy: `external` blocked in dev envelope.
- **Expert hook:** "Is durability tier enumerable for your flagship partner?"
- **Evidence:** Fixture + policy snippet.
- **Depends on:** AW-011

---

## Track D — Falsification (Trace-47 slices)

### AW-030 — Trace-47 prereg schema only ✅

- **Done when:** JSON Schema for prereg; validator; example file committed; no ablation code.
- **Expert hook:** "Are θ, perturbation families pre-registered enough?"
- **Evidence:** `experiments/fixtures/trace-47-prereg.example.json`
- **Depends on:** — (links to experiment protocol)
- **Completed:** 2026-05-21

### AW-031 — Perturbation generator P1 only (paraphrase lottery) ✅

- **Done when:** 10 paraphrases of one prompt; stored; manual run checklist.
- **Evidence:** `experiments/fixtures/p1-paraphrases.json`
- **Completed:** 2026-05-21

### AW-032 — Ablation runner (manual/script, one metric) ✅

- **Done when:** Script masks one span id; records outcome hash delta; CSV out.
- **Evidence:** `experiments/fixtures/T47-ABLATION-sample.csv`, `run_ablation.py`
- **Completed:** 2026-05-21

### AW-033 — RANDOM-SPAN control script ✅

- **Done when:** Compared to ablation in CSV (`flip_rand` vs `flip_ablate`).
- **Evidence:** `T47-ABLATION-random-wins.csv` + `trace-47-perturbations-random-wins.json`
- **Completed:** 2026-05-21 (merged into `run_ablation.py`)

### AW-034 — Trace-47 fixture v0 (refusal-shaped synthetic) ✅

- **Done when:** Synthetic trace with CHOOSE+TRANSFORM; completeness score present.
- **Evidence:** `trace/fixtures/trace-47-v0.json`, `certificate-trace-47-v0.json`
- **Completed:** 2026-05-21

### AW-035 — Promotion block when NSHR < θ (mock gate) ✅

- **Done when:** Gate returns `NECESSITY_GATE_FAILED` (exit 1) on sample CSV.
- **Evidence:** `nshr_promotion_gate.py` — sample exit 1, pass exit 0, random-wins exit 2
- **Completed:** 2026-05-21

### AW-036 — SWAP-CERT detector (Phase B only) ✅

- **Done when:** Passing wrong certificate id → hard fail with reason `CERT_MISMATCH`.
- **Expert hook:** "Is integrity check independent of compile success?"
- **Evidence:** `trace/fixtures/swap-cert-test-log.jsonl`, `verify_certificate_binding.py`, `run_swap_cert_demo.py`
- **Depends on:** AW-021
- **Completed:** 2026-05-21

---

## Track E — Tiny lowering (only after Track C green)

### AW-040 — Opcode table v0 (≤12 ops) ✅

- **Evidence:** `trace/docs/opcode-table-v0.md`
- **Completed:** 2026-05-21

### AW-041 — Lower calculator trace → bytecode blob ✅

- **Evidence:** `bytecode-calculator-v0.json`, `bytecode-trace-47-v0.json`, `lower_and_run.py`
- **Completed:** 2026-05-21

### AW-042 — Round-trip certificate → bytecode → certificate hash ✅

- **Evidence:** `decision-records/adr-bytecode-v0-roundtrip.md`
- **Completed:** 2026-05-21

---

## Track F — Expert-ready packages (compose wins)

### AW-050 — **Expert packet A: "What is a trace node?"** ✅

- **Compose:** AW-001, AW-003, AW-004, AW-010, AW-011
- **Done when:** 20-slide or 8-page pack sendable to PL reviewer without VM/codegen.
- **Evidence:** `docs/expert-packet-a-trace-node-v0.md`
- **Completed:** 2026-05-21

### AW-051 — **Expert packet B: "What is falsifiable promotion?"** ✅

- **Evidence:** `docs/expert-packet-b-falsification-v0.md`
- **Completed:** 2026-05-21

### AW-052 — **Expert packet C: "What ships in v0?"** ✅

- **Evidence:** `docs/expert-packet-c-shipping-v0.md`
- **Completed:** 2026-05-21

---

## Recommended sequence (first 6 weeks mental model)

| Week | Wins | Outcome |
|------|------|---------|
| 1 | AW-001, AW-002, AW-004, AW-010 | Vocabulary + one fixture |
| 2 | AW-011, AW-020, AW-021 | Freeze works on synthetic |
| 3 | AW-012, AW-013, AW-023, AW-022 | Orchestration capture + seals |
| 4 | AW-030, AW-034, AW-031 | Trace-47 prereg + fixture |
| 5 | AW-032, AW-033, AW-035, AW-036 | Necessity gate demonstrated |
| 6 | AW-040, AW-041 (optional) | First lowering only if Week 2 green |

---

## Anti-patterns (do not start these yet)

- Building full mechanistic interpreter before AW-021 passes
- Agent-wide bytecode compiler before AW-041 passes on calculator
- Tier A claims before AW-035 passes on synthetic Trace-47
- Five-primitive capture at token granularity (Amelia attack)
- Micro-op graph in production path before AW-050 reviewed

---

## Conversation starters for experts (copy-paste)

1. **PL reviewer:** "Given AW-011 schema, what operational semantics would you require before calling lowering sound?"
2. **Formal methods:** "Is AW-035 NSHR gate a valid falsifier for necessity, or do we need causal do-calculus?"
3. **Partner security:** "Does AW-023 COMMIT enum cover your audit export classes?"
4. **Skeptic engineer:** "Show me AW-033 where random span beats certified on our own fixture."
