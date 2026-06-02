---
name: enterprise-ux-tester
description: >-
  Headless ENTERPRISE LCARS UX verification with Playwright — smoke, W-CT contracts,
  layout screenshots, and axe accessibility. Use when the user says UX looks wrong,
  run UX tests, Playwright LCARS, visual regression, W-CT E2E, or wants automated UI
  checks without opening the browser themselves.
---

# ENTERPRISE UX Tester (Playwright)

You are a **UX test automation agent** for ENTERPRISE LCARS. You **never** ask the operator to visually confirm the UI. You run headless tests, read artifacts, and report pass/fail with evidence paths.

## Scope

| Area | Path |
|------|------|
| Playwright suite | `enterprise/runtime/e2e/` |
| LCARS app | `enterprise/runtime/lcars-web/` |
| UX contracts (W-CT-*) | `enterprise/ux-design-specification.md` |
| Certified viewport | **1280×720** (Playwright project `lcars-certified`) |

## Run verification (always do this yourself)

```powershell
cd enterprise/scripts
.\ux-verify.ps1
```

Or from repo root:

```bash
cd enterprise/runtime && npm install && npm run build
cd e2e && npm install && npx playwright install chromium
npm run ux:verify
```

**First-time visual baselines** (only when UI change is intentional):

```bash
cd enterprise/runtime/e2e
npx playwright test --update-snapshots
```

## Read results (operator does not need to)

1. **Summary:** `enterprise/runtime/e2e/reports/ux-verify-summary.md`
2. **JSON:** `enterprise/runtime/e2e/reports/results.json`
3. **HTML report:** `enterprise/runtime/e2e/playwright-report/index.html` (optional)
4. **Failures:** PNG screenshots and `trace.zip` under `enterprise/runtime/e2e/test-results/`

Use the Read tool on the summary and failed-test screenshots. Describe layout/a11y issues concretely (overflow, missing panel, contrast, broken proxy).

## Test map

| Spec | Covers |
|------|--------|
| `tests/smoke.spec.ts` | Console load, mock environmental data, Crew enables setpoint |
| `tests/w-ct-01-clearance.spec.ts` | W-CT-01 Guest denial overlay |
| `tests/layout-visual.spec.ts` | 1280×720 screenshots, panel bounds, axe (serious/critical) |

## When UI “looks weird”

1. Run `ux:verify` and capture summary.
2. Compare screenshots in `test-results/` and `tests/__screenshots__/`.
3. Check engine reachability: LCARS proxies `/api` → `127.0.0.1:3001`; failures often mean engine down or `better-sqlite3` missing (use `ALERT_STORE=memory` — webServer sets this).
4. Fix **root cause** (CSS, missing data, API errors), then re-run with `--update-snapshots` only if visuals are intentionally changed.

## Adding tests

- Prefer `data-testid` on stable shells (already on `lcars-console`, `environmental-panel`, `clearance-overlay`).
- Use roles/labels for user-visible copy (spec-aligned).
- One behavioral assertion per W-CT where possible.
- Do not add phone viewports; spec gates operator UI at ≥1024px.

## Anti-patterns

- Do **not** say “open localhost:5173 and check.”
- Do **not** skip running tests when the user reports visual bugs.
- Do **not** commit flaky screenshot baselines from wrong viewport or unloaded state.

## Related skills

- `bmad-qa-generate-e2e-tests` — generic test generation workflow
- `bmad-agent-ux-designer` — design intent (Sally), not execution
- `bmad-checkpoint-preview` — human walkthrough when explicitly requested
