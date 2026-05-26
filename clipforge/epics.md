---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - './prd.md'
  - './docs/ARCHITECTURE.md'
workflowType: epics-and-stories
productName: ClipForge
releaseScope: P0-POC
date: '2026-05-26'
---

# ClipForge — Epic Breakdown (P0 POC)

## Overview

This document decomposes the **P0 Editor Simulation Loop** from the ClipForge PRD into five epics and eighteen implementable stories. Scope excludes Vision (P3–P4) and Growth-only capabilities except where noted for **G6** documentation. Stories are sequenced for single-session dev completion with no forward dependencies within an epic.

**Brownfield scaffold:** `clipforge/main.py`, `clipforge/agents/`, `clipforge/config/`, `clipforge/lib/`, `clipforge/cv/`, `clipforge/resolve_scripts/`.

## Requirements Inventory

### Functional Requirements (POC-relevant)

| ID | Summary |
|----|---------|
| CF-FR-01 | Job definition: workflow, dataset(s), trigger, optional steering |
| CF-FR-02 | Stateful orchestration graph with agent stages |
| CF-FR-03 | Job report: errors, segment counts, output path |
| CF-FR-04 | Dry-run mode without destructive side effects |
| CF-FR-05 | Unique job id per run |
| CF-FR-06 | Supervisor observability messages in job state |
| CF-FR-07 | Load workflow definitions (style, profile, pacing) |
| CF-FR-08 | Multiple workflow types (compilation, highlights, narrative) |
| CF-FR-09 | Merge workflow defaults with steering; steering wins |
| CF-FR-10 | Load datasets (paths, seed URLs, discovery queries) |
| CF-FR-11 | Multiple datasets per job |
| CF-FR-12 | Expand path globs to concrete media lists |
| CF-FR-13 | Local ingest without network when `manual_local` |
| CF-FR-14 | Steering directives (NL brief, duration, scores, pacing, etc.) |
| CF-FR-15 | Steering changes analysis/sequencing without code edits |
| CF-FR-16 | Discovery settings in steering (enabled, queries, poll, retries) |
| CF-FR-17 | Trigger `manual_urls` with explicit URL lists |
| CF-FR-18 | Trigger `discovery` for candidate URLs |
| CF-FR-19 | Trigger `hybrid` with discovery retry when under target |
| CF-FR-20 | Download remote media via configurable tool |
| CF-FR-21 | Filter downloads by minimum resolution |
| CF-FR-22 | Retry discovery when sequenced duration below target |
| CF-FR-23 | Continuous `watch` loop on configured interval |
| CF-FR-24 | Analyze media → segment candidates with scores and ranges |
| CF-FR-25 | Pluggable analysis profiles per workflow |
| CF-FR-26 | Audio emphasis combined with visual scores per weights |
| CF-FR-27 | Persist segment metadata as JSON sidecars |
| CF-FR-28 | Filter segments below `min_segment_score` |
| CF-FR-29 | Extract clips to disk (Growth — POC documents gap) |
| CF-FR-30 | Build timeline plan up to target duration |
| CF-FR-31 | Deduplicate overlapping segments (compilation/highlights) |
| CF-FR-32 | Narrative ordering when workflow style is narrative |
| CF-FR-33 | Transition intent per segment from steering/workflow |
| CF-FR-34 | Create NLE project/timeline; append planned clips |
| CF-FR-35 | Professional render settings from configuration |
| CF-FR-36 | Write outputs under configured path with job-identifying names |
| CF-FR-37 | Actionable errors when NLE scripting unavailable |
| CF-FR-38 | Operator rights acknowledgment; discovery off by default in examples |
| CF-FR-39 | No hardcoded genre/niche logic in core agents |
| CF-FR-40 | Halt with explicit error when zero media after ingest/discovery |
| CF-FR-41 | Log acquisition URLs and local paths (POC: job report/stderr) |

### Non-Functional Requirements (POC-relevant)

