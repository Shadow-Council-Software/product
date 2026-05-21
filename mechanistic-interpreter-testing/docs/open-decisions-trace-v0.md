---
title: Open Decisions — Trace & Assurance v0
status: open-v0-shipped
owner: Product + Architecture
related: AW-001, expert-packet-a-trace-node-v0.md
---

# Open Decisions — Trace & Assurance v0

These decisions are **explicitly unset** in Phase 1. v0 fixtures and schema are **shipped frozen** for demo scope; ontology closure requires ADR per OD-* below.

| ID | Decision | Options | Default for v0 fixtures | Expert question |
|----|----------|---------|-------------------------|-----------------|
| OD-001 | Span ontology grain | Five kinds (OBSERVE…) vs micro-op event graph | Five kinds | Which grain is minimal for orchestration agents? |
| OD-002 | Phase metaphor | Lifecycle state per span vs run-level thermodynamic phase | Lifecycle on span only | Is LIQUID/GAS a span state or run mode? |
| OD-003 | Certificate object | Frozen span set vs frozen micro-op subgraph | Span set (deferred) | What exactly is hashed for promotion? |
| OD-004 | Capture mode | Syscall instrumentation vs post-hoc log inference | Fixture-only (neither) | Is post-hoc inference ever Tier-A? |
| OD-005 | LLM inside TRANSFORM | Allowed with pinned completion hash vs must split to CHOOSE | Not in calculator fixture | When does sampling force CHOOSE? |
| OD-006 | Assurance tier gate | NSHR required for PROMOTED vs replay-only Tier B | Tier B for v0 | What experiment promotes Tier A? |
| OD-007 | Lowering target | Bytecode vs equation artifact first | Deferred past AW-021 | When is lowering sound vs label replay? |
| OD-008 | Attachment policy | Witness-only vs selectable carrier promotion | Witness-only (AW-004) | What must enter digest for replay? |

## Resolution protocol

1. Record expert feedback under `docs/expert-feedback/` (optional) with date and OD-* refs.
2. Update this table → move to ADR when resolved.
3. Bump `schema_version` only after ADR (never silently).
