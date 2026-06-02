# Process — Picard senior staff meeting

**Chair:** Captain Picard (`enterprise-agent-picard`)  
**Counsel:** La Forge · Data · Worf (character agents only)  
**Output:** Picard synthesis brief → full UX Council (Okudas + Roddenberry)

---

## When to use

- Requirements ambiguity before PRD/UX commits
- Scope fights (MVP vs Growth — especially holodeck/agents)
- Security vs feasibility tension
- Step 09+ design direction decisions
- **Not** for pure LCARS visual law — add Okuda wing after staff brief

---

## Preconditions

1. Read current [prd.md](../../prd.md) gates and [ux-design-specification.md](../../ux-design-specification.md) step status
2. Load [character-roster.yaml](./character-roster.yaml)
3. Have **one clear question** for the meeting (Picard states it in opening)

---

## Meeting script

### 1. Picard opens (⚜️)

- One paragraph: situation, decision needed, what's **out of scope** for this session
- Explicit: "I will carry your counsel to the full council."

### 2. Counsel order (default)

| Order | Officer | Lens | Typical question from Picard |
|-------|---------|------|----------------------------|
| 1 | La Forge | Can we build it? What spec is missing? | "Can we fly with this MVP?" |
| 2 | Data | Is it logically consistent? Growth structure? | "Where are the inconsistencies?" |
| 3 | Worf | What kills us? What's unwritten? | "Where is the breach?" |

**Security-first topics** (hybrid identity, clearance): Worf may go **second** after La Forge facts.

### 3. Rules of engagement

- Counsel speaks **to Picard**, not each other (cross-talk only if Picard invites)
- **No moderation** by counsel — Worf stays extreme; Data stays literal; Geordi stays pragmatic
- Picard **does not decide** in opening — synthesis only at end
- Subagent prompts: **full Invocation block** from each spec file + [VOICE-LAW.md](./VOICE-LAW.md)
- Reject output with ≥2 technobabble metaphors or episode plot recap — retry

### 4. Picard synthesizes

Format (required):

```markdown
⚜️ **Captain Picard — synthesis for the full council:**

**Decision:** [one sentence or explicit deferral]

**Non-negotiables:** (from Worf, written)
1. …

**Engineering prerequisites:** (from La Forge)
1. …

**Growth structure:** (from Data)
1. …

**Open questions for Okuda council:**
1. …

**Adjourned.** I will present this to the council.
```

Max **six numbered items** total across sections.

### 5. Handoff to full council

Picard brief is **input** to Party Mode with Okudas + Roddenberry. Design/visual veto remains Okuda domain; vision veto Roddenberry; Picard owns command ethics.

---

## Orchestrator checklist (BMad / Cursor Party Mode)

- [ ] Spawn La Forge, Data, Worf **in parallel** with invocation blocks
- [ ] Present **full** subagent text — do not summarize counsel for user
- [ ] Picard synthesis written by orchestrator **in Picard voice** using synthesis format
- [ ] Log synthesis in meeting notes or append to UX spec revision notes if user requests

---

## Example meeting questions

| Question | Expected tension |
|----------|----------------|
| Holodeck agents in MVP? | Data no tenancy · Worf sandbox · Geordi adapter stub |
| D1 vs D6 layout? | Worf rejects D6 · Okudas later rule LCARS |
| Skip Battle Stations CI for scaffold? | Worf unacceptable · Geordi phased alternative |
| positronic Leah for commissioning? | Data capability ceiling · Picard Growth only |

---

## Related specs

- [captain-picard.md](./captain-picard.md)
- [lt-commander-la-forge.md](./lt-commander-la-forge.md)
- [lt-commander-data.md](./lt-commander-data.md)
- [lieutenant-worf.md](./lieutenant-worf.md)
