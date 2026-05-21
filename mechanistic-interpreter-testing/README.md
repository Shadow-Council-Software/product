# Mechanistic Interpreter Testing (AOIS v0)

**Status:** v0 closed — see [`V0-RELEASE.md`](V0-RELEASE.md) for scope, limits, and CI verify commands.

Evidence-first pipeline: **trace → certificate → gates → (optional) bytecode stub**.

**Time to first demo:** ~30 minutes — follow the golden path below.

## Prerequisites

- Python 3.11+ (stdlib-only scripts)
- Working directory: this folder (`mechanistic-interpreter-testing/`)

## Golden path

### 1. Trace + certificate (10 min)

```bash
python3 trace/scripts/validate_trace.py trace/fixtures/trace-calculator-v0.json
python3 trace/scripts/freeze_certificate.py trace/fixtures/trace-calculator-v0.json
python3 trace/scripts/verify_certificate_binding.py \
  trace/fixtures/trace-calculator-v0.json \
  trace/fixtures/certificate-calculator-v0.json
```

### 2. Replay + integrity (10 min)

```bash
python3 trace/scripts/run_replay_divergence_demo.py
python3 experiments/scripts/run_swap_cert_demo.py
```

### 3. Trace-47 promotion (10 min)

```bash
cd experiments/scripts
python3 run_ablation.py --out ../fixtures/T47-ABLATION-sample.csv
python3 nshr_promotion_gate.py --csv ../fixtures/T47-ABLATION-sample.csv   # expect exit 1
python3 promotion_integrity_gate.py \
  --trace ../../trace/fixtures/trace-47-v0.json \
  --cert ../../trace/fixtures/certificate-trace-47-v0.json \
  --ablation-csv ../fixtures/T47-ABLATION-pass.csv \
  --prereg ../fixtures/trace-47-prereg.example.json
```

### 4. Bytecode stub (optional, 5 min)

```bash
python3 trace/scripts/lower_and_run.py trace/fixtures/trace-calculator-v0.json
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [index.md](index.md) | Canonical index |
| [glossary.md](glossary.md) | Domain terms |
| [docs/expert-packet-a-trace-node-v0.md](docs/expert-packet-a-trace-node-v0.md) | What is a trace node? |
| [docs/expert-packet-b-falsification-v0.md](docs/expert-packet-b-falsification-v0.md) | Falsifiable promotion |
| [docs/expert-packet-c-shipping-v0.md](docs/expert-packet-c-shipping-v0.md) | What ships in v0 |
| [trace/docs/opcode-table-v0.md](trace/docs/opcode-table-v0.md) | Opcode reference |
| [experiments/trace-47-catastrophe-protocol.md](experiments/trace-47-catastrophe-protocol.md) | Adversarial protocol |

## Layout

- `trace/` — schemas, fixtures, validate / freeze / verify / bytecode
- `experiments/` — Trace-47, prereg, ablation, promotion gates
- `decision-records/` — ADRs
