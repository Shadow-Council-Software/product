# Collaborative layout — 100% real-world parity (NON-NEGOTIABLE)

## Why the map was wrong

Your file `Scanned_20260524-1944.pdf` is a **mortgage site survey** (9 Coralberry Drive — lot boundaries, building footprint, driveway, deck). It is **not** an interior floor plan.

A prior pass **invented** kitchen, bedrooms, and halls from dimension guesses. That cannot produce parity. **Interior geometry requires interior evidence.**

---

## Two-layer model (both required)

| Layer | Source | What it gives |
|-------|--------|----------------|
| **Site** | Mortgage survey PDF | Lot, building footprint (~57′×32′), front street (Coralberry Dr), setbacks, driveway |
| **Interior** | *You + us* | Room polygons, doors, thermostat wall, Nest locations |

Unity 3D = site envelope + interior rooms + device anchors. **No layer may be hallucinated.**

---

## How we work together (session protocol)

### Phase A — Lock the exterior (one session)

1. Open **Layout Studio** → http://127.0.0.1:3098 (already running on your machine when agent starts it)
2. Align survey underlay to building footprint rectangle (sliders until outline matches)
3. **You confirm:** front door faces Coralberry Drive? north = rear deck?
4. Save alignment + envelope only → **Compile**

### Phase B — Interior room-by-room (repeat per room)

For each room, **you provide one of:**

- Interior floor plan scan (ideal — upload to `layouts/sources/`)
- Photo of room + “this wall is X feet”
- Walkthrough: “Standing in entry, kitchen is left, …”

**Agent draws** polygon in Layout Studio → **you say** “yes / shift north 2 ft / wrong room name” → **Save floor**.

Order we recommend:

1. Entry / front door zone  
2. Kitchen + dining (where thermostat actually is)  
3. Living room  
4. Halls / circulation  
5. Bedrooms + baths  
6. Office, mechanical, closets  

### Phase C — Device anchors (verify in real house)

| Device | Must match |
|--------|------------|
| Nest thermostat | Room + wall you identified |
| Doorbell | Front door on survey |
| Basement Nest | After basement floor traced |

### Phase D — Compile to 3D

**Compile → Unity** only after you approve main level room list. Unity extrudes **your** polygons, not guesses.

---

## What to send next (pick any)

1. **Interior floor plan** — photo/PDF of room layout (even hand-sketched with dimensions)  
2. **Confirm/correct:** 9 Coralberry Drive, front = Coralberry, thermostat room name  
3. **Photo set** — one per main room, wide angle from doorway  
4. **Start Phase B now** — describe entry + kitchen adjacency in plain language  

---

## Evidence folder

```text
enterprise/sim/layouts/sources/
  Scanned_20260524-1944.pdf      ← site survey (have)
  Scanned_20260524-1944.thumb.png
  manifest.json
  photos/                        ← add room photos here
  interior/                      ← add interior plan PDFs here
```

---

## Rules (non-negotiable)

- Empty room list beats wrong room list  
- Orange **gap** zones only until you name the room  
- No “compile to Unity” for interior until **you** approve the room trace  
- Agent runs servers, merge, compile — you validate against real house  
