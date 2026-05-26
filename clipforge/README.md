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
└── main.py           # run | watch | analyze | test-resolve
```

---

## Tech stack

Python 3.11+, LangGraph, LangChain (LLM tools Phase 2), yt-dlp, OpenCV, Librosa, MoviePy (extraction Phase 2), DaVinci Resolve scripting API, SQLite jobs (Phase 2).

---

## Legal / operations

- Process only media you have rights to use.
- Respect platform Terms of Service for downloads.
- Discovery automation is opt-in via steering; default POC path is local datasets.

---

## Roadmap

1. **Phase 1** — Local ingest + Resolve dry-run + segment scoring on sample files  
2. **Phase 2** — MoviePy clip extraction, LLM steering tools, manifest/SQLite datasets  
3. **Phase 3** — Discovery tools, agent marketplace profiles, cloud workers  

Product index: [index.md](./index.md)
