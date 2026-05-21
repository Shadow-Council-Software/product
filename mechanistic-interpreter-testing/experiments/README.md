# AOIS Experiments

## Trace-47 Catastrophe Protocol (AW-030+)

| Artifact | Path |
|----------|------|
| Protocol | [trace-47-catastrophe-protocol.md](./trace-47-catastrophe-protocol.md) |
| Prereg schema | [schema/trace-47-prereg-v0.schema.json](./schema/trace-47-prereg-v0.schema.json) |
| Example prereg | [fixtures/trace-47-prereg.example.json](./fixtures/trace-47-prereg.example.json) |

```bash
python3 experiments/scripts/validate_prereg.py \
  experiments/fixtures/trace-47-prereg.example.json
```

**Rule:** No ablation run until prereg validates and `registered_at` predates results.

## Trace-47 pipeline (AW-034 / 032 / 035)

```bash
# 1. Validate trace + freeze certificate
python3 trace/scripts/validate_trace.py trace/fixtures/trace-47-v0.json
python3 trace/scripts/freeze_certificate.py trace/fixtures/trace-47-v0.json \
  --write trace/fixtures/certificate-trace-47-v0.json

# 2. Ablation CSV (AW-032/033)
cd experiments/scripts
python3 run_ablation.py --out ../fixtures/T47-ABLATION-sample.csv

# 3. Promotion gate (AW-035) — expect exit 1 on sample (NSHR 0.4 < 0.7)
python3 nshr_promotion_gate.py --csv ../fixtures/T47-ABLATION-sample.csv

# Pass scenario (NSHR 0.8)
python3 run_ablation.py --scenario pass --out ../fixtures/T47-ABLATION-pass.csv
python3 nshr_promotion_gate.py --csv ../fixtures/T47-ABLATION-pass.csv

# FALSE_MECHANISM scenario (random dominates)
python3 run_ablation.py --perturbations ../fixtures/trace-47-perturbations-random-wins.json \
  --out ../fixtures/T47-ABLATION-random-wins.csv
python3 nshr_promotion_gate.py --csv ../fixtures/T47-ABLATION-random-wins.csv
```

| Fixture | Purpose |
|---------|---------|
| `trace/fixtures/trace-47-v0.json` | Synthetic refusal trace (AW-034) |
| `experiments/fixtures/p1-paraphrases.json` | P1 variants (AW-031) |
| `experiments/fixtures/T47-ABLATION-sample.csv` | NSHR fail demo |
| `experiments/fixtures/T47-ABLATION-pass.csv` | NSHR pass demo |

## Certificate binding (AW-036)

```bash
python3 trace/scripts/verify_certificate_binding.py \
  trace/fixtures/trace-47-v0.json \
  trace/fixtures/certificate-trace-47-v0.json

python3 experiments/scripts/run_swap_cert_demo.py
# -> trace/fixtures/swap-cert-test-log.jsonl

# Combined binding + NSHR (binding first)
python3 experiments/scripts/promotion_integrity_gate.py \
  --trace trace/fixtures/trace-47-v0.json \
  --cert trace/fixtures/certificate-trace-47-v0.json \
  --ablation-csv experiments/fixtures/T47-ABLATION-pass.csv \
  --prereg experiments/fixtures/trace-47-prereg.example.json
```
