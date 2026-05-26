# ClipForge — Document Index

**Product:** ClipForge — multi-agent **editor simulation** (content- and style-agnostic)  
**Branch:** `product/clipforge`  
**BMad phase:** Planning complete (PRD); solutioning next

---

## Canonical entry points

| Document | Role | Status |
|----------|------|--------|
| [product-brief-ClipForge.md](./product-brief-ClipForge.md) | Executive product brief | Complete |
| [product-brief-ClipForge-distillate.md](./product-brief-ClipForge-distillate.md) | LLM distillate for downstream workflows | Complete |
| [prd.md](./prd.md) | **Capability contract** — FR/NFR, gates G1–G5, P0→Vision scope | Complete |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Agent graph + editor mapping (draft — promote to `architecture.md`) | Draft |
| [README.md](./README.md) | Developer quick start | Current |
| [main.py](./main.py) | CLI: `run`, `watch`, `analyze`, `test-resolve` | Scaffold |

---

## Configuration

| Path | Role |
|------|------|
| [config/workflows.yaml](./config/workflows.yaml) | Edit style templates |
| [config/datasets.yaml](./config/datasets.yaml) | Source corpora |
| [config/steering.example.yaml](./config/steering.example.yaml) | Per-job editor steering |
| [config/settings.yaml](./config/settings.yaml) | Paths, analysis defaults, Resolve |

---

## BMad workflow — recommended next steps

| Step | Code | Skill | Output |
|------|------|-------|--------|
| Validate PRD | VP | `bmad-validate-prd` | `prd-validation-report.md` |
| Create Architecture | CA | `bmad-create-architecture` | `architecture.md` (required) |
| Create Epics & Stories | CE | `bmad-create-epics-and-stories` | `epics.md` / stories |
| Implementation Readiness | IR | `bmad-check-implementation-readiness` | readiness report |
| Sprint Planning | SP | `bmad-sprint-planning` | sprint plan |

**Optional:** [CU] Create UX — defer until web UI (Vision); CLI-first POC does not require UX spec.

---

## Quick start

```bash
cd clipforge && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py run --dry-run
```
