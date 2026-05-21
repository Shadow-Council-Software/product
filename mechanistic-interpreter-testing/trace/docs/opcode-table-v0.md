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
| `0x20` | `LOAD_CONST` | `key`, `value` | Load literal into VM state | Yes |
| `0x30` | `LINK_SPAN` | `span_id` | Provenance edge only (no-op exec) | Yes |
| `0xFE` | `ASSERT_HASH` | `digest` | Fail OUTPUT_DRIFT if state hash mismatch | Yes |
| `0xFF` | `HALT` | — | Stop; return governed outcome | Yes |

**Reserved:** `0x03` DELEGATE, `0x04` COMMIT (v1).

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
