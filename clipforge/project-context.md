# ClipForge — Project Context (AI agents)

## Product

Multi-agent **editor simulation** — content/style agnostic. Configuration: datasets, workflows, steering, triggers.

## Normative docs (read order)

1. `prd.md` — FR/NFR contract, gates G1–G6
2. `architecture.md` — D-01–D-12 decisions
3. `epics.md` — P0 stories
4. `docs/ARCHITECTURE.md` — orientation only

## Code map

| Area | Path |
|------|------|
| CLI | `main.py` |
| Graph | `agents/orchestrator.py` |
| State | `lib/state.py`, `lib/steering.py`, `lib/config.py` |
| CV | `cv/segment_scorer.py`, `cv/audio_analyzer.py`, `cv/clip_extractor.py` |
| Config | `config/*.yaml` |
| Tests | `tests/` |
| Sprint | `_bmad-output/implementation-artifacts/sprint-status.yaml` |

## Rules

- No genre-specific logic in `agents/` — use config only (**CF-FR-39**).
- Dry-run must not call Resolve render or yt-dlp network (**CF-FR-04**).
- Errors append `agent_name: message` to `state['errors']` (**CF-NFR-O1**).
- Job reports → `data/jobs/<job_id>/report.json`.

## POC gates today

G1 dry-run, G2 analyze, G3 local+sidecars, G4 steering, G5 watch×3 — see `tests/test_poc_gates.py`.
