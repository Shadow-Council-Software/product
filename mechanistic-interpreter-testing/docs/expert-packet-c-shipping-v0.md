---
title: Expert Packet C — What Ships in v0 (Week 4 milestone)
status: complete-v0
atomic_wins: AW-012, AW-021, AW-022, AW-036, AW-040–042
---

# Expert Packet C — What Ships in v0

**Audience:** Engineering lead, platform partner, skeptical reviewer.

**Claim (Tier B):** AOIS v0 can freeze orchestration traces, classify replay failures, reject swapped certificates, and lower two fixture classes to stub bytecode with outcome parity.

## Runnable demo script (copy-paste)

```bash
ROOT=mechanistic-interpreter-testing

# Validate + freeze
python3 $ROOT/trace/scripts/validate_trace.py $ROOT/trace/fixtures/trace-calculator-v0.json
python3 $ROOT/trace/scripts/freeze_certificate.py $ROOT/trace/fixtures/trace-calculator-v0.json

# Divergence taxonomy
python3 $ROOT/trace/scripts/run_replay_divergence_demo.py

# SWAP-CERT
python3 $ROOT/experiments/scripts/run_swap_cert_demo.py

# Bytecode
python3 $ROOT/trace/scripts/lower_and_run.py $ROOT/trace/fixtures/trace-calculator-v0.json

# Full promotion path (pass)
python3 $ROOT/experiments/scripts/promotion_integrity_gate.py \
  --trace $ROOT/trace/fixtures/trace-47-v0.json \
  --cert $ROOT/trace/fixtures/certificate-trace-47-v0.json \
  --ablation-csv $ROOT/experiments/fixtures/T47-ABLATION-pass.csv \
  --prereg $ROOT/experiments/fixtures/trace-47-prereg.example.json
```

## Explicitly not shipped

- Production agent capture hooks
- Live LLM inference
- Full mechanistic interpreter FR6 production semantics
- Hardware acceleration paths

## Success signals

| Check | Pass criterion |
|-------|----------------|
| freeze | double-freeze stable hash |
| divergence demo | 3 reason codes |
| swap-cert | 2× CERT_MISMATCH |
| bytecode | VM outcome == trace terminal inline |
| promotion | integrity exit 0 on pass CSV |
