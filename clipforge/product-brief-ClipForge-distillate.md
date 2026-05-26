---
title: "Product Brief Distillate: ClipForge"
type: llm-distillate
source: product-brief-ClipForge.md
created: "2026-05-26"
purpose: Token-efficient context for PRD and architecture workflows
---

# ClipForge — distillate

## Vision anchors

- Product simulates **human video editor workflow**, not a single genre tool.
- **Content-agnostic + style-agnostic**: datasets, workflows, steering, triggers in config/YAML.
- **POC** proves LangGraph loop + segment scoring + Resolve render path (CLI).
- **North star**: autonomous editor fleets replacing humans; discovery can run continuously.

## Rejected / deferred ideas

- Hardcoding performers, fetish types, or site-specific logic in core agents — use steering/datasets instead.
- SaaS-first or cloud-only processing for POC — local-first is mandatory.
- Replacing Resolve in POC — Resolve is render authority; other NLEs are Vision.
- Skipping job lineage / reproducibility — SQLite jobs planned Growth.

## Requirements hints (from scaffold + conversation)

- LangGraph orchestrator with conditional retry when timeline under target duration.
- Agents: ingest, discovery, download, analysis, sequencing, resolve (+ supervisor).
- Triggers: `manual_local`, `manual_urls`, `discovery`, `hybrid`, `scheduled` (`watch` CLI).
- CV: `segment_scorer` profiles (`intensity_peaks`, `scene_change`); audio peaks via Librosa.
- yt-dlp for remote acquisition when URLs present.
- Steering NL brief field for future LLM tools (stored now, executed Phase 2).
- MoviePy clip extraction required before Resolve can render real cuts (POC gap).
- Discovery web search = Phase 2 LangChain tools; seeds/queries in dataset config for now.

## Technical context

- Python 3.11+, LangGraph, LangChain, OpenCV, PyTorch, MediaPipe (Phase 2), DaVinci Resolve scripting API.
- Paths: `data/raw`, `data/clips`, `data/output`, future `data/jobs.db`.
- Branch: `product/clipforge`; planning artifacts under `clipforge/`.
- Existing code: `main.py run|watch|analyze|test-resolve`; tests pass.

## User scenarios

1. Operator drops files in inbox → `run --trigger manual_local`.
2. Producer passes steering YAML with NL brief → job inherits workflow defaults.
3. Automation owner runs `watch --trigger discovery` for periodic compiles.
4. Hybrid: local corpus + discovery retry until timeline filled.
5. (Vision) Producer says "30-min highlight reel, max energy" only — no YAML.

## Scope signals

| In POC | Growth | Vision |
|--------|--------|--------|
| CLI jobs | Job DB + manifests | Web UI / API |
| Heuristic CV | LLM steering tools | Fine-tuned per-profile models |
| Resolve only | MoviePy extraction | Multi-NLE export |
| Seed URLs | Full discovery agents | Agent marketplace |
| Dry-run graph | 24h watch soak | Cloud GPU workers |

## Open questions

- Minimum human approval gate before publish (always-on vs review queue)?
- Preferred NLEs beyond Resolve for Vision?
- Licensing/watermark policy as first-class steering vs global setting?

## Compliance

- Operator must have rights to all source media; discovery opt-in; respect platform ToS.
