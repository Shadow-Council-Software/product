# LCARS UX Framework — Dynamic Vector Layout System

**Status:** Proof of concept (POC) for discussion
**Date:** 2026-05-29
**Surface:** `runtime/lcars-web`
**Companion:** [lcars-screen-inventory.md](./lcars-screen-inventory.md), [ux-design-specification.md](./ux-design-specification.md), [sim/docs/LCARS-PRODUCTION-GATE-2026-05-29.md](./sim/docs/LCARS-PRODUCTION-GATE-2026-05-29.md)

## 1. Goal

Support **every current and future screen** in the domain with a single, flexible
system instead of hand-built components per screen. Requirements driving the design:

1. **Dynamic layouts** — screens are authored as data and composed at runtime.
2. **Vectors for everything** — each screen renders as one scalable SVG, so layouts
   scale to any viewport and remain crisp on a broadcast monitor.
3. **LCARS animations & effects** — diegetic vector decor (starfields, warp core,
   scanner sweeps) plus state-driven motion, all honoring the production motion law.

## 2. Architecture

```
ScreenDefinition (data)  ──►  LcarsScreen (renderer)  ──►  one scalable <svg>
        ▲                          │  layout engine (rail + 2-col panel flow)
        │                          │  vector primitives (elbow, blocks, readouts)
   screens.tsx registry            └─ decor layer (Starfield / WarpCore / effects)
                                       svgcontrol blocks for live interactive content
```

- A **screen is a `ScreenDefinition`**: a left-rail spine (`RailItem[]`), content
  panels (`PanelDef[]`), and an optional `decor` layer.
- The **renderer (`LcarsScreen`)** computes a pure-SVG layout (`viewBox` 1280×N) from
  that data: it lays out the elbow header, the rail spine, and a two-column panel flow,
  then draws everything as vector shapes and text.
- **Dynamic values** — any label/value/tone may be a function of `LcarsContext`
  (`alertPhase`, `clearance`, `conflictActive`), so a single definition covers all
  permutations.
- **Live interactive content** (e.g. the Environmental command panel) is authored as an
  `svgcontrol` block — pure tappable SVG, no `foreignObject`. The `custom`/foreignObject
  block survives only as a documented escape hatch (§8, decision 1).

### File map

| File | Role |
| --- | --- |
| `src/framework/types.ts` | Schema: `ScreenDefinition`, `RailItem`, `PanelBlock`, `LcarsContext` |
| `src/framework/palette.ts` | Tone-key → color, alert-phase color |
| `src/framework/vector/geometry.ts` | Elbow + rounded-block SVG path builders |
| `src/framework/vector/Starfield.tsx` | Animated star background → warp streaks under Red |
| `src/framework/vector/WarpCore.tsx` | Animated matter/antimatter intermix column |
| `src/framework/LcarsScreen.tsx` | Layout engine + vector renderer |
| `src/framework/screens.tsx` | Screen registry (definitions for the domain) |
| `src/lab/LcarsLab.tsx` | POC harness with permutation controls |

## 3. Authoring a screen

```ts
{
  id: 'eng.engineering',
  family: 'Engineering',
  title: 'Engineering · Main Computer',
  code: 'ENG-621',
  deck: 'Deck 8',
  decor: 'warpcore',
  rail: rail(),                       // shared station spine + readouts + cap
  panels: [
    { id: 'core', title: 'Warp Core', code: 'WC-47', span: 1, blocks: [
      { kind: 'metric', id: 'output', label: 'Core Output',
        value: (c) => c.alertPhase === 'Red' ? '112' : '86', unit: '%',
        tone: (c) => c.alertPhase === 'Red' ? 'red' : 'butterscotch' },
      { kind: 'status', id: 'intermix', label: 'Intermix',
        state: (c) => c.alertPhase === 'Red' ? { text: 'Forced', tone: 'red' }
                                              : { text: 'Stable', tone: 'green' } },
    ]},
    { id: 'env-auth', title: 'Environmental Authority', span: 1, blocks: [
      { kind: 'svgcontrol', id: 'live-env', height: 320,
        render: (ctx, geo) => <SvgEnvironmentalControl x={geo.x} y={geo.y} w={geo.w} ctx={ctx} /> },
    ]},
  ],
}
```

### Block kinds

| Kind | Use |
| --- | --- |
| `metric` | Large tabular numeric readout with unit |
| `status` | Single-line label → state pill (text + tone) |
| `text` | Wrapped prose (auto line-wrapped in SVG) |
| `svgcontrol` | Interactive pure-SVG control (tappable `<g>` blocks) |
| `custom` | Escape hatch: arbitrary React via `foreignObject` (avoid) |

### Rail items

`nav` (navigates between screens), `readout` (live value), `cap` (terminator block),
`spacer` (flexes to push the cap to the bottom).

## 4. Vector & motion strategy

- **Everything is SVG.** One `<svg viewBox>` per screen → resolution-independent; the
  layout engine positions blocks in viewBox units so it scales to any width.
- **Motion law (per TNG production gate):** idle chrome is static; the elbow plays a
  single one-shot fade on alert-phase entry; Red Alert is a hard step-end toggle ~1.0s;
  all motion is disabled under `prefers-reduced-motion`.
- **Decorative vector elements (diegetic):**
  - `starfield` — gentle twinkle at rest; **warp streaks** under Red Alert.
  - `warpcore` — pulsing matter/antimatter intermix column; cadence intensifies with
    alert; used behind Engineering (house-wide environmental authority).
  - *(planned)* `scanner-sweep`, `sensor-grid`, `power-flow` rails.

## 5. Screen inventory → framework status

