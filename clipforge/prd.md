---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
releaseMode: phased
mvpPosture: editor_simulation_poc
inputDocuments:
  - './product-brief-ClipForge.md'
  - './product-brief-ClipForge-distillate.md'
  - './README.md'
  - './docs/ARCHITECTURE.md'
  - './index.md'
workflowType: prd
briefCount: 1
researchCount: 0
brainstormingCount: 0
projectDocsCount: 3
productName: ClipForge
classification:
  projectType: agent_orchestration_platform
  projectTypeTags:
    - langgraph_pipeline
    - video_editor_simulation
    - local_first_media
    - nle_integration
  domain: creative_automation
  secondaryDomain:
    - post_production
    - multimodal_ml
  complexity: medium
  complexityNotes:
    poc: medium — pipeline + Resolve + CV stubs
    northStar: high — fleet orchestration, discovery, learning loop
  projectContext: greenfield_product
  projectContextNotes: brownfield scaffold on product/clipforge branch May 2026
  primaryUser: operator_producer
  mvpSurfaces:
    - cli
  deferredSurfaces:
    - web_ui
    - agent_marketplace
    - cloud_gpu_fabric
  experienceMandate: configuration_over_code
  northStarMetric: editor_hours_replaced_per_finished_minute
  explicitNonGoals:
    - genre_specific_core_logic
    - hosted_saas_mvp
    - replacing_resolve_in_poc
elicitationApplied:
  - bmad_product_workflow_synthesis
  - scope_poc_vs_vision_alignment
visionSummary:
  product: ClipForge
  tagline: Multi-agent editor simulation — any footage, any style, local-first
date: '2026-05-26'
---

# Product Requirements Document — ClipForge

**Author:** Onimurasame  
**Date:** May 26, 2026  
**Branch:** `product/clipforge`

## Document Map

