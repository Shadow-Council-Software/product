---
title: Product Brief — ClipForge
status: complete
created: '2026-05-26'
updated: '2026-05-26'
author: Onimurasame
branch: product/clipforge
---

# Product Brief — ClipForge

## One-liner

**ClipForge** is a local-first, multi-agent platform that **simulates professional video editors**: ingest any footage corpus, steer cuts with a creative brief, and deliver finished timelines—eventually replacing human editors across genres and styles through configuration, not code forks.

## Problem

Video compilation and finishing are labor-intensive: finding sources, reviewing hours of rushes, selecting moments, pacing a timeline, and rendering. Teams repeat the same editor muscle memory for every niche (highlights, compilations, narrative cuts). Tooling is either manual NLE work or single-purpose scripts tied to one content type.

## Solution

An **editor-simulation orchestrator** (LangGraph) runs a crew of specialized agents mapped to human roles—ingest, discovery, download, analysis, sequencing, resolve/render—driven by:

- **Datasets** (what footage exists)
- **Workflows** (how an editor would cut: compilation, highlights, narrative)
- **Steering** (per-job producer notes: NL brief + structured knobs)
- **Triggers** (manual, URLs, automated discovery, scheduled watch)

No content domain or edit style is baked into product code.

## Target users

| Persona | Need |
|---------|------|
| **Operator / producer** | Run jobs, steer creative intent, review outputs |
| **Automation owner** | Always-on discovery → compile pipelines |
| **Platform builder** | Add workflows, datasets, analysis profiles without redeploying core |

## POC goal (P0)

Prove the **core editor loop** on local infrastructure:

1. Configure dataset + workflow + steering  
2. Ingest or acquire source media  
3. Score and select segments (CV + audio heuristics; profiles pluggable)  
4. Build a timeline plan  
5. Hand off to **DaVinci Resolve** for professional render  
6. Emit MP4 + job report  

CLI-only; no marketplace, no cloud GPU, no web UI.

## North star (vision)

**Full replacement of human editors** for supported workflows: autonomous fleets of style-specialized agents, continuous discovery, LLM interpretation of producer briefs, human-in-the-loop approval where required, multi-NLE and multi-format output, and self-improving selection models from rendered outcomes.

## Differentiation

| vs. | ClipForge |
|-----|-----------|
| Manual NLE only | Agents reproduce editor role boundaries; Resolve remains render authority |
| Single-purpose scrapers | Content-agnostic; steering + workflows define the niche |
| Generic auto-edit SaaS | Local-first, rights-aware, operator-owned corpora |
| One-shot LLM video tools | Stateful graph, retries, dataset lineage, reproducible jobs |

## Success signals (POC)

- One complete job from configured sources → rendered MP4 (or documented Resolve handoff with extracted clips)  
- Changing steering/workflow alters output behavior without code changes  
- `watch` discovery loop runs stably for 24h soak (dry-run acceptable for acquisition stub)  

## Out of scope (POC)

Web UI, billing, cloud workers, agent marketplace, fine-tuned domain models shipped as product defaults.

## Next BMad artifact

**PRD** (`prd.md`) — capability contract (FR/NFR), phased scope P0→Vision, acceptance gates, journeys.
