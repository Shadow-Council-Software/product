# Mechanistic Interpreter Testing - Document Index

**v0 release:** `V0-RELEASE.md` (closed 2026-05-21 — Tier B fixture demo)

This index defines canonical entry points and precedence for planning, domain language, and governance references.

## Canonical Entry Points

- Product requirements and domain framing: `prd.md`
- Architecture constraints and glossary baseline: `architecture.md`
- Epic/story planning and acceptance criteria: `epics.md`
- Domain terminology source of truth: `glossary.md`
- Decision and evidence traceability matrix: `evidence-decision-matrix.md`
- Story 1.1 ADR source: `decision-records/story-1-1-adr.md`
- Trace schema & fixtures (v0): `trace/schema/trace-v0.schema.json`, `trace/fixtures/`
- Expert Packet A (trace node): `docs/expert-packet-a-trace-node-v0.md`
- Open decisions (trace): `docs/open-decisions-trace-v0.md`
- Expert feedback log: `docs/expert-feedback/` (use `TEMPLATE.md`)
- Freeze certificate tool: `trace/scripts/freeze_certificate.py`
- Trace-47 adversarial protocol: `experiments/trace-47-catastrophe-protocol.md`
- Trace-47 prereg: `experiments/fixtures/trace-47-prereg.example.json`
- Trace-47 fixture: `trace/fixtures/trace-47-v0.json`
- Trace-47 ablation + gate: `experiments/scripts/run_ablation.py`, `nshr_promotion_gate.py`
- Certificate binding (SWAP-CERT): `trace/scripts/verify_certificate_binding.py`
- Replay divergence codes (FR13 stub): `trace/scripts/classify_replay_divergence.py`
- v0 release manifest & verify commands: `V0-RELEASE.md`
- Bytecode v0 ADR: `decision-records/adr-bytecode-v0-roundtrip.md`
- Expert Packet B/C: `docs/expert-packet-b-falsification-v0.md`, `docs/expert-packet-c-shipping-v0.md`

## Precedence Order (Conflict Resolution)

1. ADRs (active decisions)
2. PRD
3. Epic/Story text
4. Glossary aliases

## Reviewer Start Path

1. Read `index.md`
2. Read `glossary.md`
3. Read `epics.md` (current story in progress)
4. Validate links to `prd.md`, `architecture.md`, and decision/evidence artifacts

## Maintenance Rule

- If any canonical path or precedence changes, update this file in the same change.
