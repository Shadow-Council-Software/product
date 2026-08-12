# LCARS Production Gate — Episode-Ready Review

**Date:** 2026-05-29
**Surface:** `runtime/lcars-web` — ENTERPRISE Main Computer home operations console
**Gate question:** Is the LCARS experience ready to appear on screen in a real episode of Star Trek: TNG?
**Verdict:** **PASS (unanimous)** — cleared for broadcast.

## Supervising council (TNG production + canon authority)

| Member | Role | Final verdict |
| --- | --- | --- |
| Rick Berman | Executive Producer | PASS |
| Michael Piller | Showrunner / Head Writer | PASS |
| Herman Zimmerman | Production Designer | PASS |
| Michael Okuda | Scenic Art Supervisor (LCARS creator) | PASS |
| Denise Okuda | Scenic Artist / Video Playback | PASS |
| Doug Drexler | Illustrator / Graphic Artist | PASS |

## What changed in the production pass

The interface was rebuilt from a "sci-fi web UI" into an authentic LCARS graphic system:

1. **Geometry — elbow cage.** Replaced the decorative top banner with a true asymmetric
   L-sweep: a 200px left rail spine fused to a full-width top header via a concentric
   elbow (outer 64px / inner 30px, constant limb width). Content sits inside the cage.
2. **Buttons — pills killed.** Navigation is now rectangular LCARS blocks with a single
   rounded elbow corner, butted into the rail with uniform 4px black gutters. The full
   pill cap is reserved only for small preset chips.
3. **Substrate — black ground.** The cream/white field was eliminated. Black is the
   negative space; lit color blocks are the interface. Light is reserved for genuine
   readouts only.
4. **Flat color.** All `box-shadow`, `text-shadow`, and gradients deleted globally.
5. **Color is information.** A disciplined Okuda palette (amber, butterscotch, tan,
   lavender, ice-blue, inactive grey) assigned by function. Red is quarantined to
   alert/critical states only.
6. **Typography.** Condensed all-caps via an `Antonio` stack with `Arial Narrow`
   fallback; all numerics use `font-variant-numeric: tabular-nums`, right-aligned.
7. **Reference-code density.** `LCARS 47-FB-209`, `ENV-513 / OPS-001 / TAC-204 / ALR-009`,
   per-block menu codes, clearance levels `L1/L4/L9`, `CMD-77`, and the `1701-D` rail cap.
8. **In-universe language.** ENVIRONMENTAL / OPERATIONS / TACTICAL / ALERT STATUS;
   authorization reads as operator *standing*; command verbs "Engage Setpoint" /
   "Escalate Condition"; conflict modal reports a contradiction and awaits command.
9. **Motion discipline.** Idle chrome is static. The elbow plays a single one-shot fade
   on alert-phase entry. Red Alert is a hard step-end toggle at ~1.0s; Yellow is a steady
   glow. Hover "lift" removed. `prefers-reduced-motion` disables all blink.
10. **Setpoint geometry.** The 45° chamfer (non-canon) was replaced with an orthogonal
    rounded-corner rail block matching the elbow radius family.

## Responsiveness (root blocker closed)

The prior tablet-breakpoint defect — clearance controls overlapping and blocking the
menu tabs in the 721–1000px range — is fixed. At ≤1000px the rail collapses to a top
strip, the menu reflows to a horizontal row, and controls flow statically beneath the
banner so nothing overlaps. Independent browser QA confirmed PASS at 1440×900, 900×700,
768×1024, and 390×844, with every menu tab clickable.

QA evidence: `runtime/lcars-web/qa-screenshots/lcars-{desktop-1440,tablet-900,narrow-768,mobile-390}.png`

## Standing notes (polish, non-blocking)

- Keep reference-code format consistent per subsystem (`NN-LL-NNN`); never place type in
  the elbow curve (Okuda).
- Maintain uniform 4px gutters and quantize all radii to the 64/30 elbow family (Zimmerman).
- Verify the Antonio webfont actually ships; degrade only to condensed faces (Drexler).
- Wire discrete (~1–2s, no tweening) data-readout ticks once live sim telemetry lands —
  the only ambient motion permitted at rest (Denise Okuda).
- Stage validation: amber color-temp under the lighting rig; hero-shot legibility of the
  smallest codes at a 40-foot push-in; keep stardate editable per episode (Berman).