| Section | Purpose | Primary audience |
|---------|---------|------------------|
| [Executive Summary](#executive-summary) | Vision, classification, positioning | Human |
| [Success Criteria](#success-criteria) | Outcomes, POC acceptance gates | Both |
| [Traceability](#traceability) | KPI → Journey → FR → NFR | LLM |
| [Product Scope](#product-scope) | Summary + procurement | Human |
| [User Journeys](#user-journeys) | Narrative context | Human |
| [Domain Requirements](#domain-specific-requirements) | Rights, local-first, safety | Both |
| [Differentiation](#differentiation) | Innovation and market gap | Human |
| [Out of Scope (POC)](#out-of-scope-poc) | Negative requirements | LLM |
| [Project Scoping](#project-scoping--phased-development) | **Canonical** phased scope | Both |
| [Functional Requirements](#functional-requirements) | **Capability contract** | LLM |
| [Non-Functional Requirements](#non-functional-requirements) | Quality attributes | LLM |
| [Architecture Preview](#architecture-preview-non-normative) | Implementation orientation | LLM |

**Suggested LLM read order:** Frontmatter → POC Gates (G1–G5) → Functional Requirements → Non-Functional Requirements → Project Scoping → User Journeys.

## Executive Summary

**ClipForge** is a **content-agnostic, editing-style-agnostic** platform that simulates how professional video editors work: acquire footage from datasets or discovery, interpret a **steering brief** (natural language + structured knobs), select moments using pluggable analysis profiles, assemble a **timeline plan**, and render through **DaVinci Resolve** (POC) or additional NLEs (Vision).

The problem: finishing video at scale requires repetitive human judgment—reviewing rushes, picking peaks, pacing compilations, exporting masters. Existing automation is either manual NLE labor or brittle scripts tied to one niche.

**POC posture (P0 — Editor Simulation Loop):** Prove one complete job path on a single workstation: configure dataset + workflow + steering, ingest or download sources, score segments, sequence to target duration, hand off to Resolve, emit output + job report. CLI only; heuristic CV; discovery stub with `watch` loop.

**North star (Vision):** **Full replacement of human editors** for configured workflows—autonomous agent fleets, continuous internet discovery, LLM interpretation of producer briefs, optional human approval gates, multi-format delivery, and models that improve from rendered outputs.

### What Makes This Special

- **Editor role mapping** — each agent mirrors a human post role (ingest, find sources, pull rushes, review, rough cut, online/render).
- **Configuration is the product** — datasets, workflows, steering, and triggers define behavior; core code stays domain-neutral.
- **Professional finish** — Resolve (and later other NLEs) remain the quality authority for final pixels.
- **Stateful production graph** — retries when the timeline is short; job lineage for reproducibility (Growth).

### Classification

| Dimension | Value |
|-----------|--------|
| Project type | Agent orchestration platform |
| Domain | Creative automation / post-production |
| Complexity | Medium (POC) → High (Vision) |
| MVP surface | CLI |
| Primary user | Operator / producer |

## Success Criteria

### North-star outcomes (Vision)

| KPI | Definition |
|-----|------------|
| **Editor time replaced** | Ratio of human editor hours avoided per finished minute delivered |
| **Job success rate** | % of jobs reaching approved master without human re-cut |
| **Steering fidelity** | Operator rating that output matched brief (≥4/5 internal target) |
| **Corpus growth** | Qualified segments added per discovery cycle (automated pipelines) |

### POC success (P0)

| Criterion | Measure |
|-----------|---------|
| **Loop proven** | LangGraph job completes supervisor → resolve path |
| **Config drives behavior** | Different workflow + steering changes plan without code edit |
| **Local ingest works** | Files in dataset inbox analyzed and sequenced |
| **Resolve integration** | `test-resolve` passes; render path documented for real clips |
| **Automation hook** | `watch` runs repeated jobs without manual restart |

### POC acceptance gates

| Gate | Requirement |
|------|-------------|
| **G1** | `clipforge run --dry-run` completes; report + state emitted |
| **G2** | `clipforge analyze --input <sample.mp4>` returns scored segments |
| **G3** | Local job with inbox media produces timeline_plan + segment sidecars |
| **G4** | Steering YAML overrides workflow defaults on same dataset |
| **G5** | `clipforge watch --dry-run` runs ≥3 cycles without crash |

**Growth gate (G6, post-POC):** End-to-end render with extracted `clip_path` files → Resolve MP4 on disk.

## Traceability

| Success / KPI | Journey | FR | NFR / Gate |
|---------------|---------|-----|------------|
| Loop proven | 0, 1 | CF-FR-01–08, CF-FR-20–25 | G1, NFR-R1 |
| Config drives behavior | 0, 2 | CF-FR-09–12, CF-FR-15 | G4 |
| Local ingest | 0 | CF-FR-13–14, CF-FR-20–22 | G2, G3 |
| Resolve render | 0, 4 | CF-FR-23–25 | G3, G6 |
| Discovery automation | 3 | CF-FR-16–19, CF-FR-30 | G5 |
| Editor replacement (Vision) | 5, 6 | CF-FR-G1–G12 | — |
| Rights-safe operation | all | CF-FR-40–42 | NFR-S1–S3 |

## Product Scope

**Canonical scope:** [Project Scoping & Phased Development](#project-scoping--phased-development).  
**Capabilities:** [Functional Requirements](#functional-requirements).  
**Quality:** [Non-Functional Requirements](#non-functional-requirements).

**POC summary:** CLI editor-simulation loop — datasets, workflows, steering, triggers, LangGraph agents, segment scoring, timeline sequencing, Resolve handoff.

**Implementation reference (brownfield scaffold):** `clipforge/agents/`, `clipforge/main.py`, `clipforge/config/`, `clipforge/docs/ARCHITECTURE.md`.

## User Journeys

### Personas

| Persona | Role |
|---------|------|
| **Operator / producer** | Owns corpora, steering briefs, approves masters |
| **Automation owner** | Runs discovery/watch pipelines |
| **Platform builder** | Authors workflows, analysis profiles, agent plugins (Vision) |

### Journey 0 — Local inbox: first compile (POC)

Operator drops rushes in `data/raw/inbox/`, copies `steering.example.yaml`, runs `clipforge run --trigger manual_local`. System ingests, scores segments, builds timeline plan, attempts Resolve render (or reports extraction gap).

**Covers:** CF-FR-09–15, CF-FR-20–25, G2–G4

### Journey 1 — URL batch (POC)

Producer supplies URLs in steering or CLI. Discovery → download → analysis → sequence → resolve.

**Covers:** CF-FR-16–19, CF-FR-20–25

### Journey 2 — Steering-only creative change (POC)

Same dataset and media; operator changes NL brief, `min_segment_score`, pacing, or workflow id. Output plan differs.

**Covers:** CF-FR-09–12, CF-FR-15, G4

### Journey 3 — Continuous discovery (POC / Growth)

Automation owner enables `discovery` in steering, runs `clipforge watch`. System polls, acquires new URLs when tools available, re-runs pipeline.

**Covers:** CF-FR-16–19, CF-FR-30, G5

### Journey 4 — Hybrid corpus growth (Growth)

Local dataset plus discovery retry until `target_minutes` satisfied.

**Covers:** CF-FR-14, CF-FR-19, CF-FR-22

### Journey 5 — Producer review & approve (Growth)

Job completes → operator reviews segment manifest + preview → approves render or re-steers job.

**Covers:** CF-FR-26–29, CF-FR-G2

### Journey 6 — NL-only job (Vision)

Producer provides natural-language brief only; LLM agents populate steering, select workflow, run fleet.

**Covers:** CF-FR-G1, CF-FR-G3, CF-FR-G4

### Journey 7 — Editor fleet / marketplace (Vision)

Operator installs workflow pack + analysis profile from marketplace; agents specialize (sports, documentary, social vertical).

**Covers:** CF-FR-G5–G8

### Failure journeys

| ID | Trigger | Response | FR |
|----|---------|----------|-----|
| F1 | No media after ingest | Actionable error; skip resolve | CF-FR-13, CF-FR-42 |
| F2 | Resolve unavailable | Fail with setup guide | CF-FR-25, CF-FR-42 |
| F3 | Timeline under target | Discovery retry (if enabled) | CF-FR-19, CF-FR-22 |
| F4 | Rights violation flag | Halt job; audit log | CF-FR-40–41 |

## Domain-Specific Requirements

**Domain:** Operator-owned creative automation — local media, explicit rights, optional WAN for discovery only.

### Rights & compliance

- Operator warrants rights to all source media processed locally.
- Discovery and download are **opt-in** per job steering; no silent scraping defaults.
- Platform ToS for remote acquisition must be respected; operator-configured credentials only.
- Optional watermark / attribution fields in steering (Growth).

### Local-first posture

| Phase | Processing | Data residency |
|-------|------------|----------------|
| P0 POC | Single workstation | All rushes, clips, outputs on local disk |
| P1 Growth | Same + job DB | SQLite metadata local |
| P2 Vision | Optional cloud GPU workers | Source masters remain operator-controlled; workers ephemeral |

### Safety & abuse prevention

- No bundled default datasets targeting copyrighted or non-consensual content.
- Job audit log: sources, steering hash, segment list, output path (Growth).
- Rate limits on discovery retries and download concurrency (Growth).

## Differentiation

| Alternative | Gap ClipForge fills |
|-------------|---------------------|
| Manual Resolve/Premiere | Automates repeatable editor decisions at scale |
| Template auto-edit apps | Style- and genre-agnostic via workflows + steering |
| One-shot generative video | Grounded in real footage corpora with lineage |
| Generic RPA | Understands timeline structure, segment scores, NLE APIs |

## Out of Scope (POC)

- Web UI, REST API, multi-tenant SaaS
- Agent marketplace and billing
- Cloud GPU fabric as default runtime
- Shipped fine-tuned domain models (operator brings models)
- Full LLM web discovery (stub only)
- Human approval UI (CLI logs only)
- Multi-NLE beyond Resolve
- Automatic publishing/distribution

## Project Scoping & Phased Development

### P0 — POC: Editor Simulation Loop (current)

**Goal:** Prove the core loop and configuration model.

| Capability | Delivered |
|------------|-----------|
| LangGraph orchestrator + agent crew | ✓ scaffold |
| Datasets, workflows, steering YAML | ✓ |
| Triggers: manual_local, manual_urls, discovery, hybrid, watch | ✓ scaffold |
| Segment scoring (heuristic profiles) | ✓ |
| Timeline sequencing | ✓ |
| Resolve script + dry-run | ✓ |
| Clip file extraction to disk | ✗ Phase 1 impl |
| LLM steering execution | ✗ Phase 2 |
| Full web discovery | ✗ Phase 2 |

**Exit:** Gates G1–G5 pass; G6 documented path for real render.

### P1 — Growth: Trustworthy production jobs

- MoviePy (or FFmpeg) segment extraction → `clip_path` populated
- SQLite job store: status, lineage, steering snapshot
- Manifest datasets (JSONL)
- Discovery LangChain tools (search → URL)
- Operator review CLI: list segments, approve/reject, re-run
- 24h `watch` soak with metrics

### P2 — Growth: Producer scale

- LLM interprets `directives.natural_language` into steering deltas
- Additional analysis profiles (face mesh, custom ONNX)
- Multi-workflow batch queue
- Render presets per workflow

### P3 — Vision: Human editor replacement

- Web UI (FastAPI + Gradio): job composer, fleet dashboard
- Agent marketplace: installable workflow + profile packs
- Optional cloud GPU workers (RunPod / Vast.ai) with same job contract
- Multi-NLE adapters (Premiere, Final Cut) behind `resolve_agent` interface
- Human-in-the-loop approval gates before final render
- Learning loop: rendered outputs feed profile fine-tuning

### P4 — Vision: Autonomous editorial fleet

- Always-on discovery per dataset with budget caps
- Self-healing pipelines (agent retries, model fallback)
- Multi-operator tenancy and clearance (if productized)
- Vertical deliverables (16:9, 9:16, 4K) from one steering brief

## Functional Requirements

*Format: **CF-FR-NN** — testable capability; implementation-agnostic.*

### Job orchestration

| ID | Requirement |
|----|-------------|
| CF-FR-01 | System SHALL accept a job definition combining workflow id, dataset id(s), trigger mode, and optional steering file. |
| CF-FR-02 | System SHALL execute jobs through a stateful orchestration graph with defined agent stages. |
| CF-FR-03 | System SHALL emit a job report including errors, segment counts, and output path when complete. |
| CF-FR-04 | System SHALL support dry-run mode that exercises the graph without destructive side effects. |
| CF-FR-05 | System SHALL assign a unique job id per run for traceability (Growth: persist to job store). |
| CF-FR-06 | System SHALL allow supervisor observability messages in job state (Growth: structured logs). |

### Configuration — workflows

| ID | Requirement |
|----|-------------|
| CF-FR-07 | System SHALL load workflow definitions declaring edit style, analysis profile, and default pacing/transitions. |
| CF-FR-08 | System SHALL support multiple workflow types at minimum: dense compilation, highlight reel, narrative arc. |
| CF-FR-09 | System SHALL merge workflow defaults with per-job steering, with steering overriding defaults. |

### Configuration — datasets

| ID | Requirement |
|----|-------------|
| CF-FR-10 | System SHALL load dataset definitions with local path globs, optional seed URLs, and discovery queries. |
| CF-FR-11 | System SHALL support multiple datasets referenced in a single job. |
| CF-FR-12 | System SHALL expand configured path globs to concrete media file lists at ingest time. |
| CF-FR-13 | System SHALL ingest local media from configured datasets without network acquisition when trigger is `manual_local`. |

### Configuration — steering

| ID | Requirement |
|----|-------------|
| CF-FR-14 | System SHALL accept steering directives: natural-language brief, target duration, min segment score, segment duration bounds, pacing, transitions, ranking weights. |
| CF-FR-15 | System SHALL apply steering changes to analysis thresholds and sequencing behavior without code changes. |
| CF-FR-16 | System SHALL store discovery settings in steering: enabled flag, queries, poll interval, max retries. |

### Triggers & acquisition

| ID | Requirement |
|----|-------------|
| CF-FR-17 | System SHALL support trigger mode `manual_urls` using explicit URL lists. |
| CF-FR-18 | System SHALL support trigger mode `discovery` to collect candidate URLs before download. |
| CF-FR-19 | System SHALL support trigger mode `hybrid` combining local ingest and discovery retry when timeline is under target. |
| CF-FR-20 | System SHALL download remote media via configurable acquisition tool when URLs are present. |
| CF-FR-21 | System SHALL filter downloads by minimum resolution when configured. |
| CF-FR-22 | System SHALL retry discovery when sequenced duration is below steering target and retries remain. |
| CF-FR-23 | System SHALL run a continuous watch loop invoking jobs on a configured interval (`scheduled` / discovery). |

### Analysis & selection

| ID | Requirement |
|----|-------------|
| CF-FR-24 | System SHALL analyze each ingested media file and produce segment candidates with scores and time ranges. |
| CF-FR-25 | System SHALL support pluggable analysis profiles selected by workflow (e.g. intensity peaks, scene change). |
| CF-FR-26 | System SHALL score audio emphasis per segment and combine with visual scores per steering weights. |
| CF-FR-27 | System SHALL persist qualified segment metadata as sidecar artifacts for audit (POC: JSON files). |
| CF-FR-28 | System SHALL filter segments below `min_segment_score` from the timeline plan. |
| CF-FR-29 | System SHALL extract media clips to disk for timeline items before NLE handoff (Growth). |

### Sequencing & timeline

| ID | Requirement |
|----|-------------|
| CF-FR-30 | System SHALL build a timeline plan ordering segments up to target duration. |
| CF-FR-31 | System SHALL deduplicate overlapping segments from the same source when edit style is compilation/highlights. |
| CF-FR-32 | System SHALL respect narrative ordering when workflow edit style is narrative. |
| CF-FR-33 | System SHALL attach transition intent per segment (cut, crossfade, dissolve) from steering/workflow. |

### Render & output

| ID | Requirement |
|----|-------------|
| CF-FR-34 | System SHALL create an NLE project/timeline and append planned clips sequentially. |
| CF-FR-35 | System SHALL invoke professional render settings (format, codec, output directory) from configuration. |
| CF-FR-36 | System SHALL write final outputs under a configured output path with job-identifying names. |
| CF-FR-37 | System SHALL surface actionable errors when NLE scripting modules are unavailable. |

### Compliance & operations

| ID | Requirement |
|----|-------------|
| CF-FR-38 | System SHALL require operator acknowledgment of media rights in documentation; jobs SHALL NOT bypass operator-configured discovery off switch. |
| CF-FR-39 | System SHALL NOT ship hardcoded content-domain logic in core agents (genre/niche in config only). |
| CF-FR-40 | System SHALL halt jobs when ingest and discovery produce zero media, with explicit errors. |
| CF-FR-41 | System SHALL log acquisition URLs and local paths used per job (Growth: SQLite audit). |

### Growth capabilities

| ID | Requirement |
|----|-------------|
| CF-FR-42 | System SHALL persist job records with steering snapshot and status transitions (Growth). |
| CF-FR-43 | System SHALL expose CLI commands to list, inspect, and re-run jobs from history (Growth). |
| CF-FR-44 | Operator SHALL approve or reject segment candidates before render (Growth). |
| CF-FR-45 | System SHALL execute LangChain tools for web discovery queries in steering (Growth). |

### Vision capabilities (editor replacement)

| ID | Requirement |
|----|-------------|
| CF-FR-G1 | System SHALL translate a natural-language-only producer brief into workflow + steering without manual YAML (Vision). |
| CF-FR-G2 | System SHALL support optional human approval gate before final render (Vision). |
| CF-FR-G3 | System SHALL orchestrate multiple specialized agents selected by workflow pack (Vision). |
| CF-FR-G4 | System SHALL run concurrent jobs across a worker pool with shared dataset registry (Vision). |
| CF-FR-G5 | System SHALL install third-party workflow/analysis packs from a marketplace (Vision). |
| CF-FR-G6 | System SHALL export the same timeline plan to multiple NLE backends (Vision). |
| CF-FR-G7 | System SHALL deliver multiple aspect ratios and resolutions from one job (Vision). |
| CF-FR-G8 | System SHALL improve analysis profiles using feedback from rendered outputs (Vision). |
| CF-FR-G9 | Web UI SHALL compose jobs, monitor fleets, and preview segments (Vision). |
| CF-FR-G10 | System SHALL enforce discovery budget caps per dataset per day (Vision). |
| CF-FR-G11 | System SHALL support multi-operator roles with scoped dataset access (Vision). |
| CF-FR-G12 | System SHALL achieve ≥90% job success without human re-cut for defined workflow packs (Vision KPI). |

## Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| CF-NFR-P1 | Performance | POC: analyze 1080p sample at ≥2 FPS effective sampling on M-series Mac or equivalent |
| CF-NFR-P2 | Performance | Growth: single-job segment analysis < 2× realtime duration for 1080p |
| CF-NFR-R1 | Reliability | Graph completes dry-run without unhandled exceptions (G1) |
| CF-NFR-R2 | Reliability | `watch` completes 3 consecutive cycles without crash (G5) |
| CF-NFR-R3 | Reliability | Growth: job store recovers in-progress jobs after process restart |
| CF-NFR-S1 | Security | Secrets via env/local config only; never committed to repo |
| CF-NFR-S2 | Security | No inbound network services required for POC |
| CF-NFR-S3 | Compliance | Discovery disabled by default in example steering |
| CF-NFR-O1 | Observability | POC: stderr errors list agent stage and cause |
| CF-NFR-O2 | Observability | Growth: structured JSON logs per agent transition |
| CF-NFR-M1 | Maintainability | New workflow = YAML row only; no core agent fork |
| CF-NFR-M2 | Maintainability | New analysis profile = CV module plug-in implementing scorer contract |
| CF-NFR-I1 | Integration | Resolve scripting API 19+ documented in `resolve_scripts/README.md` |
| CF-NFR-I2 | Integration | Growth: yt-dlp version pinned in requirements.txt |
| CF-NFR-U1 | Usability | CLI `--help` documents all triggers and required flags |
| CF-NFR-U2 | Usability | Growth: one steering example per workflow type |
| CF-NFR-SC1 | Scalability | Vision: horizontal workers share read-only dataset mounts |
| CF-NFR-AI1 | AI safety | LLM tools constrained to acquisition/metadata; no autonomous publish (Vision) |

## Architecture Preview (non-normative)

- **Orchestration:** LangGraph `StateGraph` — see `docs/ARCHITECTURE.md`
- **Config plane:** `workflows.yaml`, `datasets.yaml`, steering files, `settings.yaml`
- **Agent crew:** ingest, discovery, download, analysis, sequencing, resolve
- **CV plane:** `segment_scorer` + `audio_analyzer` with profile id
- **Render plane:** DaVinci Resolve Python API (POC); adapter interface (Vision)

**Next BMad step:** [CA] Create Architecture (`architecture.md`) — normative technical design.  
**Then:** [CE] Create Epics and Stories → [IR] Implementation Readiness → [SP] Sprint Planning.
