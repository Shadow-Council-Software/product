# Unity POC — sanity check before committing

**Purpose:** See the **measured floor plan** and placeholder panel anchor in 3D. This is **not** Okuda-approved LCARS — it validates layout geometry and stack wiring only.

## What is real vs placeholder

| Element | Status |
|---------|--------|
| Room polygons from owner scan | **Real** (if `convert-layout-for-unity.mjs` ran) |
| Station/device positions | **Real** (layout JSON anchors) |
| central-hall highlight | **POC aid** — not final department color |
| HealthStrip quad + TextMesh | **Placeholder** — not experience pack |
| LCARS bezels / TRIAX | **Not in POC** |

If the POC looks wrong, fix **layout JSON** or scan interpretation — not the full sim-UX spec yet.

## Step 0 — Browser preview (optional, ~30 s)

No Unity required:

```bash
node enterprise/sim/scripts/convert-layout-for-unity.mjs
node enterprise/sim/poc/serve-preview.mjs
```

Open http://127.0.0.1:3099 — top-down floor plan from same data Unity uses.

## Step 1 — Prepare layout for Unity

```bash
node enterprise/sim/scripts/convert-layout-for-unity.mjs
```

Writes `unity/ENTERPRISE.HouseHarness/Assets/StreamingAssets/house-layout.json`.

## Step 2 — Start backend

```bash
# Terminal 1
cd enterprise/sim/bridge && npm run dev

# Terminal 2
cd enterprise/runtime
MATTER_ADAPTER=sim SIM_BRIDGE_URL=http://127.0.0.1:3002 npm run dev:engine

# Terminal 3 (optional — alert FSM test)
npm run dev:lcars
```

## Step 3 — Unity project (first time)

1. Unity Hub → **2022.3 LTS** → New **3D (URP or Built-in)** project.
2. Copy `enterprise/sim/unity/ENTERPRISE.HouseHarness/Assets/Scripts/**` into your project `Assets/Scripts/`.
3. Copy `Assets/StreamingAssets/house-layout.json` if not already generated in place.
4. **Edit → Project Settings → Player → Allow downloads over HTTP** → `Always Allowed` (localhost polling).

## Step 4 — One-scene POC (2 minutes)

1. Empty scene → create GameObject **`Harness`**.
2. Add components: **`HarnessAutoBootstrap`**, **`PocSceneDirector`**.
3. Press **Play**.

You should see:

- Floor tiles + cyan outlines for rooms
- **central-hall** warmer tint
- Thermostat marker at `[8.839, 1.45, 3.45]`
- HealthStrip placeholder quad on south wall of central-hall
- Legend overlay top-left

## Step 5 — Validate against reality

Walk the real house mentally (or with scan PDF open):

- Is kitchen-dining adjacent to central-hall?
- Does entry-hall sit on the south facade?
- Is thermostat room placement credible?

If not → update `onimurasame-residence-2026-05-24.json`, re-run convert script, Play again.

## Step 6 — Live FSM (optional)

With LCARS web open, escalate alert → HealthStrip label should change within ~1 s.

```bash
node enterprise/sim/scripts/verify-sprint1-proof.mjs
```

## Exit criteria for POC

Proceed to sim-UX / Okuda work only if:

1. Room adjacency matches your knowledge of the house
2. central-hall anchor feels like the right first plate wall
3. Scale feels plausible (17 m × 9.75 m envelope)

Otherwise: **fix layout, not shaders.**
