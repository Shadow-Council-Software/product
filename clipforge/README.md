# ClipForge

**Multi-agent video editor simulation** — content-agnostic, style-agnostic, local-first.

ClipForge orchestrates specialized agents to reproduce a human editor’s workflow: consume datasets (existing video), apply **steering** (creative brief + structured knobs), and produce a finished timeline via DaVinci Resolve. Any source domain and any edit style are configuration only — not hardcoded product logic.

**Branch:** `product/clipforge`

---

## What it is

| Layer | Description |
|-------|-------------|
| **Datasets** | Corpora you own or curate: local folders, manifests, seed URLs |
| **Workflows** | Edit templates: dense compilation, highlight reel, narrative arc |
| **Steering** | Per-job directives (NL brief, duration, scores, transitions, discovery) |
| **Triggers** | Manual CLI, URL list, automated discovery, hybrid, scheduled watch loop |
| **Agents** | LangGraph crew: ingest → discover → download → analyze → sequence → resolve |

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full editor-mapping and graph.

---

## Quick start

```bash
cd clipforge
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Clip extraction: moviepy 1.x (pinned) or ffmpeg on PATH
# Full G6 render: DaVinci Resolve + PYTHONPATH to Scripting/Modules

# From repo root
pytest clipforge/tests -q

# Dry-run job (no media required)
python clipforge/main.py run --dry-run

# Local dataset: drop MP4s in data/raw/inbox/
python clipforge/main.py run \
  --workflow highlight_reel \
  --dataset inbox_local \
  --trigger manual_local \
  --steering clipforge/config/steering.example.yaml

# URL-driven job
python clipforge/main.py run --trigger manual_urls --url 'https://example.com/video.mp4'

# Inspect configured sources (search, URLs, folders, FTP manifest)
python clipforge/main.py discover --dataset demo_stock --steering clipforge/config/steering.example.yaml

# Continuous discovery (operator daemon)
python clipforge/main.py watch --trigger discovery --dry-run
```

---

## Configuration

| File | Purpose |
|------|---------|
| [config/workflows.yaml](./config/workflows.yaml) | Edit styles (compilation, highlights, narrative) |
| [config/datasets.yaml](./config/datasets.yaml) | Source corpora |
| [config/steering.example.yaml](./config/steering.example.yaml) | Copy per job — NL brief + knobs |
| [config/settings.yaml](./config/settings.yaml) | Paths, analysis defaults, Resolve |

---

## Project layout

```
clipforge/
├── agents/           # LangGraph nodes (editor roles)
├── triggers/         # Trigger mode definitions
├── cv/               # segment_scorer, audio_analyzer (pluggable profiles)
├── resolve_scripts/  # DaVinci Resolve API
├── config/
├── data/raw/inbox/   # Operator drop folder
├── docs/
└── main.py           # run | watch | analyze | test-resolve | discover | ui (experimental)
```

---

## Tech stack

Python 3.11+, LangGraph, yt-dlp, OpenCV, Librosa, ffmpeg/MoviePy (clip extraction — implemented), DaVinci Resolve scripting API (19+). Growth: LangChain LLM tools (P2), SQLite jobs (P1). Pinned deps: `requirements.txt` (POC) + `requirements-optional.txt` (non-POC extras).

---

## Legal / operations

- Process only media you have rights to use.
- Respect platform Terms of Service for downloads.
- Discovery automation is opt-in via steering; default POC path is local datasets.

---

## Roadmap

Phase taxonomy follows the PRD (P0–P4, canonical — see [prd.md](./prd.md) Project Scoping):

1. **P0 — POC (current)** — Editor simulation loop: local ingest, segment scoring, sequencing, Resolve dry-run. Clip extraction is already implemented in code (`cv/clip_extractor.py`), ahead of its original P1 scoping.
2. **P1 — Growth** — SQLite job store, manifest datasets, discovery LangChain tools, operator review CLI, 24h watch soak
3. **P2 — Growth** — LLM steering interpretation, additional analysis profiles, batch queue, render presets
4. **P3–P4 — Vision** — Web UI, agent marketplace, cloud workers, multi-NLE, autonomous fleet

Product index: [index.md](./index.md)
