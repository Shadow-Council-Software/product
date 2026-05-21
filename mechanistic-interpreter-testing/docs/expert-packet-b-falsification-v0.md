---
title: Expert Packet B — Falsifiable Promotion (v0)
status: complete-v0
atomic_wins: AW-030 through AW-036 (complete-v0)
---

# Expert Packet B — Falsifiable Promotion (v0)

**Purpose:** Skeptic path for Trace-47 preregistration, ablation, NSHR gate, and certificate binding (v0 complete).

## Artifacts

| Artifact | Path |
|----------|------|
| Protocol | `experiments/trace-47-catastrophe-protocol.md` |
| Prereg example | `experiments/fixtures/trace-47-prereg.example.json` |
| Prereg validator | `experiments/scripts/validate_prereg.py` |
| Divergence log | `trace/fixtures/replay-divergence-test-log.jsonl` |

## Commands

```bash
python3 mechanistic-interpreter-testing/experiments/scripts/validate_prereg.py \
  mechanistic-interpreter-testing/experiments/fixtures/trace-47-prereg.example.json

python3 mechanistic-interpreter-testing/trace/scripts/run_replay_divergence_demo.py
```

## Questions for experts

1. Is **θ = 0.7** with **α = 0.05** credible for a flagship refusal workflow?
2. Are perturbation families **P1–P3** sufficient to avoid Mary's clean-compile catastrophe?
3. Do **SCHEMA_DRIFT / ENV_DRIFT / OUTPUT_DRIFT** cover FR13, or what fourth code is mandatory?
4. Should **RANDOM-SPAN** equal byte-mass or token-mass for your comparator domain?

## End-to-end commands

```bash
cd mechanistic-interpreter-testing/experiments/scripts
python3 run_ablation.py --out ../fixtures/T47-ABLATION-sample.csv
python3 nshr_promotion_gate.py --csv ../fixtures/T47-ABLATION-sample.csv  # expect exit 1
```

## Included (v0)

- `trace/fixtures/trace-47-v0.json` (AW-034)
- `experiments/scripts/run_ablation.py` (AW-032/033)
- `experiments/scripts/nshr_promotion_gate.py` (AW-035)
- `experiments/scripts/run_swap_cert_demo.py` (AW-036)
- `experiments/scripts/promotion_integrity_gate.py` (binding + NSHR)

## Certificate binding (AW-036)

```bash
python3 mechanistic-interpreter-testing/experiments/scripts/run_swap_cert_demo.py
```

Expect two `CERT_MISMATCH` rows (cross-wired calculator ↔ trace-47 certs) and two `CERT_BINDING_OK` rows.

## Not included yet

- Live LLM capture / production traces
- AW-040 opcode lowering
