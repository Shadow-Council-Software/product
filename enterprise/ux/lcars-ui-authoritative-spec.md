# LCARS UI — Authoritative Specification (STRICT)

**Status:** Normative · Council-mandated  
**Date:** 2026-06-02  
**Owner:** UX Review Council (Okuda wing + La Forge implementation gate)  
**Supersedes:** Ad-hoc agent styling, Vite defaults, and “looks LCARS enough” judgment calls  

**Parent documents (hierarchy):**

1. This file — **UI mutation law** (what may change, how, and on which renderer)
2. [ux-design-specification.md](./ux-design-specification.md) — product UX, F-01–F-12 frozen decisions
3. [lcars-screen-inventory.md](./lcars-screen-inventory.md) — screen IDs and chrome catalog
4. [sim-ux-specification.md](./sim-ux-specification.md) — Unity/Unreal/panel renderers only
5. [docs/fixtures/visual-foundation-freeze.certificate.yaml](./docs/fixtures/visual-foundation-freeze.certificate.yaml) — token/motion law

**Reference (non-shipping):**

- [ux-design-directions.html](./ux-design-directions.html) — D1–D6 layout compass; **only D1+D2 hybrid ships** (ledger A-07)
- Playwright baselines under `enterprise/runtime/e2e/tests/__screenshots__/`

---

## 0. Executive truth (read first)

| Claim | Fact in repo |
|-------|----------------|
| “Production vector-only LCARS with show animations is live” | **Not shipped.** No commit integrates full animated vector bridge as the operator app. |
| Vector geometry exists | **Partial:** `lcars-web/src/components/primitives/LcarsFrame.tsx` (SVG) — **must become spine**; currently unused in `App.tsx`. |
| Browser LCARS | **Sprint 1 reference renderer:** `enterprise/runtime/lcars-web` (React/Vite). **Required** for MVP; not a substitute for panel/Unity surfaces. |
| Unity LCARS | **Spatial harness + placeholders** — `PocSceneDirector` labels HealthStrip quad **PLACEHOLDER (not Okuda LCARS)**. Authoritative for **placement**, not daily ops chrome. |
| Design reference HTML | `ux-design-directions.html` — static D1–D6; **layout authority**, not runtime. |

**Operator expectation:** Bridge at a Glance (`ops.overview`) with Okuda geometry, TRIAX tiles, alert-as-behavior, Environmental drill-down — on **web LCARS first**, same Station API later on panels.

---

## 1. Purpose and audience

This spec **MUST** be read before any PR that touches:

- `enterprise/runtime/lcars-web/**`
- Experience-pack tokens/composites used by LCARS
- Playwright UX baselines or W-CT contracts
- Unity render targets presented as operator-facing LCARS

**Audience:** Human operators, implementers, and AI agents. Agents **MUST NOT** improvise layout, fonts, or component libraries not listed here.

---

## 2. Normative language

- **MUST / SHALL** — merge blocker if violated  
- **MUST NOT** — merge blocker  
- **MAY** — optional with documented waiver (§19)  
- **Reference** — design compass only; never deployed without spec amendment  

---

## 3. Three bins (Denise continuity law)

| Bin | Definition | Examples |
|-----|------------|----------|
| **Production-ready** | Unflagged operator routes on `main`; certificate + baselines | `ops.overview`, `env.subsystem`, chrome IDs in screen inventory |
| **Design reference** | Exploration; council-chosen subset ships | `ux-design-directions.html`; rejected D4/D6/npm LCARS |
| **Debug harness** | Flagged, sim-only, or placeholder | Unity quads, feature-flag scaffolds, agent “demo” pills without spec |

**Rule:** Debug harness chrome **MUST NOT** ship on operator routes without spec revision + baseline refresh.

---

## 4. Renderer registry

