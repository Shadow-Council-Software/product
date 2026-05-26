# ClipForge — Document Index

**Product:** ClipForge — multi-agent **editor simulation**  
**Branch:** `product/clipforge`  
**BMad status:** Solutioning complete → **Sprint 1 in progress**

---

## Planning artifacts (complete)

| Document | Role | Status |
|----------|------|--------|
| [product-brief-ClipForge.md](./product-brief-ClipForge.md) | Executive brief | ✓ |
| [product-brief-ClipForge-distillate.md](./product-brief-ClipForge-distillate.md) | PRD input distillate | ✓ |
| [prd.md](./prd.md) | FR/NFR contract, gates G1–G6 | ✓ |
| [prd-validation-report.md](./prd-validation-report.md) | BMad validation | Pass with notes |
| [architecture.md](./architecture.md) | Normative technical design (D-01–D-12) | ✓ |
| [epics.md](./epics.md) | P0 epics 1–5, 18 stories | ✓ |
| [implementation-readiness-report.md](./implementation-readiness-report.md) | Phase 3 gate | **READY** |
| [project-context.md](./project-context.md) | AI agent rules | ✓ |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Orientation (non-normative) | ✓ |

## Implementation tracking

| Artifact | Path |
|----------|------|
| Sprint status | [`../_bmad-output/implementation-artifacts/sprint-status.yaml`](../_bmad-output/implementation-artifacts/sprint-status.yaml) |
| Code | `agents/`, `main.py`, `cv/`, `lib/` |

## POC gates

| Gate | Verification |
|------|----------------|
| G1 | `pytest clipforge/tests/test_poc_gates.py::test_g1_*` |
| G2 | `test_g2_analyze_returns_segments` |
| G3 | Local inbox job + sidecars (manual + tests) |
| G4 | `test_g4_steering_overrides_workflow_defaults` |
| G5 | `test_g5_watch_three_cycles_dry_run` |

```bash
pytest clipforge/tests -q
python clipforge/main.py run --dry-run
```

## Configuration

[config/workflows.yaml](./config/workflows.yaml) · [config/datasets.yaml](./config/datasets.yaml) · [config/steering.example.yaml](./config/steering.example.yaml)
