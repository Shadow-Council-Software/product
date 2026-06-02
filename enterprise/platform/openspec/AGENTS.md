# OpenSpec — ENTERPRISE Main Computer

Spec-driven development for the ENTERPRISE product. **Specifications are the source of truth** for implementable behavior; PRD/UX/architecture provide context.

## Quick reference

| Path | Role |
|------|------|
| [`project.md`](./project.md) | Domain vocabulary, stack, conventions |
| [`gates.yaml`](./gates.yaml) | G1–G5, W-CT-* → spec mapping |
| [`specs/`](./specs/) | **Current** system requirements (baseline) |
| [`changes/`](./changes/) | Proposed deltas (proposal → specs → design → tasks) |

## Workflow

```text
/opsx:propose <change>  →  /opsx:apply  →  /opsx:archive
```

Validate before archive:

```bash
cd enterprise && openspec validate --all --strict
```

## ENTERPRISE-specific rules

1. **Domain language** — Use terms from `project.md` (Station, Fabric, OutcomeType, AlertPhase, Clearance). Do not invent synonyms in specs.
2. **Gate tags** — Requirements tied to MVP gates or W-CT contracts MUST prefix the title: `[Gate:G3]`, `[Contract:W-CT-03]`.
3. **TNG outcomes** — Operator-visible behavior MUST map to an `OutcomeType` in `specs/tng-outcomes/spec.md`.
4. **Truth ownership** — Engine holds device/FSM truth; LCARS and experience pack render only. Specs that violate this are invalid.
5. **Sidecar boundary** — LCARS specs MUST NOT require direct Matter sidecar access; only `matter-adapter` and engine specs may.
6. **Scenario format** — `#### Scenario:` with `- **WHEN**` / `- **THEN**` / `- **GIVEN**` (four hashes on Scenario).

## Traceability

When creating or modifying specs, cite where applicable:

- PRD FR/NFR id
- ART id (e.g. ART-01 T1-02)
- Architecture ADR (e.g. ADR-MA-04)

## Related docs

- [`../architecture.md`](../architecture.md) — ADR-MA-01–05, MatterAdapterPort
- [`../tng-interaction-contract.md`](../tng-interaction-contract.md) — copy patterns
- [`../docs/artifacts/`](../docs/artifacts/) — gate artifact bodies