| ID | Summary |
|----|---------|
| CF-NFR-P1 | Analyze 1080p sample ≥2 FPS effective sampling (M-series or equivalent) |
| CF-NFR-R1 | Graph completes dry-run without unhandled exceptions (G1) |
| CF-NFR-R2 | `watch` completes 3 consecutive cycles without crash (G5) |
| CF-NFR-S1 | Secrets via env/local config only |
| CF-NFR-S2 | No inbound network services for POC |
| CF-NFR-S3 | Discovery disabled by default in example steering |
| CF-NFR-O1 | Stderr errors list agent stage and cause |
| CF-NFR-M1 | New workflow = YAML row only |
| CF-NFR-M2 | New analysis profile = CV plug-in implementing scorer contract |
| CF-NFR-I1 | Resolve scripting API 19+ documented in `resolve_scripts/README.md` |
| CF-NFR-U1 | CLI `--help` documents triggers and required flags |

### POC Acceptance Gates

| Gate | Requirement |
|------|-------------|
| **G1** | `clipforge run --dry-run` completes; report + state emitted |
| **G2** | `clipforge analyze --input <sample.mp4>` returns scored segments |
| **G3** | Local job with inbox media → `timeline_plan` + segment sidecars |
| **G4** | Steering YAML overrides workflow defaults on same dataset |
| **G5** | `clipforge watch --dry-run` runs ≥3 cycles without crash |
| **G6** | Growth: documented path for real render with `clip_path` → Resolve MP4 |

### Additional Requirements

- LangGraph `StateGraph` pipeline per `docs/ARCHITECTURE.md`
- CLI-only MVP surface; no web UI
- Heuristic CV profiles for POC; discovery stub (seeds + queries)
- Clip file extraction deferred (Phase 1); Resolve dry-run acceptable for POC exit

### UX Design Requirements

None for P0 (CLI only).

### FR Coverage Map

| FR IDs | Epic |
|--------|------|
| CF-FR-01–06 | Epic 1 |
| CF-FR-07–16, CF-FR-09 | Epic 2 |
| CF-FR-13, CF-FR-17–23, CF-FR-40–41 | Epic 3 |
| CF-FR-24–33, CF-FR-27–28 | Epic 4 |
| CF-FR-34–37, CF-FR-29 (doc), CF-FR-38–39 | Epic 5 |
| CF-FR-14–15 | Epic 2, 4 (steering-driven behavior) |

## Epic List

| Epic | Title | Stories | Primary gates |
|------|-------|---------|---------------|
| 1 | Orchestration & CLI | 1.1–1.4 | G1 |
| 2 | Configuration plane | 2.1–2.3 | G4 |
| 3 | Media acquisition | 3.1–3.4 | G3, G5 |
| 4 | Analysis & timeline | 4.1–4.4 | G2, G3 |
| 5 | Render & POC exit | 5.1–5.3 | G1–G6 |

---

## Epic 1: Orchestration & CLI

**Goal:** Deliver a trustworthy CLI and LangGraph job runner so operators can define, dry-run, and trace editor-simulation jobs end-to-end.

**Epic acceptance criteria**

- **Given** installed ClipForge with valid config, **when** `clipforge run --dry-run` is invoked with workflow, dataset, and trigger, **then** the graph completes without unhandled exceptions and emits job state + report (**G1**, **CF-NFR-R1**).
- **Given** any agent failure, **when** the job ends, **then** stderr and job report identify the failing stage and cause (**CF-NFR-O1**, **CF-FR-03**).
- **Given** `clipforge --help`, **when** an operator inspects commands, **then** all POC triggers and required flags are documented (**CF-NFR-U1**).

### Story 1.1: Job Definition CLI

As an **operator / producer**,
I want to start a job from the CLI with workflow id, dataset id(s), trigger mode, and optional steering file,
So that I can run the editor-simulation loop without editing code.

**Acceptance criteria**

- **Given** valid `workflows.yaml` and `datasets.yaml`, **when** I run `clipforge run --workflow <id> --dataset <id> --trigger manual_local`, **then** a job definition is accepted and passed to the orchestrator (**CF-FR-01**).
- **Given** an optional `--steering <path>`, **when** the job starts, **then** the steering file path is loaded into job state (**CF-FR-01**).
- **Given** `clipforge --help`, **when** I view subcommands, **then** `run`, `analyze`, `watch`, and trigger flags are documented (**CF-NFR-U1**).
- **Given** invalid workflow or dataset id, **when** I run the command, **then** the CLI exits with a clear error before graph execution (**CF-FR-42** precursor).

**Technical notes**

