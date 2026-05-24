# W0 Spike — Operator Checklist (ART-01 §6)

**Purpose:** Minimal hardware proof before `architecture.md` sign-off (D-01).  
**Normative source:** [ART-01 §6](../docs/artifacts/art-01-coexistence-pack-v1.md)  
**Record results in:** `w0-results.yaml` (copy from `w0-results.template.yaml`)

**Golden device:** Nest Learning Thermostat 4th gen on Google Home fabric (Hybrid home).

---

## Pre-flight (all steps)

| # | Check | Pass | Operator initials |
|---|-------|------|-------------------|
| P-1 | Nest visible and controllable in Google Home app | ☐ | |
| P-2 | Nest Hub (or Thread BR) online on same LAN as rack | ☐ | |
| P-3 | Sidecar host is **Linux rack** (not Docker Desktop Mac for Thread/mDNS) | ☐ | |
| P-4 | Nest setup QR / manual code photographed and stored offline | ☐ | |
| P-5 | Google Home admin access confirmed | ☐ | |

---

## W0-1 — Sidecar up

**Host:** Operator Linux rack (same LAN as Nest).

```bash
cd enterprise/spike/w0
mkdir -p data
docker compose up -d
docker compose logs -f matter-server   # wait for WS ready
```

| # | Check | Pass | Notes |
|---|-------|------|-------|
| W0-1a | Container running | ☐ | |
| W0-1b | `network_mode: host` in compose | ☐ | |
| W0-1c | WS accepts connection | ☐ | `npm install && npm run verify` → W0-1 PASS |

**Mac dev only:** W0-1c may pass locally; **W0-2 through W0-4 require rack + Nest on LAN.**

---

## W0-2 — Path A (Google-first share)

Follow [ART-01 §4](../docs/artifacts/art-01-coexistence-pack-v1.md) — **do not factory reset** unless intentional.

### Procedure (A1 preferred)

1. Google Home → thermostat → **Device settings**
2. **Linked Matter apps & services** / **Share device**
3. Complete share to Matter Server / ENTERPRISE sidecar when prompted
4. Run `npm run verify` — expect **≥1 node** in output

### T1-01 verification (§4.3)

| Step | Action | Pass | Notes |
|------|--------|------|-------|
| V-A1 | Google Home still controls thermostat | ☐ | |
| V-A2 | Manage fabrics / linked apps lists Matter partner | ☐ | |
| V-A3 | Sidecar `get_nodes` shows Nest (`npm run verify`) | ☐ | Record `node_id`: ______ |
| V-A4 | *(Engine registry — skip for W0; note N/A)* | N/A | Sprint 1 |
| V-A5 | *(LCARS tile — skip for W0)* | N/A | Sprint 1 |
| V-A6 | Read temp via sidecar; compare Google app | ☐ | See W0-4 |

**W0-2 PASS:** V-A1, V-A2, V-A3 pass; Google fabric **not** revoked.

**If Path A fails:** Document symptoms; try Path B **once** per ART-01 §5 — Path B failure alone is **not** W0 blocker if Path A later passes.

---

## W0-3 — Subscription event

After W0-2, with sidecar running:

```bash
npm run verify:watch
```

While script waits **60 seconds**:

1. Change setpoint **1°F** in Google Home **or** wait for ambient temp drift
2. Confirm console prints `attribute_updated`

| # | Check | Pass | Event timestamp |
|---|-------|------|-----------------|
| W0-3 | `attribute_updated` within 60s of physical change | ☐ | |

---

## W0-4 — Read attribute

From `npm run verify` output:

| # | Check | Pass | Values |
|---|-------|------|--------|
| W0-4a | `read_attribute` succeeds on Thermostat path | ☐ | Sidecar raw: ______ |
| W0-4b | Converted temp within **±1°F** of Google app | ☐ | Google: ______ °F |

If all candidate paths fail, run `get_node` via sidecar WS and record cluster list in `w0-results.yaml` appendix.

---

## Sign-off

| Gate | Criteria | Pass |
|------|----------|------|
| **W0 complete** | W0-1 + W0-2 + W0-3 + W0-4 all PASS | ☐ |
| **Architecture unblock** | Copy signed `w0-results.yaml` to `docs/fixtures/` | ☐ |

**Operator signature:** __________________ **Date:** __________

**Next step:** Resume `[CA] Create Architecture` at Step 03 (starter evaluation) with W0 certificate as input.

---

## Failure recovery (quick)

| Symptom | Action |
|---------|--------|
| WS connect refused | `docker compose ps`; check port 5580; host networking |
| Zero nodes after share | Re-read ART-01 §4.2 A1; confirm Matter linked in Google |
| Google lost thermostat | **Stop** — do not factory reset; ART-01 §8 |
| read_attribute all fail | Record `get_node` dump; attribute map gap for architecture |
