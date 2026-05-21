---
title: Evidence & Decision Matrix
product: product
prd: prd.md
purpose: Trace claims and decisions to proof artifacts, owners, and phases so rigor is not lost across rewrites or long threads.
status: living
---

# Evidence & Decision Matrix

Use this document as the **single traceability layer** alongside `prd.md`:

- Each **claim or decision** must have a named **primary evidence artifact** (what a reviewer could open to verify the claim).
- **Accepting authority** is who signs off that the evidence meets the bar for that phase.
- **Phase** aligns with `releaseMode: phased` in the PRD (Phase 1 = Mechanistic Core, etc.).
- **Status:** `planned` | `in-progress` | `evidenced` | `waived` (waivers require rationale + approver in Notes).

Update this file whenever the PRD or scope changes; do not rely on chat history alone.

## Matrix

| ID | Claim / decision | Primary evidence artifact | Accepting authority | Phase | Status | Linked FRs | Linked journeys | Notes |
|----|------------------|---------------------------|---------------------|-------|--------|------------|-----------------|-------|
| E-001 | Mechanistic interpreter produces schema-valid IR for flagship inputs | Golden corpus run logs + IR dumps + CI gate results | Tech lead + Assurance | 1 | planned | FR6–FR8, FR54 | J1 | Falsifiable; define corpus version in repro pack |
| E-002 | Unknown interpreter states never silently pass as valid | Test suite + decision-record samples for each disposition | Assurance Analyst | 1 | planned | FR8 | J1, J4 | Include adversarial inputs |
| E-003 | Deterministic replay holds within declared replay envelope | Replay report bundle + env fingerprint diff on pass/fail | Tech lead | 1 | planned | FR12–FR13, FR55 | J1, J2, J5 | Envelope must be explicit per workload |
| E-004 | Equivalence claims are bounded by comparator contracts | Comparator registry version + tolerance spec + sample reports | Assurance Analyst | 1 | planned | FR16–FR19, FR37 | J1, J4 | No “equivalent” without named comparator |
| E-005 | Mutation gates block promotion when thresholds fail | Mutation reports + promotion audit trail | Assurance Analyst | 1 | planned | FR20–FR22 | J1, J4 | Operator-level coverage for flagship |
| E-006 | Hosted lane satisfies tenant isolation | Pen test / isolation test report + tenancy test matrix | Security + Platform | 1 | planned | FR9–FR11, FR40 | J3 | Phase 1 is hosted-first |
| E-007 | Evidence bundles are integrity-verifiable (incl. third party) | Verification procedure doc + sample verified bundle | Security + Research | 1 | planned | FR25–FR26, FR45, FR57–FR58 | J1–J6 (export) | Maps to peer-review needs |
| E-008 | Program gates G1/G2/G3 are tracked with structured reports | Gate report artifacts + dashboard export | Product Owner | 1 | planned | FR43–FR44 | J4 | Pre-mortem stop/continue discipline |
| E-009 | Phase 1 scientific package is publishable and traced to runs | Whitepaper + spec + reproducibility protocol + frozen artifact set | Research lead | 1 | planned | FR30–FR32 | J1 | Each doc section links to evidence IDs |
| E-010 | Security posture spec exists before GA assurance claims | Security specification v1 + control mapping | Security lead | 2 | planned | NFR-SEC | J3 | Align with NFR-SEC-001 posture; enumerate controls, not slogans |
| E-011 | Self-hosted lane parity (when enabled) | Parity benchmark pack + divergence taxonomy | Platform + Assurance | 2 | planned | FR33–FR34 | J2 | Deferred from Phase 1 |
| E-012 | RPO/RTO and DR for evidence store | DR drill record + RPO/RTO table | Platform + Security | 2 | planned | NFR-REL | J3 | Deep dive per NFR-REL-001 |
| E-013 | Interpreter-discoverable integrity marker (incl. mentor quote payload) | Spec for marker + tests proving mechanistic discovery | Security + Tech lead | TBD | planned | NFR-SEC-EE-001 | J1, J4 | Product idea: signature generator; encoding TBD |
| E-014 | Mechanistic promotion requires counterfactual necessity (Trace-47) | `experiments/trace-47-catastrophe-protocol.md` + `experiments/fixtures/T47-ABLATION-*.csv` + `nshr_promotion_gate.py` + `promotion_integrity_gate.py` | Assurance Analyst + Research | 1 | evidenced | FR16–FR18, FR20–FR22, FR35, FR50, FR53–FR54 | J1, J4 | v0: fixture ablation + NSHR gate + SWAP-CERT on synthetic traces; Tier B only — see `V0-RELEASE.md` |

## Decision register (summary)

Mirror formal decision records here or link to your system of record.

| Decision ID | Topic | Decision | Date | Owner | Evidence link |
|-------------|--------|----------|------|-------|----------------|
| D-001 | Release mode | Phased delivery; hosted-first Phase 1 | — | Product | PRD Project Scoping |
| D-002 | Phase 1 scope cap | Flagship workflow class only | — | Product | PRD Project Scoping |
| D-003 | Docs rigor | Thesis-grade publishable core required Phase 1 | — | Research | PRD Developer Tool reqs |

## How to add a row

1. Assign the next **E-###** ID.  
2. State the claim in one sentence (testable).  
3. Name the **one** artifact a skeptic would accept first.  
4. Assign owner and phase; set status `planned` until evidence exists.  
5. Link FR/NFR IDs from `prd.md`.  
6. Add **Linked journeys** (J1–J6 per PRD User Journeys) when the claim is journey-scoped.
