# Proposal: Layout Studio

## Why

Per-floor layout JSON was **AI-assisted from dimension labels**, not traced from the owner scan. Operators need a honest workflow to align source documents, edit room polygons, and compile to Unity without hand-editing JSON.

## What Changes

- **Layout Studio** web app (`enterprise/sim/layout-studio/`) — canvas editor, PDF underlay, per-floor save
- **HTTP API** on port 3098 — floor CRUD, sources manifest, compile pipeline
- **Sources manifest** — `layouts/sources/manifest.json` for scan alignment metadata
- **Docs** — Layout Studio as primary layout path (POC preview remains read-only)

## Non-goals

- Automatic room detection from PDF (assist trace only)
- Replacing `house-layout.schema.json` or bridge validation
- Multi-user / auth

## Success

Operator can load main floor, adjust a vertex, save, compile, and see updated Unity extrusion.
