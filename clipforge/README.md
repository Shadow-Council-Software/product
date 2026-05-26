# ClipForge POC — Automated Multi-Agent Video Editing System

**Version:** 1.0  
**Date:** May 26, 2026  
**Prepared by:** Grok (xAI) for Raul  
**Branch:** `product/clipforge`

This README is the complete handover specification for the **Throatpie POC** — a local-first, agentic video editing pipeline. Implementation scaffold lives in this folder; iterate agents and CV modules per the roadmap below.

---

## Executive Summary & Product Vision

We are building **ClipForge** (working name) — a multi-agent orchestration platform for fully automated, high-density video compilations.

**POC success criteria (throatpie focus):**

- Automatically discover and download raw scenes featuring the target performers.
- Use computer vision + audio analysis to detect **dramatic quick throatpies** only (internal cum, visible throat bulge, gagging/swallowing audio peaks, extreme facial reactions — no facials, no external cumshots).
- Cut and sequence only the highest-quality dramatic segments into a **non-stop, back-to-back** compilation.
- Hand off the final timeline to **DaVinci Resolve** via its official Python API for professional-grade rendering.
- Output a single packed MP4 ready for review.

**Full product (post-POC):** Agent marketplace, web UI for prompt-based jobs, agent versioning, cloud scaling, multi-performer support, custom reaction profiles, etc.

---

## POC Scope (Strict Boundaries)

**In scope:**

- Performers: Morgpie, MollyRedWolf, Yuiwoo, SweetyFox (expandable via `config/performers.yaml`).
- Content type: Throatpies only.
- Output: One or more 10–60 minute non-stop compilations with zero gaps (or 0.1–0.3s crossfades).
- Emphasis: Fastest dramatic reactions, highest density of qualifying clips per minute.

**Out of scope for POC:** UI (console/CLI only), monetization, cloud hosting, full error recovery UI.

---

## High-Level System Architecture

```
User Prompt → Orchestrator Agent
                  ↓
          Agent Crew / Graph:
   ┌──────────────┬──────────────┬──────────────┐
   │ Search Agent │ Download Agent │ Analysis Agent│
   └──────────────┴──────────────┴──────────────┘
                  ↓
         Clip Sequencing Agent → Resolve Editing Agent → Render Agent
                  ↓
               Final MP4 + Log
```

**Framework:** LangGraph (stateful graph with conditional retry when clip count is low).

---

## Tech Stack (Local-First)

| Layer | Choice |
|-------|--------|
| Language | Python 3.11+ |
| Agents | LangGraph + LangChain |
| LLM | Grok / OpenAI / Anthropic (configurable) |
| Download | yt-dlp |
| Video | MoviePy + FFmpeg |
| CV | OpenCV + PyTorch + MediaPipe (landmarks Phase 2) |
| Audio | Librosa / PyDub |
| NLE | DaVinci Resolve 19/20+ Python API |
| Metadata | SQLite (`data/jobs.db` — Phase 2) |

---

## Project Structure

```
clipforge/
├── agents/                  # LangGraph nodes
│   ├── search_agent.py
│   ├── download_agent.py
│   ├── analysis_agent.py
│   ├── sequencing_agent.py
│   ├── resolve_agent.py
│   └── orchestrator.py
├── cv/
│   ├── throat_detector.py
│   ├── audio_analyzer.py
│   └── models/
├── resolve_scripts/
│   └── resolve_editor.py
├── config/
│   ├── performers.yaml
│   └── settings.yaml
├── data/
│   ├── raw/
│   ├── clips/
│   └── output/
├── lib/
├── main.py
├── requirements.txt
└── tests/
```

---

## Setup

```bash
cd clipforge
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# From repo root (parent of clipforge/)
pytest clipforge/tests -q
python clipforge/main.py --help
python clipforge/main.py run --dry-run
python clipforge/main.py test-resolve
```

**DaVinci Resolve:** See [resolve_scripts/README.md](./resolve_scripts/README.md).

**Phase 1:** Add `seed_urls` or pass `--url` to `main.py run`; verify download + Resolve import.  
**Phase 2:** Tune `cv/throat_detector.py` (MediaPipe landmarks + fine-tuned head).  
**Phase 3:** Full graph run → one compilation MP4.

---

## Agent Roles

1. **Search Agent** — URLs from config seeds / future LLM search tools.
2. **Download Agent** — yt-dlp wrapper, 1080p+ filter.
3. **Analysis Agent** — CV + audio dramatic scoring.
4. **Sequencing Agent** — Sort, dedupe, pack to target duration.
5. **Resolve Agent** — Timeline + render via Resolve API.
6. **Orchestrator** — LangGraph supervisor, retry loop.

---

## Pipeline Workflow

1. CLI: performer list + target length + `min_dramatic_score`.
2. Search → download to `data/raw/[performer]/`.
3. Analysis → JSON sidecars + qualified entries in `data/clips/qualified/`.
4. Sequencing → master list.
5. Resolve → timeline on V1, back-to-back append, render.
6. Output → `data/output/[performer]_throatpie_compilation_[timestamp].mp4`.

---

## CV / Audio Thresholds (defaults in `config/settings.yaml`)

- `bulge_delta` > 15%
- `expression_score` > 0.85
- `audio_peak` > -12 dB

Starter references: facial expression repos (PyTorch), Py-Feat toolbox.

---

## DaVinci Resolve Integration

Core script: [resolve_scripts/resolve_editor.py](./resolve_scripts/resolve_editor.py)

API references:

- https://gist.github.com/X-Raym/2f2bf453fc481b9cca624d7ca0e19de8
- https://deric.github.io/DaVinciResolve-API-Docs/
- https://extremraym.com/cloud/resolve-scripting-doc/

---

## Legal / Ethical / Safety

- Adult content only; **local processing** assumed.
- Respect performer consent and platform ToS (personal/study use only).
- Do not distribute without proper licensing.
- Watermark/attribution toggle reserved for post-POC.

---

## Future Extensions

- Web UI (Gradio/FastAPI)
- Agent marketplace
- Cloud GPU workers (RunPod / Vast.ai)
- Multi-format output (vertical, 4K)
- Self-improving detection from rendered outputs

---

## Implementation status (this branch)

| Component | Status |
|-----------|--------|
| LangGraph orchestrator | Scaffolded |
| Agents (search → resolve) | Scaffolded |
| CV throat/audio | Heuristic POC (MediaPipe Phase 2) |
| Resolve editor | Script skeleton + `--dry-run` |
| SQLite jobs | Not yet |

Product index: [index.md](./index.md)
