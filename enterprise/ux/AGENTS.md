# ENTERPRISE UX workspace — agent charter

**Workspace root:** `enterprise/ux/`  
**Stakeholders:** Star Trek **Production council** (Okuda design law + Roddenberry vision)  
**Mission:** LCARS operator console — vector-forward chrome, screen IA, visual regression, Okuda compliance.

---

## Council roster (primary)

| Agent | Role | Authority |
|-------|------|-----------|
| **Michael Okuda** | LCARS information design | Grid, alert-as-behavior, SVG geometry law |
| **Denise Okuda** | Production continuity | 1280×720 viewfinder, TRIAX, motion law, baselines |
| **Gene Roddenberry** | Vision | Captain-not-passenger, house-as-vessel framing |

Roster file: [docs/agents/production-council-roster.yaml](./docs/agents/production-council-roster.yaml)

**Party Mode:** [docs/agents/process-party-mode.md](./docs/agents/process-party-mode.md) + [VOICE-LAW.md](./docs/agents/VOICE-LAW.md)

**BMad UX skills (repo root):** `.agents/skills/bmad-create-ux-design`, `bmad-agent-ux-designer`, **`enterprise-ux-tester`** (Playwright — read `../../.agents/skills/enterprise-ux-tester/SKILL.md`)

---

## Normative docs (read before editing UI)

| Doc | Purpose |
|-----|---------|
| [lcars-ui-authoritative-spec.md](./lcars-ui-authoritative-spec.md) | **STRICT** mutation law |
| [ux-design-specification.md](./ux-design-specification.md) | Full UX workflow |
| [lcars-screen-inventory.md](./lcars-screen-inventory.md) | Screen + chrome IDs |
| [ux-design-directions.html](./ux-design-directions.html) | D1–D6 reference (D1+D2 ships) |
| [sim-ux-specification.md](./sim-ux-specification.md) | Panel / Unity renderer surfaces |
| [../shared/tng-interaction-contract.md](../shared/tng-interaction-contract.md) | Copy grammar |

---

## Code ownership

| Path | Package |
|------|---------|
| `runtime/lcars-web/` | `@enterprise/lcars-web` — React reference renderer |
| `runtime/e2e/` | Playwright UX gates (1280×720) |
| `scripts/ux-verify.ps1` | Headless verify (starts platform engine + LCARS) |

**Depends on:** `enterprise/platform/runtime` engine at `:3001` (Station API). Do not fork engine logic here.

---

## Commands

```powershell
cd enterprise/ux/runtime
npm install
npm run dev:lcars          # :5173

cd enterprise/ux/scripts
.\ux-verify.ps1            # full UX gate
```

---

## Forbidden without council waiver

- Material / shadcn / generic dashboard UI  
- Removing `ops.overview` as default route  
- Changing Playwright baselines without intentional spec revision  
- Editing `platform/` engine routes from UX workspace  
