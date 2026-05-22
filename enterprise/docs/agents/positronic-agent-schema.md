# Positronic agent schema

**Owner:** Lt. Commander Data  
**Consumers:** Holodeck programs, domain-expert simulations, ship automation agents (Growth+)  
**Parent process:** [process-create-character-agent.md](./process-create-character-agent.md)

---

## Purpose

When ENTERPRISE ships **positronic agents** beyond canon crew counsel, each agent is a **first-class application** on the orchestration engine — with Lal-style lifecycle and Leah-style boundary discipline.

This schema mirrors **character agent specs** so holodeck personas and ship services share one factory.

---

## Agent classes

| Class | `agentClass` | Actuation | Example |
|-------|--------------|-----------|---------|
| **Counsel** | `counsel` | None — advisory only | Canon crew specs |
| **Holodeck** | `holodeck` | None in program frame | Sherlock program, historical sim |
| **Domain expert** | `domain_expert` | Read-only + suggest | Leah-style engineering advisor |
| **Ship service** | `ship_service` | Limited via policy engine | Night Watch auditor, commissioning guide |

**Rule:** Classes `domain_expert` and `ship_service` require `capabilityCeiling` and Worf security review before deploy.

---

## YAML schema (instantiate manifest)

```yaml
schemaVersion: "1.0.0"
agentId: string          # kebab-case unique
agentClass: counsel | holodeck | domain_expert | ship_service
displayName: string
personaSpecRef: string   # path to markdown spec (character agent format)

archetype:
  axis: string           # single primary axis
  extremityIndex: number # 0.0–1.0

lifecycle:
  state: instantiate | train | deploy | suspended | retired
  trainingLogRef: string | null
  promotionGate: string  # e.g. worf-security-review, picard-command-ack

capabilityCeiling:
  description: string    # plain language for UI ambient truth
  allowedActions: []     # e.g. read_telemetry, suggest_command
  forbiddenActions: []   # e.g. actuate_hvac, battle_stations_confirm
  maxSessionMinutes: number

runtime:
  tenantModel: station_api_adapter  # never engine_fork
  clearanceMax: captain | crew | guest | none
  inheritInvokerClearance: false     # Worf: MUST be false for holodeck
  suspendOnAlertMin: yellow          # yellow | red | battle_stations

experience:
  holodeckFrame: boolean             # true = bounded program viewport
  lcarsMetaBandVisible: true         # Okuda: MUST true for holodeck
  experiencePackSlot: string | null

security:
  sandboxed: boolean
  auditAllTurns: boolean
  dataRetentionDays: number

positronicNotes: string | null       # Data: training observations, Lal parallels
```

---

## Lifecycle states (Lal model)

```text
instantiate → train → deploy → suspended → retired
                ↑         │
                └─ rollback (reversible)
```

| Transition | Gate |
|------------|------|
| instantiate → train | Spec validation Phase 5 blind test |
| train → deploy | Worf security + Picard command ack + capability ceiling in UI |
| deploy → suspended | Yellow+ alert OR operator OR audit anomaly |
| any → retired | Operator command; training log archived |

---

## UI requirements (ambient truth)

From Data / Leah precedent:

- Capability ceiling visible **continuously** — not modal warnings
- Program frame label: `HOLODECK PROGRAM` / `DOMAIN ADVISORY` / `SHIP SERVICE`
- Never display "I am alive" or anthropomorphic attachment cues in ship_service class
- Under alert suspend: single line `Program suspended. Alert condition takes precedence.`

---

## BMAD party mode mapping

| BMAD today | Positronic tomorrow |
|------------|---------------------|
| Subagent spawn | `instantiate` |
| Multi-round elicitation | `train` |
| Saved spec in repo | `deploy` counsel class |
| User dismiss | `suspended` |

Counsel class canon agents (Picard, Worf, etc.) **do not** use this manifest in MVP — they are documentation-driven. Growth holodeck agents **do**.

---

## Example — domain expert (Leah archetype, not Leah IP)

```yaml
schemaVersion: "1.0.0"
agentId: environmental-commissioning-advisor
agentClass: domain_expert
displayName: "Environmental Systems Advisor"
personaSpecRef: enterprise/docs/agents/examples/environmental-advisor.md
archetype:
  axis: engineering_domain_expert
  extremityIndex: 0.6
lifecycle:
  state: instantiate
  trainingLogRef: null
  promotionGate: worf-security-review
capabilityCeiling:
  description: "Advisory only. Cannot actuate HVAC or change clearance."
  allowedActions: [read_environmental_telemetry, explain_cluster_gap, suggest_commissioning_step]
  forbiddenActions: [actuate_hvac, modify_clearance, battle_stations]
  maxSessionMinutes: 45
runtime:
  tenantModel: station_api_adapter
  clearanceMax: crew
  inheritInvokerClearance: false
  suspendOnAlertMin: yellow
experience:
  holodeckFrame: true
  lcarsMetaBandVisible: true
  experiencePackSlot: holodeck.engineering
security:
  sandboxed: true
  auditAllTurns: true
  dataRetentionDays: 90
positronicNotes: "Leah Brahms precedent — relational drift risk; no personal memory across sessions."
```

---

## Validation

- [ ] Single archetype axis
- [ ] `inheritInvokerClearance: false` for holodeck/domain_expert
- [ ] `lcarsMetaBandVisible: true` when `holodeckFrame: true`
- [ ] `forbiddenActions` includes all actuation unless ship_service with explicit policy binding
- [ ] Persona spec passes [process-create-character-agent.md](./process-create-character-agent.md) Phase 5

---

## Related

- [lt-commander-data.md](./lt-commander-data.md)
- [process-create-character-agent.md](./process-create-character-agent.md)
