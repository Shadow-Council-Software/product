# ClipForge — Document Index

**Product:** ClipForge (working name) — multi-agent automated video compilation POC  
**POC focus:** Throatpie compilations (local-first pipeline)  
**Branch:** `product/clipforge`

---

## Canonical entry points

| Path | Role |
|------|------|
| [README.md](./README.md) | Full handover spec, setup, roadmap |
| [main.py](./main.py) | CLI entry — LangGraph pipeline |
| [config/performers.yaml](./config/performers.yaml) | Target performers + search keywords |
| [config/settings.yaml](./config/settings.yaml) | Pipeline thresholds, paths, Resolve |
| [agents/](./agents/) | LangGraph agent nodes |
| [cv/](./cv/) | Reaction / audio analysis modules |
| [resolve_scripts/](./resolve_scripts/) | DaVinci Resolve Python API scripts |

---

## Quick start

```bash
cd clipforge
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py --help
python main.py run --dry-run
```

**Phase 1:** `python main.py test-resolve` (Resolve must be running)  
**Phase 2:** `python main.py analyze --input path/to/test.mp4`  
**Phase 3:** `python main.py run --performers morgpie --target-minutes 10`
