# ENTERPRISE — Cursor workspaces

ENTERPRISE is split into **two agent-led workspaces** plus shared contracts. Open the folder or multi-root workspace that matches your task.

| Workspace | Open in Cursor | Lead agents | Owns |
|-----------|----------------|-------------|------|
| **UX / LCARS** | `enterprise/ux/` or [enterprise-ux.code-workspace](../enterprise-ux.code-workspace) | **Production council** — Michael Okuda, Denise Okuda, Gene Roddenberry | LCARS web console, screen IA, visual law, Playwright UX gates |
| **Platform** | `enterprise/platform/` or [enterprise-platform.code-workspace](../enterprise-platform.code-workspace) | **Engineering crew** — Captain Picard (chair), La Forge, Data, Worf | Engine, Matter adapter, OpenSpec, sim harness, W0 spike, gate artifacts |
| **Shared** | `enterprise/shared/` (included in both workspaces) | Both | Cross-surface contracts (e.g. TNG interaction copy) |

## Quick start

### UX workspace (LCARS only)

```powershell
# Terminal 1 — platform engine (from platform workspace)
cd enterprise/platform/runtime
$env:MATTER_ADAPTER='mock'; $env:ALERT_STORE='memory'
npm install; npm run dev:engine

# Terminal 2 — LCARS
cd enterprise/ux/runtime
npm install; npm run dev:lcars
# http://localhost:5173/
```

### UX verify (headless)

```powershell
cd enterprise/ux/scripts
.\ux-verify.ps1
```

### Platform workspace (engine + sim)

```powershell
cd enterprise/platform/runtime
npm install; npm run dev:engine
# Sim bridge, Unity, OpenSpec — see platform/index.md
```

## Agent routing

| If you are… | Read first | Party Mode |
|-------------|------------|------------|
| LCARS / visual / screen IA | `ux/AGENTS.md` + `ux/lcars-ui-authoritative-spec.md` | Okuda wing — `ux/docs/agents/process-party-mode.md` |
| API / Matter / FSM / infra | `platform/AGENTS.md` | Picard senior staff — `platform/docs/agents/process-senior-staff-meeting.md` |

## Rules

1. **UX agents MUST NOT** change `platform/runtime/engine` without platform lead review.
2. **Platform agents MUST NOT** change LCARS pixels without UX council review (`lcars-ui-authoritative-spec.md`).
3. Cross-workspace changes need updates in **both** `index.md` files and a note in PR description.

## BMad planning artifacts

Product-wide BMad config still points at `enterprise/` on branch `product/enterprise`. Sub-workspace paths are listed in each `AGENTS.md`.