- Extend `clipforge/main.py` Click/Typer entrypoints; validate ids via `lib/config.py`.
- Job payload shape should match `lib/state.py` / orchestrator expectations.
- Align with brownfield `main.py` scaffold; add integration test invoking CLI with `--help`.

---

### Story 1.2: LangGraph Orchestrator Graph

As a **platform builder**,
I want jobs executed through a stateful LangGraph with defined agent stages,
So that the pipeline mirrors human editor roles and supports retries.

**Acceptance criteria**

- **Given** a accepted job definition, **when** `clipforge run` executes (non-dry-run allowed for unit tests), **then** supervisor routes to ingest, discovery, download, analysis, sequence, and resolve nodes per trigger (**CF-FR-02**).
- **Given** trigger `manual_local`, **when** the graph runs, **then** routing skips discovery/download unless hybrid is configured (**CF-FR-02**, **docs/ARCHITECTURE.md** graph).
- **Given** trigger `manual_urls` or `discovery`, **when** the graph runs, **then** discovery → download precedes analysis when URLs are present (**CF-FR-02**).
- **Given** hybrid steering and under-target timeline, **when** sequencing completes, **then** the graph can loop to `discover_again` per architecture (**CF-FR-19** wiring point for Epic 3).

**Technical notes**

- Implement or harden `agents/orchestrator.py` `StateGraph`; reuse agent modules under `agents/`.
- Mirror mermaid flow in `docs/ARCHITECTURE.md`; add `tests/test_graph.py` coverage for routing edges.
- Keep genre-agnostic routing in orchestrator only (**CF-FR-39**).

---

### Story 1.3: Job Report and Dry-Run

As an **operator / producer**,
I want dry-run mode and a job report on completion,
So that I can validate pipelines safely and audit outcomes.

**Acceptance criteria**

- **Given** `--dry-run`, **when** `clipforge run` completes, **then** no destructive render or destructive download side effects occur (**CF-FR-04**, **G1**).
- **Given** a completed job (dry-run or live), **when** the graph finishes, **then** a job report includes errors (if any), segment counts, and output path when applicable (**CF-FR-03**, **G1**).
- **Given** dry-run success, **when** I inspect emitted state artifacts, **then** `timeline_plan` and agent messages are present for downstream gates (**G1**, **G3** prep).

**Technical notes**

- Persist report JSON under configured output dir (e.g. `data/jobs/<job_id>/report.json`).
- Resolve agent should respect dry-run (skip render API calls) — coordinate with Epic 5.
- Gate **G1** is the primary verification story for this epic slice.

---

### Story 1.4: Job ID and Supervisor Observability

As an **automation owner**,
I want a unique job id and supervisor messages in state,
So that I can trace runs and debug multi-cycle watch jobs.

**Acceptance criteria**

- **Given** any `clipforge run`, **when** the job starts, **then** a unique `job_id` is assigned and included in state and output paths (**CF-FR-05**).
- **Given** supervisor execution, **when** each routing decision occurs, **then** observability messages are appended to job state (**CF-FR-06**).
- **Given** an agent raises an error, **when** the job fails, **then** stderr includes agent stage name and exception cause (**CF-NFR-O1**).

**Technical notes**

- Use UUID or timestamp-based id in `lib/state.py`; prefix output filenames with `job_id` (**CF-FR-36** linkage).
- Supervisor messages: lightweight string list or structured dict in state (Growth-ready for CF-NFR-O2).
- Log acquisition paths in report when download/ingest ran (**CF-FR-41**).

---

## Epic 2: Configuration plane

**Goal:** Make workflows, datasets, and steering the product — behavior changes without core code edits.

**Epic acceptance criteria**

- **Given** two workflow rows in `workflows.yaml`, **when** jobs run with different workflow ids, **then** analysis profile and sequencing style differ without code changes (**CF-FR-07**, **CF-FR-08**, **CF-NFR-M1**).
- **Given** the same dataset and media, **when** steering YAML changes `min_segment_score` or pacing, **then** timeline plan output differs (**CF-FR-15**, **G4**).
- **Given** `steering.example.yaml`, **when** a new operator copies it, **then** `discovery.enabled` defaults to false (**CF-NFR-S3**, **CF-FR-38**).

### Story 2.1: Workflow Definitions Loader

