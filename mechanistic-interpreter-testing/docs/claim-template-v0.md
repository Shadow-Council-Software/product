---
title: Assurance Claim Template v0
status: complete-v0
related: AW-002, Mary party-mode tier framing
---

# Assurance Claim Template v0

Use this template for every promotion or export claim. One claim per row in evidence bundles.

## Template

| Field | Content |
|-------|---------|
| **Mechanism M** | Named subsystem behavior (e.g. `freeze_certificate`, `replay_engine`) |
| **Rule R** | Governed rule or invariant (e.g. "double replay yields identical `outputs_ref`") |
| **Evidence E** | Primary artifact ID (e.g. `T47-NSHR`, fixture path, CI run URL) |
| **Assumption A** | Replay envelope bounds (model pin, tool stubs, policy snapshot) |
| **Assurance tier** | `A` mechanistic \| `B` narrative/replay \| `C` forensic only |
| **Falsifier** | What observation would refute the claim |

## Example (Tier B — calculator fixture)

- **M:** Trace v0 validator enforces span tree and digest format.
- **R:** `validate_trace.py` returns exit 0 only for schema-conformant traces.
- **E:** `trace/fixtures/trace-calculator-v0.json` + CI validation log.
- **A:** Fixture is synthetic; no production agent capture implied.
- **Tier:** B
- **Falsifier:** A conformant-looking trace that violates parent/child semantics but passes validation.
