---
title: AOIS Opcode Table v0
status: complete-v0
bytecode_version: bytecode-v0
max_opcodes: 12
related: AW-040
---

# Opcode Table v0 (≤12 ops)

Machine-facing instruction set for orchestration-scale lowering (calculator + refusal fixtures).

| Code | Name | Args | Semantics | Testable alone |
|------|------|------|-----------|----------------|
| `0x01` | `OBSERVE` | `span_id` | Bind ingress observation; sets `parsed=true` flag | Yes |
| `0x02` | `CHOOSE` | `span_id`, `source` | Record branch selection (policy/tool/model) | Yes |
| `0x10` | `PARSE_JSON` | `span_id` | `amount_cents`, `currency` from ingress | Yes |
| `0x11` | `COMPUTE_TAX` | `span_id`, `rate_imm` | `tax_cents`, `total_cents` | Yes |
| `0x12` | `FORMAT_RESP` | `span_id` | `display` string from totals | Yes |
| `0x13` | `POLICY_EVAL` | `span_id` | `safe_to_proceed`, `policy_rule` | Yes |
| `0x14` | `EMIT_OUTCOME` | `span_id` | `reason_code`, `message` | Yes |
| `0xFF` | `HALT` | — | Stop; return governed outcome | Yes |

## Reserved (v1, not implemented)

These opcodes are specified for v1 but **not implemented** in `bytecode_vm.py`; the stub VM raises `unknown op` if they appear in a program. Note the honest caveat: v0 lowering never *emits* these opcodes — unmapped TRANSFORM ops fail loudly at lowering time, but non-TRANSFORM span kinds (`CHOOSE` in the calculator path, `COMMIT`, `DELEGATE`) are silently dropped by design and never reach the VM. "Fail loud" applies to TRANSFORM ops only.

| Code | Name | Args | Intended semantics |
|------|------|------|--------------------|
| `0x03` | `DELEGATE` | — | Delegation span lowering |
| `0x04` | `COMMIT` | — | Commit span lowering |
| `0x20` | `LOAD_CONST` | `key`, `value` | Load literal into VM state |
| `0x30` | `LINK_SPAN` | `span_id` | Provenance edge only (no-op exec) |
| `0xFE` | `ASSERT_HASH` | `digest` | Fail OUTPUT_DRIFT if state hash mismatch |

## Calculator span → opcode mapping

| span_id | kind | Opcode(s) |
|---------|------|-----------|
| span-root | OBSERVE | `OBSERVE` |
| span-parse | TRANSFORM | `PARSE_JSON` |
| span-tax | TRANSFORM | `COMPUTE_TAX` (rate_imm=0.08) |
| span-format | TRANSFORM | `FORMAT_RESP` → `HALT` |

## Trace-47 span → opcode mapping

| span_id | kind | Opcode(s) |
|---------|------|-----------|
| span-intake | OBSERVE | `OBSERVE` |
| span-policy-check | TRANSFORM | `POLICY_EVAL` |
| span-refusal-choose | CHOOSE | `CHOOSE` |
| span-refusal-emit | TRANSFORM | `EMIT_OUTCOME` → `HALT` |