As a **platform builder**,
I want workflow definitions declaring edit style, analysis profile, and default pacing,
So that new edit styles are configuration-only.

**Acceptance criteria**

- **Given** `config/workflows.yaml`, **when** a job references a workflow id, **then** edit style, analysis profile id, and default pacing/transitions load into merged config (**CF-FR-07**).
- **Given** at least three workflow types (dense compilation, highlight reel, narrative arc), **when** each is selected, **then** sequencing agent receives the correct `edit_style` (**CF-FR-08**).
- **Given** a new workflow row added to YAML only, **when** tests run, **then** no core agent code changes are required (**CF-NFR-M1**, **CF-FR-39**).

**Technical notes**

- Loader in `lib/config.py`; schema validate required keys.
- Wire `analysis_profile` id to `cv/segment_scorer.py` profile registry (**CF-NFR-M2**).
- Unit tests in `tests/test_config.py`.

---

### Story 2.2: Dataset Path Expansion

As an **operator / producer**,
I want datasets with path globs and optional seed URLs,
So that corpora are declared once and expanded at ingest.

**Acceptance criteria**

- **Given** `config/datasets.yaml` with glob paths, **when** ingest runs, **then** concrete media file lists are produced (**CF-FR-10**, **CF-FR-12**).
- **Given** a job referencing multiple dataset ids, **when** ingest runs, **then** media from all datasets is combined per job rules (**CF-FR-11**).
- **Given** empty glob match, **when** ingest completes, **then** downstream stages receive zero media and fail with explicit error (**CF-FR-40**).

**Technical notes**

- Support `data/raw/inbox/**` style paths from PRD Journey 0.
- Optional seed URLs stored on dataset for discovery epic; no network in this story.
- Ingest agent (`agents/ingest_agent.py`) consumes expanded list only.

---

### Story 2.3: Steering Merge Overrides

As an **operator / producer**,
I want per-job steering to override workflow defaults,
So that creative briefs and thresholds change behavior without redeploying code.

**Acceptance criteria**

- **Given** workflow defaults and a steering file, **when** a job runs, **then** merged config applies steering values over workflow defaults (**CF-FR-09**, **G4**).
- **Given** steering with `target_minutes`, `min_segment_score`, segment bounds, pacing, transitions, and ranking weights, **when** analysis and sequencing run, **then** thresholds and plan behavior reflect steering (**CF-FR-14**, **CF-FR-15**).
- **Given** steering `discovery` block (enabled, queries, poll interval, max retries), **when** loaded, **then** discovery agent and watch loop read these values (**CF-FR-16**).
- **Given** same dataset and inbox files, **when** only steering YAML changes, **then** `timeline_plan` differs between runs (**G4**).

**Technical notes**

- Implement merge in `lib/steering.py`; hash steering for future audit (**CF-FR-41**).
- `config/steering.example.yaml` must keep discovery disabled by default (**CF-NFR-S3**).
- NL `directives.natural_language` stored but not executed in POC (Phase 2).

---

## Epic 3: Media acquisition

**Goal:** Acquire source media from local inbox, explicit URLs, discovery stub, and hybrid retry — with safe defaults and watch automation.

**Epic acceptance criteria**

- **Given** trigger `manual_local` and inbox files, **when** a job runs, **then** analysis receives local paths without WAN (**CF-FR-13**, **G3**).
- **Given** explicit URLs and configured downloader, **when** `manual_urls` runs, **then** files land under dataset raw paths respecting min resolution (**CF-FR-17**, **CF-FR-20**, **CF-FR-21**).
- **Given** `clipforge watch --dry-run`, **when** three cycles execute, **then** process exits without crash (**G5**, **CF-NFR-R2**).

### Story 3.1: Local Ingest Trigger

As an **operator / producer**,
I want to drop rushes in the dataset inbox and run `manual_local`,
So that the POC loop works without network acquisition.

**Acceptance criteria**

- **Given** trigger `manual_local`, **when** ingest agent runs, **then** only local glob-expanded files are registered; no download or discovery calls (**CF-FR-13**).
- **Given** files in `data/raw/inbox/`, **when** `clipforge run --trigger manual_local`, **then** `media_files` in state lists absolute paths for analysis (**G3**).
- **Given** zero files after ingest, **when** the pipeline continues, **then** job halts with actionable error before resolve (**CF-FR-40**).

