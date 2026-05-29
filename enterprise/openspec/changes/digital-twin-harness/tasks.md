# Tasks: Digital twin house harness

Rack-free dev/demo path per [proposal.md](./proposal.md) and [design.md](./design.md). Sprint 2 software (tasks 1.3–7.4) is complete; tasks 1.1–1.2 remain hardware-blocked (#30/#31).

## 1. SimMatterAdapter (engine)

- [ ] 1.1 Implement `SimMatterAdapter` — HTTP client to Sim Bridge (`SIM_BRIDGE_URL`, default `http://127.0.0.1:3002`)
- [ ] 1.2 Map `env.nest.primary` from `/sim/devices` + spatial tick to MatterAdapterPort read/subscribe model
- [ ] 1.3 Route `writeAttribute` setpoint → `POST /sim/command/setpoint`; emit `attribute_updated` on bridge poll or WS if added
- [ ] 1.4 Extend `create-adapter.ts` with `AdapterKind` `sim`; boot fail-closed when bridge unreachable (mirror ohf behavior)
- [ ] 1.5 Document `MATTER_ADAPTER=sim` in `runtime/README.md` and `sim/README.md` quick-start parity

## 2. Verification (sim stack)

- [ ] 2.1 Contract test: setpoint via `sim` adapter updates Sim Bridge station temp
- [ ] 2.2 Contract test: `simulate-conflict` + Environmental panel still honors W-CT-05 under `MATTER_ADAPTER=sim`
- [ ] 2.3 Add `npm run dev:sim-stack` (or compose profile) — bridge + engine + lcars one command
- [ ] 2.4 `openspec validate --all --strict` passes

## 3. Matterport / Unity (spatial parity)

- [x] 3.1 Matterport ingest CLI (`enterprise/sim/matterport-ingest/`)
- [x] 3.2 House layout schema + example layout JSON
- [x] 3.3 Unity harness scaffold + `SimBridgeClient`, `HouseLayoutLoader`
- [ ] 3.4 Wire `MatterportMeshLoader` to TriLib (or documented fallback) for published OBJ from ingest
- [ ] 3.5 Alignment control points — operator workflow per `alignment-manifest.schema.json`; validate against survey layout
- [ ] 3.6 Order Matterpak when ready (procurement — not blocking 3.4–3.5 on example assets)

## 4. LLM visual aid loop

- [x] 4.1 Sim Bridge `/sim/visual-aid/*` routes + store
- [x] 4.2 Protocol doc [`sim/docs/LLM-VISUAL-AID.md`](../../../sim/docs/LLM-VISUAL-AID.md)
- [ ] 4.3 Unity capture POST wired in Play mode smoke (screenshot → latest aid)

## 5. OpenSpec & tracking

- [ ] 5.1 Delta specs under `changes/digital-twin-harness/specs/` for `matter-adapter` sim mode (if not synced)
- [ ] 5.2 GitHub issues for tasks 1.x–2.x (mirror sprint 2 pattern)
- [ ] 5.3 Archive change when 1.x–2.x and demo script complete; Matterport 3.4–3.6 may trail as follow-up
