# Process — UX Party Mode

**Owner:** UX Review Council (orchestrator + Picard chair)  
**Applies to:** BMad UX workflow Steps 02–14, PRD/UX amendments, design direction and component councils  
**Companion:** [process-senior-staff-meeting.md](./process-senior-staff-meeting.md) · [VOICE-LAW.md](./VOICE-LAW.md)

---

## Objective

Run **multi-perspective council rounds** without repeating debates, losing agent counsel, or re-litigating frozen decisions. Party Mode produces **decisions, conditions, and a ledger** — not disposable chat.

**Canonical cautionary tale:** Step 09 D3 — three rounds because `chromatic` meant fill-only to some agents and identity to others. **TRIAX** (label / rail / fill) resolved a category error, not a values fight.

---

## First principles

1. **Veto domains must bind to artifacts** — vision, LCARS law, security, feasibility, structure → `prd.md`, UX spec, certificate, `architecture.md`.  
2. **One decision per round** — one binary question, one contested item.  
3. **Counsel must be durable** — Accepted / Rejected / Deferred ledger; cite IDs, do not re-derive.  
4. **Alert beats palette on collision** — behavior-first is law (Okuda), not preference.  
5. **`C` save is the decision** — Party Mode without `C` is research, not product state.

---

## Decision hierarchy

When sources conflict, apply in order:

1. **Frozen F-XX** (unless operator waiver logged)  
2. **Ledger Accepted A-XX**  
3. **Deferred D-XX** (work recorded; does not block unrelated save)  
4. **Open council debate** (requires pre-flight + spawn)

---

## Council need test

Skip Party Mode (`P`) when **all three** are true:

1. Answer exists in ledger **Accepted** (cite A-XX).  
2. Topic is not **Frozen** without waiver.  
3. Binary question is already pass/fail decidable from pre-flight + ledger.

If any false → run pre-flight; spawn **minimum viable council** only.

---

## When to use

| Use Party Mode (`P`) | Use senior staff first | Skip Party Mode |
|----------------------|------------------------|-----------------|
| Step 09+ design directions | Requirements ambiguity, scope fights | Operator explicitly waives council (log waiver) |
| Component strategy, UX patterns | Security vs feasibility before Okuda visual | Pure copy-edit with no new surfaces |
| Reconciliation after PASS WITH CONDITIONS | Holodeck/agents vs MVP | Council need test passes |
| Light retrospective after ≥2 rounds | — | — |

**Sequence:** Character-only [senior staff](./process-senior-staff-meeting.md) → Picard brief → **full council** (minimum viable roster below).

---

## Minimum viable council (MVC)

| Decision type | Spawn | Skip unless touched |
|---------------|-------|---------------------|
| LCARS layout / motion / color law | Michael + Denise | Worf |
| Captain-not-passenger / density | Roddenberry + Picard | Data |
| Security / clearance / audit | Worf + Picard | Okudas |
| Build feasibility / phasing | La Forge | Roddenberry |
| Schema / IDs / Growth handoff | Data + Picard | Denise |
| Step 09 design directions | Okudas + Roddenberry + Picard + La Forge; +Worf if chrome | Full 7 if holodeck/agents |
| Reconciliation (name the model) | Michael + Denise + Roddenberry | Others unless invited |
| Token-only / alias change | La Forge + Michael | Worf, Data, full council |

---

## Pre-flight (mandatory before spawn)

Orchestrator publishes this block **in the user-visible thread** before any subagent runs.

### 1. Operator assumption sentence (Roddenberry)

One line, agreed before visuals:

> *This panel serves a trained crew member who owns their station.*

Adapt per step; do not skip.

### 2. Binary decision question (Denise)

Pass/fail shape, not a topic:

> *Does this direction pass council sign-off for Step 09 save?*

### 3. Conflict map (Michael)