**Technical notes**

- `agents/ingest_agent.py`; integrate with Epic 2 dataset expansion.
- Document inbox layout in `README.md` (Journey 0).

---

### Story 3.2: URL Download Acquisition

As an **operator / producer**,
I want to supply explicit URLs for a job,
So that remote rushes enter the same analysis path as local media.

**Acceptance criteria**

- **Given** trigger `manual_urls` and URLs in CLI or steering, **when** download agent runs, **then** media is fetched via configured tool (e.g. yt-dlp) into dataset raw directory (**CF-FR-17**, **CF-FR-20**).
- **Given** `min_resolution` in steering or settings, **when** download completes, **then** files below threshold are rejected or skipped with logged reason (**CF-FR-21**).
- **Given** download failure, **when** the job ends, **then** report and stderr list URL and failure cause (**CF-FR-41**, **CF-NFR-O1**).

**Technical notes**

- `agents/download_agent.py`; pin yt-dlp in `requirements.txt` when enabled (**CF-NFR-I2** Growth note).
- Secrets from env only (**CF-NFR-S1**); no credentials in repo.

---

### Story 3.3: Discovery Stub and Hybrid Retry

As an **automation owner**,
I want discovery and hybrid triggers with retry when the timeline is short,
So that the graph can simulate finding new sources (stub) and refilling duration.

**Acceptance criteria**

- **Given** trigger `discovery` and `discovery.enabled: true`, **when** discovery agent runs, **then** candidate URLs are produced from seed URLs and configured queries (stub; no full LLM web search) (**CF-FR-18**).
- **Given** trigger `hybrid`, **when** local ingest completes, **then** discovery may run and loop when sequenced duration is below steering target (**CF-FR-19**).
- **Given** under-target timeline and retries remaining in steering, **when** sequencing finishes, **then** orchestrator routes to discover_again and re-enters discovery/download (**CF-FR-22**).
- **Given** `discovery.enabled: false`, **when** operator runs discovery trigger, **then** job respects off switch (**CF-FR-38**).

**Technical notes**

- `agents/discovery_agent.py` stub: dataset seed URLs + query strings; LangChain tools deferred (**CF-FR-45** Growth).
- Hybrid edge per architecture mermaid; test with mocked short timeline.

---

### Story 3.4: Continuous Watch Loop

As an **automation owner**,
I want `clipforge watch` to invoke jobs on an interval,
So that discovery-mode automation runs without manual restart.

**Acceptance criteria**

- **Given** `clipforge watch` with configured interval (steering or settings), **when** the process runs, **then** jobs are invoked repeatedly with trigger `discovery` or `scheduled` semantics (**CF-FR-23**).
- **Given** `clipforge watch --dry-run`, **when** three consecutive cycles complete, **then** no crash and state/report emitted each cycle (**G5**, **CF-NFR-R2**).
- **Given** a cycle failure, **when** watch continues (configurable), **then** error is logged with cycle index and job id (**CF-NFR-O1**).

**Technical notes**

- CLI subcommand in `main.py`; use steering poll interval (**CF-FR-16**).
- Prefer dry-run for CI gate **G5**; document production watch in README.

---

## Epic 4: Analysis & timeline

**Goal:** Score segments with pluggable profiles, persist sidecars, and build a steering-aware timeline plan up to target duration.

**Epic acceptance criteria**

- **Given** a sample MP4, **when** `clipforge analyze --input <file>` runs, **then** scored segments with time ranges are returned (**G2**, **CF-FR-24**).
- **Given** inbox media and steering, **when** a full local job runs, **then** JSON sidecars and `timeline_plan` are emitted (**G3**, **CF-FR-27**, **CF-FR-30**).
- **Given** 1080p sample on M-series or equivalent, **when** analyze runs, **then** effective sampling meets **CF-NFR-P1** (≥2 FPS).

### Story 4.1: Segment Analysis CLI

As an **operator / producer**,
I want a standalone analyze command with pluggable profiles,
So that I can validate CV scoring before full jobs.

**Acceptance criteria**

