---
title: ADR — Bytecode v0 Round-Trip and Authority
status: accepted-v0
date: 2026-05-21
related: AW-042
---

# ADR: Bytecode v0 Round-Trip and Authority

## Context

AW-041 lowers calculator and trace-47 fixtures to `bytecode-v0` and executes them in a stub VM. AW-021 frozen span certificates remain the assurance anchor.

## Decision

1. **Authority order:** `frozen span certificate` > `trace` > `bytecode` > human-readable attachments.
2. **Bijection holds** when:
   - Trace is calculator-class or trace-47-class fixture in v0 tables.
   - Every span maps 1:1 to one or more opcodes in `opcode-table-v0.md`.
   - VM is the reference implementation for those opcodes only.
3. **Lossy / non-bijective** when:
   - Attachments (NL prompts) are excluded from lowering (by design AW-004).
   - CHOOSE branches not taken are not encoded (only selected path lowered).
   - DELEGATE/COMMIT spans appear (not in v0 lowering table).
   - Production capture hooks are absent (stub semantics).

## Consequences

- Promotion gates MUST NOT use bytecode hash alone; certificate + binding + NSHR still required.
- Extending opcode table requires ADR bump and conformance fixtures per workflow class.
- Winston concern "replaying labels" is mitigated by VM outcome check in `lower_and_run.py`, not by opcode sequence equality alone.

## Evidence

- `trace/scripts/lower_and_run.py` exit 0 on calculator + trace-47
- `trace/fixtures/bytecode-calculator-v0.json`
- `trace/docs/opcode-table-v0.md`