| ID | Surface | Role | Sprint | Authoritative for |
|----|---------|------|--------|-------------------|
| `web-lcars` | `enterprise/ux/runtime/lcars-web` (Vite/React) | **Primary operator console** | 1 | Daily ops, clearance, alert ACK, Environmental loop |
| `design-html` | `ux-design-directions.html` | Layout compass | — | D1/D2 proportions only |
| `web-svg-primitives` | `LcarsFrame`, future `LcarsBar`/`ButtonElbow` | **Structural geometry** | 1→2 | Elbows, rails, panel cuts |
| `unity-harness` | `sim/unity/ENTERPRISE.HouseHarness` | Spatial + capture | 1 | Placement, 3 m legibility, okudaAudit frames |
| `backlit-plate` | Sim + physical | Dumb 2D client | 1 sim / 2+ wall | `env.subsystem` at central-hall anchor |
| `bezeled-panel` | Growth | Dumb 2D client | 2+ | Same transport as BACKLIT |

**MUST NOT:** Treat Unity placeholders or layout-studio floor editor as the operator LCARS app.

**MUST NOT:** Replace `web-lcars` with generic dashboard UI (Material, shadcn, IoT cards, white card grids).

---

## 5. Frozen visual decisions (do not re-litigate)

From [process-party-mode.md](./docs/agents/process-party-mode.md) and UX spec:

| ID | Law |
|----|-----|
| F-02 | **D1 Ops Command** layout — hero `ops.overview`, 18% / 52% / 18% grid at certified viewport |
| F-04 | **TRIAX** department identity (label / rail / fill) |
| F-05 | Custom **Okuda LCARS** — not Material/Chakra/shadcn as visual foundation |
| F-09 | **animated-red** Red Alert only; **static-red** Battle Stations only |
| A-07 | D1+D2 hybrid locked; `ux-design-directions.html` is council reference |

---

## 6. Geometry source of truth

### 6.1 Structural chrome (vector)

**MUST** use SVG paths or audited primitives for:

- Left/right arc rails  
- Header elbow caps  
- Panel corner cuts  
- Command-line elbow buttons  

**Source files (normative targets):**

- `lcars-web/src/components/primitives/LcarsFrame.tsx` (bridge spine — **restore to App shell**)  
- Future: `LcarsBar.tsx`, `ButtonElbow.tsx`, `LcarsPanel.tsx` per UX spec § Implementation approach  

**MUST NOT:** Use flat `border-radius` rectangles as the **only** rail geometry on production routes.

### 6.2 Layout (CSS)

**MAY** use CSS grid/flex for **18% / 52% / 18%** and spacing only. CSS **MUST NOT** invent new LCARS silhouettes.

### 6.3 Reference HTML

`ux-design-directions.html` **MUST** be consulted for D1 proportions. Deviations **MUST** be recorded in spec revision notes + baseline update.

---

## 7. Screen and chrome IDs (immutable without inventory amendment)

All production UI **MUST** bind to [lcars-screen-inventory.md](./lcars-screen-inventory.md):

| Requirement | ID |
|-------------|-----|
| Default route | `ops.overview` |
| Environmental drill-down | `env.subsystem` |
| Alert banner | `chrome.alert` (32px; hidden Green) |
| Console root | `lcars-console` / `lcars-bridge` |
| Session | `chrome.session-select` |
| Subsystem grid | `subsystem-grid` |

**MUST NOT** remove `ops.overview` as landing to show Environmental-only demo.

---

## 8. Animation and motion law

| State | Motion |
|-------|--------|
| Green / Normal | No alert banner (hidden) |
| Yellow Alert | Amber banner; slow pulse permitted |
| Red Alert | **animated-red** pulse (certificate `motion.alert.animated-red`) |
| Battle Stations | **static-red** — no pulse |

**MUST** respect `prefers-reduced-motion` (disable pulse; keep FSM semantics via copy/static indicators).

**MUST NOT** add decorative CSS animations on department tiles or HealthStrip.

---

## 9. Forbidden substitutions (Michael BLOCK list)

Agents and implementers **MUST NOT**:

1. Import npm LCARS UI kits as production dependencies (ledger R-07)  
2. Use Material UI, Chakra, shadcn, or Vite marketing templates as visual foundation  
3. Ship D4 “always-on alert banner” or D6 dense SCADA (R-02, R-03)  
4. Replace clearance UX with raw `<select>` **without** `ClearanceOverlay` on denied actions (overlay still required for W-CT-01)  
5. Copy Unity placeholder quads into web LCARS  
6. Change fonts/tokens globally without certificate + baseline refresh  
7. Merge “visual refresh” that removes `ops.overview` or bridge grid  