- **Given** `clipforge analyze --input <sample.mp4>`, **when** the command completes, **then** stdout or JSON lists segment candidates with scores and time ranges (**CF-FR-24**, **G2**).
- **Given** workflow-selected profile (e.g. intensity peaks, scene change), **when** analysis runs, **then** the correct scorer module is invoked (**CF-FR-25**, **CF-NFR-M2**).
- **Given** 1080p test clip, **when** benchmarks run, **then** effective sampling rate meets **CF-NFR-P1**.

**Technical notes**

- `cv/segment_scorer.py` profile registry; `agents/analysis_agent.py` shares core logic.
- Add sample fixture under `tests/` or document path to operator-provided clip.

---

### Story 4.2: Audio-Visual Scoring Filter

As an **operator / producer**,
I want audio emphasis combined with visual scores and min-score filtering,
So that segment selection matches steering weights and quality bar.

**Acceptance criteria**

- **Given** steering ranking weights, **when** analysis scores segments, **then** audio and visual signals are combined per weights (**CF-FR-26**).
- **Given** `min_segment_score` in steering, **when** timeline plan is built, **then** segments below threshold are excluded (**CF-FR-28**).
- **Given** workflow profile change only, **when** the same media is analyzed, **then** segment rankings differ (**CF-FR-15**, **CF-FR-25**).

**Technical notes**

- `cv/audio_analyzer.py` integration; keep scoring domain-neutral (**CF-FR-39**).
- Filtering may occur in analysis agent or sequencing pre-pass — document chosen boundary.

---

### Story 4.3: Segment Sidecar Artifacts

As an **operator / producer**,
I want qualified segment metadata persisted as JSON sidecars,
So that I can audit selections and debug plans.

**Acceptance criteria**

- **Given** analyzed media files, **when** analysis completes, **then** per-source JSON sidecars are written adjacent to job output (**CF-FR-27**, **G3**).
- **Given** sidecars exist, **when** I inspect them, **then** each entry includes score, start/end time, and source path.
- **Given** a failed analysis for one file, **when** the job continues or fails, **then** report lists per-file status (**CF-FR-03**).

**Technical notes**

- Path pattern e.g. `data/jobs/<job_id>/segments/<basename>.json`.
- Sidecars feed sequencing agent input; no SQLite in POC.

---

### Story 4.4: Timeline Sequencing Plan

As an **operator / producer**,
I want a timeline plan ordered to target duration with dedup and transitions,
So that resolve handoff receives an editor-style rough cut.

**Acceptance criteria**

- **Given** qualified segments and steering `target_minutes`, **when** sequencing runs, **then** `timeline_plan` orders clips up to target duration (**CF-FR-30**, **G3**).
- **Given** compilation or highlight `edit_style`, **when** overlapping segments exist, **then** duplicates from same source are deduplicated (**CF-FR-31**).
- **Given** narrative `edit_style`, **when** sequencing runs, **then** segment order respects narrative ordering rules (**CF-FR-32**).
- **Given** workflow/steering transition settings, **when** plan items are emitted, **then** each item includes transition intent (cut, crossfade, dissolve) (**CF-FR-33**).

**Technical notes**

- `agents/sequencing_agent.py`; output schema consumed by `resolve_agent`.
- `clip_path` may be null in POC — Epic 5 documents **CF-FR-29** / **G6** gap.

---

## Epic 5: Render & POC exit

**Goal:** Hand off timeline plans to DaVinci Resolve (dry-run and documented live path) and verify POC gates G1–G5 with G6 documentation.

**Epic acceptance criteria**

- **Given** a `timeline_plan` and Resolve scripting available, **when** resolve agent runs (non-dry-run), **then** project/timeline is created and clips appended in order (**CF-FR-34**).
- **Given** Resolve scripting unavailable, **when** resolve runs, **then** actionable setup guidance is returned (**CF-FR-37**, **CF-NFR-I1**).
- **Given** POC exit checklist, **when** gates G1–G5 are executed, **then** results are recorded and G6 render path is documented for Growth (**G1–G6**).

### Story 5.1: Resolve Timeline Handoff

As an **operator / producer**,
I want the resolve agent to build a DaVinci timeline from the plan,
So that professional finishing stays in the NLE.

**Acceptance criteria**