| Settled | Contested |
|---------|-----------|
| List from [Decision ledger](#decision-ledger) **Accepted** + **Frozen F-XX** | Items still open this round (max **one**) |

Do not spawn until contested items are scoped to **one** reconciliation target.

### 4. Engineering prereq report (La Forge)

| Artifact | Status |
|----------|--------|
| [architecture.md](../../architecture.md) | `exists` \| `draft` \| **blocker** |
| Matter adapter interface | `locked` \| `open` |
| Certificate fixture | `path` + last gate |
| Target UX step | `step-NN` + `stepsCompleted` |

### 5. NFR draft pointer (Worf)

Link PRD NFR block or list **Worf gap IDs** (not visual debate): D-06, D-07, D-08, D-10, D-11, D-16.

### 6. Namespace rule (Data)

- Design directions: **`D1`–`D6`**
- Council vote options: **`OPT-A`**, **`OPT-B`**, … — never bare `A`/`D` in synthesis
- Named models: **`TRIAX`**, **`D1+D2`** — prefer names over overloaded letters
- **Glossary lock:** `TRIAX` = Three-Channel Departmental Persistence (label/rail/fill) — **not** Scan→Command→Verified

### 7. Surface contract (when visuals/components involved)

```yaml
targetSurface: ops.overview | env.subsystem | chrome.vessel | tile.content
channels: [label, rail, fill]   # TRIAX when department identity
chromeExclusion: [chrome.session, chrome.vessel, BattleStationsConfirm]
fsmBinding: green | yellow | red_alert | battle_stations
```

### 8. Ledger snapshot (orchestrator)

Paste for spawn prompts (step-scoped, ≤30 lines):

- **Accepted** IDs relevant to this step  
- **Rejected** IDs — do not reopen  
- **Deferred** IDs — cite only; do not block debate on unrelated items

---

## Round types

### Standard council

1. Picard opens (staff brief if continuing from ready room)
2. Spawn MVC agents **in parallel** — [spawn template](#orchestrator-spawn-template)
3. Present **full** subagent text — no summary substitution; **retry once** on summary-only; then `[ORCHESTRATOR RECONSTRUCTED]` from specs + ledger IDs
4. Picard synthesis + council sign-off: `PASS | PASS WITH CONDITIONS | BLOCKED`
5. Remind **`C`** save + ledger update if PASS

### Reconciliation round

Trigger when:

- PASS WITH CONDITIONS with **conflicting mechanisms**
- Same word, two meanings across counsel
- User asks to "bring tensions down"

Goal: **one named model** (e.g. TRIAX) + FSM table — not compromise prose.

### Light retrospective

Trigger when: ≥2 Party Mode rounds on same step, or PASS WITH CONDITIONS.

Each voice: one lesson → one workflow fix. Append to [Lessons Learned Registry](#lessons-learned-registry) on save.

---

## Failure signatures — stop and reconcile

| Signal | Action |
|--------|--------|
| Michael BLOCKED + Roddenberry PASS on same element | Reconciliation round; decompose channels |
| Worf "unacceptable" on prose-only policy | Defer visual save; add FR/NFR draft task (D-XX) |
| Data reports missing `targetSurface` | Halt spawn; write surface contract |
| `OPT-*` and `D*` in same paragraph | Rewrite synthesis; fix namespace |
| Subagent summary-only twice | `[ORCHESTRATOR RECONSTRUCTED]`; log incident **I-XX** |
| Reopening ledger **Rejected** without waiver | Halt; require `Waiver: R-XX \| reason \| date` |
| ≥3 `P` rounds on same step without `C` | Offer reconciliation, retro, or **`C`** |

---

## Failure Mode Analysis

| Component | Failure mode | Effect | Prevention | Detection |
|-----------|--------------|--------|------------|-----------|
| Pre-flight | Skipped | Moving-target debate | Halt until § Pre-flight published | No binary question in thread |
| Pre-flight | All items contested | Re-litigate F-XX | Max 1 contested; rest from ledger | Conflict map empty |
| Senior staff | Skipped on scope/security | Okuda debates feasibility | Staff before full council Step 09+ | Worf/La Forge cite missing specs first |
| Spawn | No ledger snapshot | Re-debate Rejected | §8 ledger snapshot in prompt | Counsel reproposes R-XX |
| Spawn | No OUTPUT CONTRACT | Summary-only counsel | [Spawn template](#orchestrator-spawn-template) | Summary without `{icon} **Name:**` |
| Spawn | Context >800 words | Shallow answers | Path refs + pre-flight only | Questions on settled A-XX |
| Subagent | Summary-only ×2 | Hallucination on reconstruct | Retry once; then reconstruct + cite | Second summary |
| Orchestrator | Summarizes counsel | Agent work lost | Full text per agent section | No unabridged speeches |
| Synthesis | CONDITIONS + conflicting mechanisms | Round 4+ | Reconciliation + named model | BLOCKED + PASS same element |
| Synthesis | No ledger IDs | Rework next session | Cite A/R/D/F in synthesis | Verbatim repeat of prior round |
| Ledger | Not updated on `C` | Token waste / rework | Mandatory append on save | `lastUpdated` stale vs step save |
| Ledger | Delete Rejected row | Pitfall returns | Supersede only | Missing R-XX in doc |
| `C` save | PASS but no save | Decisions evaporate | Post-PASS **`C`** menu | stepsCompleted gap |
| Roster | Full council on token tweak | Token burn | MVC table | 7 agents for alias change |
| Certificate | TRIAX without D-09 | CI fail | Merge blocker D-09 | suppressed tokens missing |

### Severity (respond first)

| Rank | Failure |
|------|---------|
| **S1** | Summary-only + reconstruction |
| **S2** | No ledger update on `C` |
| **S3** | Pre-flight skipped |
| **S4** | CONDITIONS without reconciliation |
| **S5** | `P` without `C` |

### Detection checklist (orchestrator, before presenting counsel)

- [ ] Each agent block starts with `{icon} **Name:**`  
- [ ] No counsel reproposes **Rejected** without waiver  
- [ ] Synthesis cites ≥1 ledger ID if decision repeats prior work  
- [ ] Named model present if reconciliation ran  
- [ ] **`C`** offered if council PASS  

### Incident log (append to Process notes on S1–S5)

| ID | Date | Severity | What happened | Fix applied |
|----|------|----------|---------------|-------------|
| I-01 | 2026-05-19 | S1 | Subagents returned summaries; orchestrator reconstructed | OUTPUT CONTRACT + retry rule |

---

## Orchestrator spawn template

Fixed block order — copy per agent:

```text
1. ROLE
You are {Name}, {role} on ENTERPRISE Main Computer.

2. VOICE / PERSONA
{Invocation block from spec OR Okuda/Roddenberry lens}
Read enterprise/docs/agents/VOICE-LAW.md for character agents.

3. OUTPUT CONTRACT (non-negotiable)
- Output ONLY your in-character council speech.
- Start with: {icon} **{Name}:**
- Length: {min}-{max} words.
- No meta. No "standing by". No options menu. Do NOT use tools.
- If unable: UNABLE: {one line reason}

4. LEDGER SNAPSHOT
Frozen: {F-XX list for step}
Accepted: {A-XX — do not re-debate}
Rejected: {R-XX — do not reopen without waiver}
Deferred: {D-XX — cite only}

5. ROUND CONTEXT (≤150 words)
Operator assumption: {sentence}
Binary question: {pass/fail question}
Contested only: {one item}

6. FORBIDDEN
- Summaries instead of speech
- Reopening R-XX / F-XX without waiver
- Conflating TRIAX with Scan→Command→Verified
- Bare OPT-A vs D4 in same answer
```

### Retry prompt (summary-only first response)

```text
You returned a summary, not counsel. Violates OUTPUT CONTRACT.
Output ONLY your complete speech now. Start with: {icon} **{Name}:**
No meta. {word count} words.
```

---

## Frozen decisions register

**Do not re-litigate** in Steps 10–14 without operator waiver in UX spec revision notes.

| ID | Decision | Locked at |
|----|----------|-----------|
| F-01 | MVP acceptance: Ops, Environmental, alert FSM, Night Watch Lite — **no holodeck/agent tenancy** | Senior staff + council |
| F-02 | Step 09 layout: **D1 Ops Command + D2 Spare Captain's Chair hybrid** | Council Step 09 |
| F-03 | **D5 Hybrid Honest** merged into `HealthStrip` posture chrome — not separate agent frame | Council Step 09 |
| F-04 | Department identity: **TRIAX** (label / rail / fill) — not single "chromatic band" | Reconciliation Step 09 |
| F-05 | Custom **Okuda LCARS** design system — not Material/Chakra/shadcn as visual foundation | Step 05–06 |
| F-06 | Matter server **integrate-not-fork**; HA Lovelace **not** primary UI | Step 05 |
| F-07 | Hybrid CI gate **A′+B′+** on operator routes | Step 06 |
| F-08 | Core loop **Scan → Command → Verified**; peak = `Verified. [Deck] [parameter] stable.` | Step 07 |
| F-09 | Alert motion law: animated-red **Red Alert only**; static-red **Battle Stations only** | Step 08 + certificate |
| F-10 | **NFR-UX6** Battle Stations confirm gate inviolable | PRD + council |
| F-11 | Positronic agents **Growth only**; holodeck UI **suspend Yellow+** | Staff + Data |
| F-12 | Character agents: [VOICE-LAW.md](./VOICE-LAW.md) — product terms, no technobabble cosplay | Agent program |

---

## Decision ledger

**Purpose:** Preserve agent work; avoid rework, hallucination, and token waste. Orchestrator **updates this section** when user selects **`C`** on a UX step or when council records a new rejected/deferred item.

**Revisit rule:** **Rejected** / **Deferred** return only when **Revisit when** is true — scoped Party Mode citing ledger ID.

### Accepted (ship unless superseded)

| ID | Decision | Rationale (one line) | Source step |
|----|----------|----------------------|-------------|
| A-01 | D1+D2 hybrid as primary layout; D2 = typography + Red Alert sparse density | Captain-not-passenger + 2s read | Step 09 |
| A-02 | TRIAX FSM table (label/rail/fill per alert state) | Resolved D3 tension | Step 09 reconciliation |
| A-03 | D5 posture strip as ship status in `HealthStrip` | Honest coexistence without Google watermark | Step 09 |
| A-04 | Sprint 1 composites: `BattleStationsConfirm`, `ClearanceOverlay` | Security before screen-layer clearance | Senior staff |
| A-05 | 12 LCARS components phased (4 + 8 sprints) | Solo-builder feasible | Step 05–06 |
| A-06 | Certificate [visual-foundation-freeze.certificate.yaml](../fixtures/visual-foundation-freeze.certificate.yaml) for alert/Ops/Env MVP | DC-7 gate | Step 08 |
| A-07 | Step 09 saved — D1+D2+TRIAX+D5→HealthStrip; [ux-design-directions.html](../../ux-design-directions.html) | Council lock | Step 09 `C` 2026-05-19 |
| A-08 | Step 10 saved — user journey flows (Alert FSM, J0+J1, J5, J3, J4, J6, F1, J2) + pre-command gates | Party Mode + elicitation | Step 10 `C` 2026-05-19 |
| A-09 | Step 11 saved — 15-component inventory, ADR-CS-01–06, W-CT-01–10 security contracts | Party Mode + elicitation (Worf FMA/RE) | Step 11 `C` 2026-05-19 |
| A-10 | Step 12 saved — Command Horizon, button FSM matrix, ADR-CS-07, W-CT-11–13 | Party Mode + closure round | Step 12 `C` 2026-05-19 |
| A-11 | Certified viewport **1280×720** + floor **≥1024px** + **hard gate** `<1024px` (route block) | One layout family; no mobile MVP | Step 13 Round 1–2 |
| A-12 | **WCAG 2.1 AA** via certificate DC-7; `prefers-reduced-motion` disables animated-red only | Certificate is CI gate | Step 13 Round 1 |
| A-13 | CI visual breakpoints **1280×720 + 1024×768** only (F-07) | Honest tablet floor | Step 13 Round 1 |
| A-14 | Tiered **`aria-live`**: assertive = Red Alert, Battle Stations, stand-down-summary; polite = Yellow, Green restore | Assistive urgency without fatigue | Step 13 Round 3 |
| A-15 | **Trap-strict:** `BattleStationsConfirm`, stand-down-summary — full trap + `#ops-main` inert; Escape blocked | NFR-UX6 keyboard parity | Step 13 Round 4 |
| A-16 | **Trap-escapable:** `ClearanceOverlay` — trap + inert; Escape → read-only Ops (J4) | Security + guest escape | Step 13 Round 4 |
| A-17 | Step 13 saved — responsive + a11y, ADR-CS-08, W-CT-14–19 | Four Party Mode rounds | Step 13 `C` 2026-05-19 |
| A-18 | UX workflow **complete** for documentation handoff; **implementation sprint 1 blocked** until **D-01** | UX vs implementation gates distinct | Step 14 closure |
| A-19 | **Pre-sprint-1 queue:** (1) `architecture.md`, (2) PRD D-10 + D-16, (3) epics, (4) sprint 1 build | Council handoff order | Step 14 closure |
| A-20 | Step 14 saved — UX design workflow complete | Party Mode closure round | Step 14 `C` 2026-05-19 |

### Rejected (do not re-propose without revisit trigger)

| ID | Proposal | Why rejected | Revisit when |
|----|----------|--------------|--------------|
| R-01 | **D6 Dense Mission Control** as MVP default | Fails AC-E1 (passenger/SCADA); hides clearance chrome | Waive + 1280×720 proof; or **≥1440px opt-in** (D-14) |
| R-02 | **D4 Alert-Forward** (persistent top 25% banner at Green) | Violates alert-as-behavior; Michael BLOCKED | D-04 banner patch |
| R-03 | **Green-only full band** identity wipe at Yellow+ | Training wheels; loses wayfinding | Superseded by TRIAX A-02 |
| R-04 | **Full saturation** department bands under Red Alert | Competes with animated-red | Superseded by TRIAX |
| R-05 | **Holodeck / positronic agent tenancy** in MVP acceptance | G1–G5 exclude agent gates | D-03 Growth gate |
| R-06 | **HA dashboard / Lovelace** as primary UI | PRD non-goal | PRD scope change only |
| R-07 | **LCARS npm packages** as production deps | Okuda mandate full control | Never for MVP |
| R-08 | **Material / Chakra / shadcn** as visual foundation | Conflicts with experience pack | Hidden headless only, if ever |
| R-09 | **Technobabble cosplay** in character agents | VOICE-LAW | Never |
| R-10 | **D3 "Department Chromatic"** as fill-only identity | Ambiguous contract; 3 council rounds | Superseded by TRIAX A-02 |
| R-11 | **Quarters read-only glance** as responsive degrade of `ops.overview` | Second IA; scope creep; phone ≠ bridge | D-17 Growth screen |
| R-12 | **Assertive `aria-live` on all escalations** including Yellow | Announcement fatigue | Superseded by A-14 |
| R-13 | **Polite-only** for all alert FSM phases | Fails mobilization interrupt | Superseded by A-14 |
| R-14 | **Overlay-only, no focus trap** on NFR-UX6 gates | Tab bypass = no gate | Superseded by A-15 |
| R-15 | **Global console `inert`** during Yellow+ | Breaks NFR-UX2 without cause | Per-gate inert only (A-15) |
| R-16 | **Hold Step 14 closure** until `architecture.md` exists | Conflates UX doc complete vs impl start | Superseded by A-18 |

### Deferred (work recorded — not lost)

| ID | Item | Owner / artifact | Revisit when |
|----|------|------------------|--------------|
| D-01 | **[architecture.md](../../architecture.md)** | La Forge draft | Before implementation sprint |
| D-02 | ~~**Step 09 save**~~ → **Done** — see A-07 | Operator **`C`** 2026-05-19 | — |
| D-03 | **MVP→Growth handoff gate** | Data + PRD | Growth epic; optional G6 |
| D-04 | **D4 banner patch** (hidden Green, visible Yellow+) | Michael + UX spec | Before Alert-Forward exploration |
| D-05 | **`promotionGateReceipt`** | positronic-agent-schema | First Growth promote |
| D-06 | **Audit retention duration** NFR | Worf + PRD | Before G3 dogfood |
| D-07 | **Hybrid Google hard end date** + OAuth cutover | Worf + PRD | Before hybrid production |
| D-08 | **`inheritInvokerClearance: false`** testable FR/NFR | Worf + Data | Growth holodeck deploy |
| D-09 | **`color.dept.*.suppressed`** + TRIAX in certificate | Michael + fixture | Before TRIAX merge |
| D-10 | **Clearance envelopes FR19–FR22** | Worf + PRD | Before G3 dogfood |
| D-11 | **Chrome `semantic role: system`** on tokens | Worf + architecture.md | Sprint 1 token schema |
| D-12 | **Matter adapter interface lock** | La Forge + architecture.md | Before G2 / ART-01 |
| D-13 | **ART-01 CI harness** in sprint | La Forge | G2 — not sprint 1 |
| D-14 | **D6 opt-in ≥1440px** renderer | Okuda + backlog | Large display / battle bridge |
| D-15 | **Battle Stations label luminance** ≥4.5:1 bridge-dark | Picard + certificate | TRIAX certificate update |
| D-16 | **NFR block** rail persistence all FSM | Worf + PRD | Before G3 dogfood |
| D-17 | **`quarters.glance` Growth screen** — Guest-cap, alert phase + env index read-only, no actuation | Roddenberry + backlog | Growth epic; own screen ID + tests |

### Superseded (historical — cite replacement)

| Was | Now | Notes |
|-----|-----|-------|
| D3 monolithic color bands | TRIAX A-02 | Decompose channels first |
| Option A vs D collision | OPT-* vs D* | Data namespace rule |
| Green-only vs tiered debate | TRIAX FSM table | Reconciliation 2026-05-19 |
| Separate D5 frame | HealthStrip A-03 | Ship-status framing |

### Process notes

| Date | Note |
|------|------|
| 2026-05-19 | Elicitation methods 1–5 applied; ledgerVersion 1.1.0 |
| 2026-05-19 | TRIAX ≠ Scan→Command→Verified (glossary lock) |
| 2026-05-19 | I-01: summary-only subagents |
| 2026-05-19 | Step 13: four Party Mode rounds — gate vs glance, aria-live tiering, focus trap taxonomy |
| 2026-05-19 | Step 14: UX workflow complete — handoff queue A-19; impl blocked D-01 |

---

## Lessons Learned Registry

| ID | Lesson | If ignored | Action |
|----|--------|------------|--------|
| L-01 | Conflict is often **category error** | Repeat hue debate | Channel decomposition before color |
| L-02 | **Senior staff before Okuda wing** on scope | Visual feasibility fights | Staff → brief → council |
| L-03 | **Named model** closes reconciliation | CONDITIONS without end | TRIAX + FSM table |
| L-04 | **`P` without `C` is research** | Lost work | Post-PASS **`C`** + ledger |
| L-05 | Subagents **summary-default** | Reconstruct drift | OUTPUT CONTRACT + retry |
| L-06 | **Operator assumption** unset | Patronizing UX | Roddenberry sentence pre-visual |
| L-07 | **Worf late** → policy on finished UI | D-06–D-16 pile | NFR pointer pre-flight |
| L-08 | **architecture.md** missing | Floating visuals | La Forge prereq blocks spawn |
| L-09 | **Ledger cites** prevent rework | Re-debate R-01 | Snapshot in spawn |
| L-10 | **Reconciliation > more P** | Round 4+ | "Bring tensions down" protocol |
| L-11 | **MVC council** | Token burn | Spawn table § MVC |
| L-12 | **Council need test** | Waste on settled A-XX | Skip P when 3/3 true |
| L-13 | **Rejected + Revisit when** | Amnesia on "no" | R-XX rows permanent |
| L-14 | **Deferred** preserves work | Block save on D-01 | D-XX + save unrelated steps |
| L-15 | **Glossary lock** in spawn | TRIAX conflation | §6 forbidden terms |

---

## Counsel preservation (anti-rework)

1. **Ledger is source of truth** — spawn prompts include ledger snapshot; *do not reopen Rejected without Revisit when*.  
2. **On `C` save** — append Accepted/Rejected/Deferred; bump `ledgerVersion`; reference in UX spec revision notes.  
3. **Picard synthesis** — paste footer with ledger IDs when saving step.  
4. **Do not re-derive** — cite A/R/D/F instead of re-debating.  
5. **Waiver** — `Waiver: F-XX \| R-XX \| reason \| date` in spec.

---

## Step-scoped checklists

### Step 09 (design directions)

- [ ] Council need test or waiver logged  
- [ ] Operator assumption + binary question + conflict map  
- [ ] Ledger snapshot in spawn prompts  
- [ ] D1–D6 `targetSurface`; TRIAX if department identity  
- [ ] R-01, R-02 not reopened without D-04 / waiver  
- [ ] MVC roster (not full 7 unless agents touched)  
- [ ] On PASS: offer **`C`** (closes D-02)

### Step 11 (component strategy) — pre-mortem

- [ ] Frozen F-01–F-12  
- [ ] Each component: `targetSurface`, token role (`dept` \| `alert` \| `system`)  
- [ ] `architecture.md` in prereq report  
- [ ] Worf D-10, D-11, D-16 — NFR list, not visual debate  
- [ ] Binary: *Two-sprint list without new security composites?*

### Steps 10, 12–14

- [ ] Frozen register + council need test  
- [ ] No palette re-litigation (F-09, A-06)  
- [ ] Micro-retro if ≥2 `P` rounds  

---

## Orchestrator checklist

- [ ] Pre-flight §1–8 published  
- [ ] MVC spawn only  
- [ ] Spawn template + OUTPUT CONTRACT  
- [ ] Full counsel text; retry once; reconstruct with IDs if needed  
- [ ] Detection checklist before present  
- [ ] Synthesis cites ledger IDs  
- [ ] CONDITIONS → reconciliation if mechanisms conflict  
- [ ] Update ledger on **`C`**  
- [ ] Step 09 A/P/C menu after round  

---

## Related specs

- [process-senior-staff-meeting.md](./process-senior-staff-meeting.md)  
- [README.md](./README.md)  
- [ux-design-specification.md](../../ux-design-specification.md) § UX Review Council  
- [prd.md](../../prd.md) gates G1–G5  

---

## Ledger maintenance

| Field | Value |
|-------|-------|
| `ledgerVersion` | `1.3.0` |
| `lastUpdated` | 2026-05-19 |
| `step09Saved` | 2026-05-19 |
| `step10Saved` | 2026-05-19 |
| `step11Saved` | 2026-05-19 |
| `step12Saved` | 2026-05-19 |
| `step13Saved` | 2026-05-19 |
| `step14Saved` | 2026-05-19 |
| `uxWorkflowStatus` | **complete** |
| `scope` | ENTERPRISE UX Party Mode Steps 02–14 |
| `elicitationApplied` | Lessons (1), Pre-mortem (2), FMA (3), Meta-prompting (4), First principles (5) |

When updating: add rows; never delete **Rejected**/**Deferred** — mark **Superseded** instead.
