# ClipForge — Document Index

**Product:** ClipForge — multi-agent **editor simulation** (content- and style-agnostic)  
**Branch:** `product/clipforge`

---

## Canonical entry points

| Document | Role |
|----------|------|
| [README.md](./README.md) | Overview, quick start, config map |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Editor mapping, triggers, LangGraph flow |
| [main.py](./main.py) | CLI: `run`, `watch`, `analyze`, `test-resolve` |
| [config/workflows.yaml](./config/workflows.yaml) | Edit style templates |
| [config/datasets.yaml](./config/datasets.yaml) | Source corpora |
| [config/steering.example.yaml](./config/steering.example.yaml) | Per-job editor steering |
| [agents/](./agents/) | Agent crew |
| [triggers/](./triggers/) | Trigger modes |

---

## Example jobs

```bash
# Human-triggered: local inbox
python main.py run --dataset inbox_local --trigger manual_local

# Steering file (NL brief + discovery flags)
python main.py run --steering config/steering.example.yaml

# Automated loop (discovery trigger)
python main.py watch --steering config/steering.example.yaml --dry-run
```
