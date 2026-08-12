# Internal Scripted Demo Runbook (Enterprise Digital Twin)

Purpose: run a deterministic internal demo for dashboards, menus, and simulation before user-facing walkthroughs.

Status: internal rehearsal ready, external demo not yet approved.

## Preflight

1. Verify scaffold gates:

```bash
node enterprise/sim/scripts/verify-sprint1-proof.mjs
```

Expected with runtime stack live: SIM-AC-01, C-SIM-04, C-SIM-15, and SIM-AC-02 all pass.

2. Start required services:

```bash
# Terminal 1
cd enterprise/sim/bridge && npm run dev

# Terminal 2
cd enterprise/runtime
MATTER_ADAPTER=sim SIM_BRIDGE_URL=http://127.0.0.1:3002 npm run dev:engine

# Terminal 3
npm run dev:lcars
```

3. Start layout studio (optional for edit segment):

```bash
cd enterprise/sim/layout-studio
npm run dev
```

4. Open Unity harness project and press Play:
`enterprise/sim/unity/ENTERPRISE.HouseHarness`

## Scripted Sequence (10 minutes)

### Segment 1 (00:00-01:00) Baseline
- Show central-hall panel anchor and default dashboard state.
- Call out hierarchy: state first, health strip second, controls third.

### Segment 2 (01:00-03:00) Routine transition
- Trigger normal state change in LCARS.
- Confirm Unity HealthStrip updates within one second (SIM-AC-02 target).

### Segment 3 (03:00-05:00) Data stress
- Introduce higher telemetry density.
- Keep only top-priority values visible in primary panel area.

### Segment 4 (05:00-07:00) Caution event
- Trigger a non-critical alert.
- Validate that motion and color semantics remain consistent.

### Segment 5 (07:00-08:30) Critical preemption
- Trigger critical path preemption.
- Demonstrate deterministic interruption and return path.

### Segment 6 (08:30-10:00) Recovery + closure
- Return to stable state.
- End with checklist evidence: parity, legibility, and motion law compliance.

## Okuda Pre-Review Verdict (Internal)

Outcome: PASS WITH CONDITIONS for internal scripted demo only.

Must-fix before user-facing demo:
- Complete `okudaAudit` artifacts (render target + captured frame).
- Enforce F-09/F-11 semantics across all scripted screens.
- Confirm 3m legibility in final camera framing.
- Remove any decorative/ambient motion not tied to state transitions.
- Resolve live runtime warning by running engine during demonstration.

## Show-to-User Readiness Checklist

- [ ] Full scripted run succeeds with no manual rescue actions.
- [x] `okudaAudit` updated to internal signed review state (`PASS_WITH_CONDITIONS`).
- [ ] F-09 motion law confirmed in runtime capture.
- [ ] F-11 decorative suspend behavior confirmed at Yellow+.
- [ ] Dashboard and Unity states remain synchronized through full script.
- [ ] Presenter fallback branch tested (service delay, timeout, restart).

## Evidence Capture

- Record one full run video with timestamps.
- Export visual aid latest frame and associated scenario ID.
- Save pass/fail notes in `enterprise/sim-ux-specification.md` revision log.