- **Given** a valid `timeline_plan`, **when** resolve agent executes, **then** a Resolve project/timeline is created and planned clips are appended sequentially (**CF-FR-34**).
- **Given** missing Resolve Python API, **when** resolve runs, **then** error message points to `resolve_scripts/README.md` setup (**CF-FR-37**, **CF-NFR-I1**).
- **Given** `--dry-run`, **when** resolve stage runs, **then** handoff is simulated and logged without API mutation (**CF-FR-04**, **G1**).

**Technical notes**

- `agents/resolve_agent.py` + `resolve_scripts/resolve_editor.py`; `test-resolve` helper if present.
- POC: `clip_path` absent → log extraction gap (**CF-FR-29**); do not block G1 dry-run.

---

### Story 5.2: Render Output Configuration

As an **operator / producer**,
I want render format, codec, and output directory from configuration,
So that masters land in predictable job-identified paths.

**Acceptance criteria**

- **Given** `settings.yaml` render section, **when** render is invoked (live mode), **then** format, codec, and output directory apply (**CF-FR-35**).
- **Given** completed render, **when** job finishes, **then** output files live under configured path with `job_id` in filenames (**CF-FR-36**).
- **Given** dry-run, **when** job completes, **then** report lists intended output path without writing media (**CF-FR-04**).

**Technical notes**

- Coordinate settings with `config/settings.yaml`; document Resolve version/API 19+.
- Growth: MoviePy/FFmpeg extraction populates `clip_path` before render (**G6**).

---

### Story 5.3: POC Exit Gates Validation

As a **platform builder**,
I want a documented POC exit runbook executing G1–G5 and G6 path,
So that the team can declare P0 complete with evidence.

**Acceptance criteria**

- **Given** POC checklist, **when** `clipforge run --dry-run` is executed, **then** **G1** passes (report + state) (**G1**, **CF-NFR-R1**).
- **Given** sample MP4, **when** `clipforge analyze --input` runs, **then** **G2** passes (**G2**, **CF-FR-24**).
- **Given** inbox media job, **when** full dry-run or local job runs, **then** **G3** passes (`timeline_plan` + sidecars) (**G3**).
- **Given** two steering files on same dataset, **when** jobs run, **then** **G4** passes (plans differ) (**G4**, **CF-FR-09**, **CF-FR-15**).
- **Given** `clipforge watch --dry-run`, **when** ≥3 cycles run, **then** **G5** passes (**G5**, **CF-NFR-R2**).
- **Given** Growth render requirement, **when** documentation is read, **then** **G6** path describes `clip_path` extraction → Resolve MP4 on disk (**G6**, **CF-FR-29**).
- **Given** README and example steering, **when** reviewed, **then** operator media rights acknowledgment is present and core agents contain no genre hardcoding (**CF-FR-38**, **CF-FR-39**).

**Technical notes**

- Add `docs/POC_EXIT.md` or section in `README.md` with command transcript template.
- Optional script `scripts/poc_gate_check.sh` invoking gates in sequence.
- Record known limitation: no SaaS, no clip extraction in P0.

---

## Story index (sprint planning keys)

| Story | Sprint key (kebab) |
|-------|-------------------|
| 1.1 | `1-1-job-definition-cli` |
| 1.2 | `1-2-langgraph-orchestrator-graph` |
| 1.3 | `1-3-job-report-and-dry-run` |
| 1.4 | `1-4-job-id-and-supervisor-observability` |
| 2.1 | `2-1-workflow-definitions-loader` |
| 2.2 | `2-2-dataset-path-expansion` |
| 2.3 | `2-3-steering-merge-overrides` |
| 3.1 | `3-1-local-ingest-trigger` |
| 3.2 | `3-2-url-download-acquisition` |
| 3.3 | `3-3-discovery-stub-and-hybrid-retry` |
| 3.4 | `3-4-continuous-watch-loop` |
| 4.1 | `4-1-segment-analysis-cli` |
| 4.2 | `4-2-audio-visual-scoring-filter` |
| 4.3 | `4-3-segment-sidecar-artifacts` |
| 4.4 | `4-4-timeline-sequencing-plan` |
| 5.1 | `5-1-resolve-timeline-handoff` |
| 5.2 | `5-2-render-output-configuration` |
| 5.3 | `5-3-poc-exit-gates-validation` |

**Next BMad step:** [SP] Sprint Planning → [IR] Implementation Readiness → [DS] Dev Story per sprint key.
