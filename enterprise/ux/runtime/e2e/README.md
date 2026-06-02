# ENTERPRISE LCARS — Playwright UX tests

Headless verification for LCARS at **1280×720**. Starts mock engine + Vite dev server automatically (unless ports are in use and `CI` is unset).

## Quick start

```powershell
cd enterprise/scripts
.\ux-verify.ps1
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run ux:verify` | Run all tests + write `reports/ux-verify-summary.md` |
| `npm test` | Playwright only |
| `npx playwright test --update-snapshots` | Refresh visual baselines |
| `npm run report` | Open HTML report |

## Agent skill

Use **`enterprise-ux-tester`** so Cursor runs this suite and reads artifacts instead of asking you to eyeball the UI.
