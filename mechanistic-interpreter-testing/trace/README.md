# AOIS Trace v0 (orchestration fixtures)

## Quick commands

```bash
# Validate trace
python3 trace/scripts/validate_trace.py trace/fixtures/trace-calculator-v0.json

# Freeze certificate (AW-021)
python3 trace/scripts/freeze_certificate.py trace/fixtures/trace-calculator-v0.json \
  --write trace/fixtures/certificate-calculator-v0.json

# Negative test (must exit 1)
python3 trace/scripts/validate_trace.py trace/fixtures/trace-calculator-invalid-parent.json

# AW-022: generate classified replay divergence log
python3 trace/scripts/run_replay_divergence_demo.py
# -> trace/fixtures/replay-divergence-test-log.jsonl

# AW-036: SWAP-CERT binding check
python3 trace/scripts/verify_certificate_binding.py trace/fixtures/trace-47-v0.json \
  trace/fixtures/certificate-trace-47-v0.json
python3 ../experiments/scripts/run_swap_cert_demo.py

# AW-040/041: lower + stub VM
python3 trace/scripts/lower_and_run.py trace/fixtures/trace-calculator-v0.json \
  --write trace/fixtures/bytecode-calculator-v0.json
```

## Layout

| Path | Purpose |
|------|---------|
| `schema/trace-v0.schema.json` | Trace document schema |
| `schema/certificate-v0.schema.json` | Frozen certificate schema |
| `fixtures/` | Golden trace + certificate |
| `scripts/validate_trace.py` | Trace validator (stdlib) |
| `scripts/freeze_certificate.py` | Freeze + replay stub |

## Expert review

- Packet: `docs/expert-packet-a-trace-node-v0.md`
- Feedback: `docs/expert-feedback/TEMPLATE.md`
