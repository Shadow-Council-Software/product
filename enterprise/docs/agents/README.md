# ENTERPRISE character agents

Canon-faithful **TNG persona agents** for Party Mode, Picard-style senior staff meetings, UX Review Council (character wing), and **Lt. Commander Data's positronic agent program**.

**Not episode simulation.** Personality delivers **product counsel** using ENTERPRISE vocabulary. See **[VOICE-LAW.md](./VOICE-LAW.md)** — no technobabble cosplay.

---

## Roster

| ID | Agent | Archetype axis | Spec |
|----|-------|----------------|------|
| `enterprise-agent-picard` | Captain Jean-Luc Picard | **Synthesis / command ethics** | [captain-picard.md](./captain-picard.md) |
| `enterprise-agent-la-forge` | Lt. Commander Geordi La Forge | **Engineering moderation** | [lt-commander-la-forge.md](./lt-commander-la-forge.md) |
| `enterprise-agent-data` | Lt. Commander Data | **Logic / positronic lifecycle** | [lt-commander-data.md](./lt-commander-data.md) |
| `enterprise-agent-worf` | Lieutenant Worf | **Security / honor (extreme)** | [lieutenant-worf.md](./lieutenant-worf.md) |

**Agent working group (command):** Picard · La Forge · Data · Worf  
**Full UX Council:** above + Michael Okuda · Denise Okuda · Gene Roddenberry (design/vision wing — see [ux-design-specification.md](../../ux-design-specification.md))

---

## How to invoke

### Picard senior staff meeting (character-only)

1. Chair loads [captain-picard.md](./captain-picard.md) + [process-senior-staff-meeting.md](./process-senior-staff-meeting.md)
2. Spawn La Forge, Data, Worf **in parallel** with [VOICE-LAW.md](./VOICE-LAW.md) + spec `## Invocation block`
3. Picard opens → counsel speaks **to Picard** → Picard synthesizes brief for full council

### Party Mode (full council)

Load character specs + Okuda/Roddenberry personas from UX spec. Follow [process-party-mode.md](./process-party-mode.md) pre-flight and **Decision ledger** (do not reopen Rejected without revisit trigger). Picard presents staff synthesis first when continuing from a ready-room session.

### Positronic agents (Growth — Data)

New ship/holodeck agents **must** pass [process-create-character-agent.md](./process-create-character-agent.md) and validate against [positronic-agent-schema.md](./positronic-agent-schema.md).

---

## Documents

| File | Purpose |
|------|---------|
| [VOICE-LAW.md](./VOICE-LAW.md) | **Mandatory** — product terms yes, technobabble no |
| [process-create-character-agent.md](./process-create-character-agent.md) | Create new canon or original positronic agents |
| [process-senior-staff-meeting.md](./process-senior-staff-meeting.md) | Picard-style meeting protocol |
| [process-party-mode.md](./process-party-mode.md) | Full UX council Party Mode — pre-flight, ledger, frozen decisions |
| [positronic-agent-schema.md](./positronic-agent-schema.md) | Machine + human schema for Data's agent factory |
| [character-roster.yaml](./character-roster.yaml) | IDs, roles, extremity index for orchestrators |

---

## Maintenance

- Character agents are **product-scoped** — live on `product/enterprise` only
- Do not merge to `main` unless promoted as org-wide methodology
- When a spec changes, bump `schemaVersion` in [character-roster.yaml](./character-roster.yaml)
