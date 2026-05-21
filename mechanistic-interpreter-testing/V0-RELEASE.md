---
release: aoist-v0
status: complete
date: 2026-05-21
assurance_ceiling: Tier B
scope: fixture-based orchestration evidence pipeline
---

# AOIS v0 Release — Closed

This release closes the **mechanistic interpreter testing v0** slice. It is a **complete research demo**, not production AOIS. All claims are **Tier B** unless explicitly noted.

## What ships

| Capability | Evidence | Verify |
|------------|----------|--------|
| Trace schema v0 + fixtures | `trace/schema/`, `trace/fixtures/` | `validate_trace.py` |
| Freeze certificate | `freeze_certificate.py` | double-freeze stable |
| Replay divergence taxonomy | `classify_replay_divergence.py`, `replay-divergence-test-log.jsonl` | `run_replay_divergence_demo.py` |
| SWAP-CERT binding | `verify_certificate_binding.py` | `run_swap_cert_demo.py` |
| Trace-47 prereg + ablation + NSHR gate | `experiments/` | `run_ablation.py`, `nshr_promotion_gate.py` |
| Promotion integrity (binding → NSHR) | `promotion_integrity_gate.py` | exit 0 on pass CSV |
| Bytecode stub (calculator + trace-47) | `opcode-table-v0.md`, `lower_and_run.py` | outcome digest match |
| Expert packets A / B / C | `docs/expert-packet-*.md` | README golden path |
| ADR bytecode authority | `decision-records/adr-bytecode-v0-roundtrip.md` | certificate > bytecode |

## What does not ship

- Production agent capture hooks
- Live LLM inference paths
- Full mechanistic interpreter (FR6) production semantics
- Tier A mechanistic claims
- Hardware / chiplet execution paths

## Assurance ceiling (honest)

**Tier B:** Replay, binding, and gate mechanics are demonstrated on **synthetic fixtures** with stub VM and manifest-driven ablation.

**Not Tier A:** No independent replication, no partner-operated claim on production traces.

## Open decisions (still open by design)

See `docs/open-decisions-trace-v0.md` (OD-001 through OD-008). v0 does not resolve ontology or capture-mode wars—it documents them.

## Quick verify (CI-friendly)

```bash
cd mechanistic-interpreter-testing
python3 trace/scripts/validate_trace.py trace/fixtures/trace-calculator-v0.json
python3 trace/scripts/validate_trace.py trace/fixtures/trace-47-v0.json
python3 trace/scripts/run_replay_divergence_demo.py
python3 experiments/scripts/run_swap_cert_demo.py
python3 experiments/scripts/validate_prereg.py experiments/fixtures/trace-47-prereg.example.json
python3 trace/scripts/lower_and_run.py trace/fixtures/trace-calculator-v0.json
python3 experiments/scripts/run_ablation.py --out /tmp/t47.csv
python3 experiments/scripts/nshr_promotion_gate.py --csv /tmp/t47.csv; test $? -eq 1
```

## Brainstorming lineage

Session: `_bmad-output/brainstorming/brainstorming-session-2026-05-21-bytecode-vm.md`  
Atomic wins backlog: `_bmad-output/brainstorming/atomic-wins-backlog.md` (all Track A–F v0 items complete)

## Next phase (v0.5 — not started)

1. Promotion Integrity Pack (prereg hash + gate logs bundle)
2. Production capture middleware
3. One design-partner claim end-to-end
4. Tamper integration test (Amelia party-mode recommendation)
