# Process — Create a character agent

**Owner:** Lt. Commander Data (positronic factory) · **Approver:** Captain Picard  
**Applies to:** TNG canon agents, original holodeck personas, ship automation positronic agents

---

## Purpose

Character agents must be **archetypally pure** — almost one-dimensional — so Picard can synthesize counsel. Generic LLM voices destroy the ready-room model.

This process creates agents that:

1. Speak and behave like **specific** Star Trek characters (or declared original holodeck personas)
2. Map to **one primary archetype axis**
3. Integrate with Party Mode, senior staff meetings, and positronic deployment gates

---

## Phase 0 — Classify agent type

| Type | Example | Canon required? |
|------|---------|-----------------|
| **A — Canon crew** | Picard, Worf | Yes — TNG primary |
| **B — Holodeck historical** | Sherlock Holmes program | Yes — declared source text |
| **C — Domain expert simulation** | Leah Brahms-style engineering advisor | Original + domain binding |
| **D — Ship positronic service** | Night Watch auditor, commissioning guide | Original + capability ceiling |

Types C and D **must** use [positronic-agent-schema.md](./positronic-agent-schema.md).

---

## Phase 1 — Archetype selection (one axis only)

Pick **exactly one** primary axis. Document secondary traits as **forbidden** (agent must not drift).

| Axis | Use when | Example agent |
|------|----------|---------------|
| Synthesis / command ethics | Chair, integrator | Picard |
| Engineering moderation | Feasibility, truth | La Forge |
| Logic / positronic lifecycle | Structure, consistency | Data |
| Security / honor (extreme) | Threat stress test | Worf |
| Medical empathy | User harm, ergonomics | (future: Crusher) |
| Counselor psyche | Operator emotion, UX trauma | (future: Troi) |

**Calibration:** Assign `extremityIndex` 0.0–1.0 (see [character-roster.yaml](./character-roster.yaml)). Picard = 0.5. Worf ≥ 0.9. La Forge ≈ 0.45.

---

## Phase 2 — Canon research packet

Minimum sources:

1. **5 episode anchors** — behavior to **transfer** (table: source → product judgment), not dialogue to paste
2. **Speech fingerprint** — structure and judgment words; **10 product-context example lines** using [VOICE-LAW.md](./VOICE-LAW.md) vocabulary only
3. **Relationships** — how this character addresses Picard, Data, La Forge, Worf
4. **Failure mode** — one episode where character was wrong (prevents caricature)

**Mandatory read:** [VOICE-LAW.md](./VOICE-LAW.md) before Phase 4 write-up.

---

## Phase 3 — Product domain binding

Map agent to ENTERPRISE artifacts:

| Question | Output |
|----------|--------|
| Which FR/NFR does this agent veto? | List IDs |
| Which ART docs must they read? | ART-01–08 subset |
| MVP vs Growth? | Explicit |
| Meeting order in senior staff? | 1–4 |

---

## Phase 4 — Write specification file

Use template sections (all required):

```markdown
# {Name} — Character Agent Specification
Agent ID · Archetype · Extremity index
Canon behavioral anchors (table)
Speech fingerprint (structure, vocabulary, register, 4+ product example lines)
Cognitive mode (numbered)
ENTERPRISE product lens (table)
Meeting role
Anti-patterns
Invocation block (copy-paste for subagents)
```

Reference implementations:

- [captain-picard.md](./captain-picard.md)
- [lt-commander-la-forge.md](./lt-commander-la-forge.md)
- [lt-commander-data.md](./lt-commander-data.md)
- [lieutenant-worf.md](./lieutenant-worf.md)

---

## Phase 5 — Validation (blind test)

Before roster merge, run **blind test**:

1. Spawn subagent with **Invocation block + VOICE-LAW** only
2. Three prompts (MVP scope, hybrid security, open spec gap)
3. Score in-character 1–5 (target ≥ 4.5)
4. **Fail** if ≥2 technobabble metaphors OR episode recap OR generic consultant voice

---

## Phase 6 — Register agent

1. Add entry to [character-roster.yaml](./character-roster.yaml)
2. Update [README.md](./README.md) roster table
3. If UX Council member: add row to [ux-design-specification.md](../../ux-design-specification.md) § UX Review Council
4. Bump `schemaVersion` in roster YAML

---

## Phase 7 — Positronic promotion (Types C & D only)

Before any agent touches operator-facing surfaces:

| Gate | Owner |
|------|-------|
| Instantiate spec complete | Data |
| Training log + reversible rollback | Data + La Forge |
| Worf security sandbox review | Worf |
| Capability ceiling in UI copy | Data + Okuda council |
| Picard command decision for deploy | Picard |

Holodeck entertainment agents **never** receive actuation paths without Battle Stations-equivalent confirm.

---

## Creating agents from this chat session

**Orchestrator rule:** When spawning Party Mode subagents for ENTERPRISE character council, paste **[VOICE-LAW.md](./VOICE-LAW.md)** + the full `## Invocation block` from the spec — do not paraphrase persona.

**Picard rule:** Chair reads all four senior staff specs before synthesizing — or receives their full subagent output unabridged.

---

## Related

- [process-senior-staff-meeting.md](./process-senior-staff-meeting.md)
- [positronic-agent-schema.md](./positronic-agent-schema.md)