Decor key: ✦ starfield · ⚛ warpcore · ☁ nebula · ◎ tactical (scanner) · — none.

| Screen ID | Family | In POC | Decor | Notes |
| --- | --- | --- | --- | --- |
| `ops.overview` | Ops — Command | ✅ | ✦ | Hero: vessel status, dept tiles, Quick Env pin |
| `eng.engineering` | Engineering | ✅ | ⚛ | Warp core (screen override) + live environmental authority |
| `env.subsystem` | Environmental | ✅ | — | Live command panel; guest read-only variant |
| `ops.conflict` | Conflict & Coexistence | ✅ | — | Authority conflict reconcile |
| `tac.overview` | Tactical | ✅ (stub) | ◎ | Perimeter + authority lock |
| `sci.overview` | Science | ✅ (stub) | ☁ | Sensor array (awaiting commissioning) |
| `ops.alert.*` | Ops alert flow | ⬜ planned | — | Interstitial, control, summary, baselines, rules |
| `onboard.*` | Onboarding | ⬜ planned | — | Welcome → hybrid → thread → commission → done |
| `ritual.nightwatch-lite` | Rituals | ⬜ planned | ✦ | Suspends under Yellow+ |
| `ops.audit` / `ops.soak*` | Observability | ⬜ planned | — | Audit log, soak control/log, degraded mode |
| `sys.*` | System | ⬜ planned | — | Stations, fabric, policy, about |

## 6. Permutation matrix

Every screen is exercised across these axes via the lab controls:

| Axis | Values |
| --- | --- |
| Alert phase | Normal · Yellow · Red |
| Clearance | Guest · Crew · Captain |
| Conflict | Clear · Active |

Dynamic accessors mean one definition renders all combinations. Clearance-gated panels
(e.g. guest read-only) use `visibleWhen`.

## 7. Running the POC

```
cd enterprise/runtime
npm run dev:lcars
# open http://localhost:5173/#/lab   (port may differ; check terminal)
```

The lab top bar switches **screen**, **alert phase**, **clearance**, and **conflict**.
Clicking station blocks in the left rail navigates between screens. The production
console (non-lab) remains at the root URL.

QA evidence: `runtime/lcars-web/qa-screenshots/poc-*.png`.

## 8. Decisions locked (2026-05-29)

1. **Pure SVG** — interactive controls are now native SVG (tappable `<g>` blocks), no
   `foreignObject`. The `custom`/foreignObject block remains only as a documented escape
   hatch. See `vector/SvgEnvironmentalControl.tsx` and the `svgcontrol` block kind.
2. **Effects stack** — Motion (`framer-motion`) for declarative motion + **GSAP** (free,
   `@gsap/react`) for advanced timelines/sweeps + **native SVG filters** for textures.
   - `vector/effects.tsx` — `<LcarsFilters/>` defs (`lcars-glow`, `lcars-nebula`,
     `lcars-nebula-red`, `lcars-energy`) + `NebulaField`, `EnergyField` backgrounds.
   - `vector/ScannerSweep.tsx` — GSAP timeline (sweep bar + rotating sensor wedge).
   - Performance guard: at most one slow animated filter per screen (Okuda motion law).
3. **No scroll** — fixed `viewBox` (1280×812); the whole screen scales to the viewport via
   `preserveAspectRatio="xMidYMid meet"`. There are no scrollbars on a starship.
4. **Per-department theming** — `themes.ts` maps each family to an accent palette, a default
   **effect**, and a default **layout template**:

   | Family | Accent | Effect | Layout |
   | --- | --- | --- | --- |
   | Ops — Command | amber | starfield | grid |
   | Engineering | amber/peach | energy (eng.engineering overrides to warpcore) | feature |
   | Environmental | ice-blue | none | console |
   | Tactical | peach/red | tactical (scanner) | feature |
   | Science | lavender | nebula | grid |
   | Conflict & Coexistence | amber/red | none | console |

   Layout templates (`LcarsScreen`): **grid** (2-col flow), **feature** (tall left feature
   panel + stacked right column), **console** (full-width stack). Screens override per-field.
5. **Code-first** — screen definitions live in `screens.tsx`. JSON/experience-pack
   externalization is a future step (the schema is already serializable except for the
   function-valued accessors, which would map to a small expression DSL).

## 9. Effect catalog

| Effect | Built with | Used by |
| --- | --- | --- |
| `starfield` | Motion (twinkle → warp streaks on Red) | Ops |
| `warpcore` | Motion (plasma pulses, intermix chambers) | Engineering |
| `nebula` | native SVG `feTurbulence` + `feColorMatrix` (SMIL drift) | Science |
| `energy` | Motion + `lcars-glow` filter (rising plasma in conduits) | Engineering (theme default) |
| `tactical` | **GSAP** timeline (scan bar + rotating wedge) + grid | Tactical |

## 10. Remaining open questions

1. **Content overflow at fixed scale** — with a fixed `viewBox`, very dense screens shrink.
   Do we cap content per screen, paginate via station sub-tabs, or allow the whole screen to
   scale down further? (No scrollbars either way.)
2. **Decor budget** — confirm the "one moving element at rest" ceiling per screen, and which
   effect each department gets at idle vs alert.
3. **JSON authoring** — when we externalize, function-valued accessors (value/tone/state)
   need a small expression DSL or a registry of named resolvers. Design that contract.
4. **Battle-bridge renderer parity** — same `ScreenDefinition`s feeding the physical console
   renderer; confirm the schema is renderer-agnostic.
5. **GSAP footprint** — bundle grew (~+90KB gzip from GSAP). Keep GSAP for advanced effects,
   or restrict to Motion + native filters to stay lean?