---

## 10. Web implementation rules (`lcars-web`)

1. **Shell:** `LcarsBridgeLayout` + chrome composites — **not** nested orphan frames fighting layout  
2. **Data:** TanStack Query + Station API only — no fabricated station state in components  
3. **Layers:** tokens → primitives (SVG) → composites → screens (per UX spec five layers)  
4. **Engine URL:** `VITE_ENGINE_URL` — same contracts as production  

---

## 11. CI gates (merge blockers)

From `enterprise/runtime/e2e/` — **all MUST pass** on UI PRs:

| Gate | Command / test |
|------|----------------|
| Smoke | `smoke.spec.ts` — ops.overview + env.subsystem |
| W-CT-01 | `w-ct-01-clearance.spec.ts` — Guest escalate → overlay |
| Layout visual | `layout-visual.spec.ts` — 1280×720 screenshots |
| Axe | No serious violations on load |
| Full suite | `node enterprise/runtime/e2e/scripts/ux-verify.mjs` |

**Baseline change rule:** Intentional visual change **MUST** run `--update-snapshots` in same PR with spec revision note citing §13.

---

## 12. Certified viewport

- **1280×720** — `lcars-certified` Playwright project  
- **MUST NOT** introduce horizontal overflow (NFR-UX3)  
- Quick Env pin **≤ 15%** of viewport width (W-CT-04)  

---

## 13. Change control

Any PR that changes **any** of the following **MUST** include:

1. Section in PR description citing this spec  
2. Updated Playwright baselines (if pixels move)  
3. Operator-visible note in `enterprise/runtime/e2e/reports/ux-verify-summary.md`  
4. Council waiver ID if violating a **Rejected** ledger item  

**Agents MUST NOT** silently “improve” UI without §11 passing.

---

## 14. Recovery plan (current gap — council 2026-06-02)

Ordered work to restore trust (no skip):

| Phase | Deliverable | Verification |
|-------|-------------|--------------|
| **P0** | Wire `LcarsFrame` (or successor SVG spine) into `App.tsx`; remove CSS-only fake rails | Visual match D1; baselines updated |
| **P1** | `LcarsPanel` + TRIAX `DepartmentTile` per F-04 | ops.overview grid |
| **P2** | AlertBanner 32px + motion law F-09 | Yellow/Red demo via engine API only |
| **P3** | ClearanceOverlay styling; remove dev-only alert pills | W-CT-01 pass |

**MUST NOT** repeat unapproved “Okuda pass” (global dark theme + Antonio + demo pills) without council sign-off.

---

## 15. Agent attestation (PR / task template)

```
[ ] Read enterprise/lcars-ui-authoritative-spec.md
[ ] Screen IDs match lcars-screen-inventory.md
[ ] No forbidden substitutions (§9)
[ ] ux-verify.mjs 6/6 PASS
[ ] Baselines updated only if intentional (§13)
```

---

## Council sign-off

| Authority | Verdict | Date |
|-----------|---------|------|
| Michael Okuda | **PASS WITH CONDITIONS** — P0 SVG spine required | 2026-06-02 |
| Denise Okuda | **PASS WITH CONDITIONS** — bin law + baselines | 2026-06-02 |
| Gene Roddenberry | **PASS** — web is reference renderer; panels follow | 2026-06-02 |
| Geordi La Forge | **PASS WITH CONDITIONS** — enforce §11 before merge | 2026-06-02 |

**Conditions:** Execute §14 P0–P3 before claiming “production LCARS restored.”

---

## Related commands

```powershell
# Mock stack (two workspaces)
cd enterprise/platform/runtime
$env:MATTER_ADAPTER='mock'; $env:ALERT_STORE='memory'
npm run dev:engine   # :3001

cd enterprise/ux/runtime
npm run dev:lcars    # :5173 — use http://localhost:5173/

# Headless UX gate
cd enterprise/ux/scripts
.\ux-verify.ps1
```
