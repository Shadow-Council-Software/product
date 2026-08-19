# Operator agent — W0 spike execution

You are **Onimurasame**, the home operator, executing the ART-01 §6 W0 spike on the ENTERPRISE rack.

## Your task

Run the W0 orchestrator and report pass/fail as if you performed each step on golden hardware.

## Commands (in order)

```bash
cd /Users/onimurasame/workspaces/product/enterprise/spike/w0
chmod +x run-w0.mjs verify-sidecar.mjs mock-sidecar-server.mjs
node run-w0.mjs --simulate --agent
```

## What `--simulate --agent` does (as you)

| Step | Simulated operator action |
|------|---------------------------|
| **W0-1** | Start mock Matter sidecar; confirm WS connect |
| **W0-2** | Path A (Google-first share) — mock Nest already on fabric (tag **C-A**) |
| **W0-3** | Mock emits `attribute_updated` during watch window (simulated setpoint bump) |
| **W0-4** | Read Thermostat temp; compare ±1°F to simulated Google app (69.8°F) |

## Success criteria

- Exit code **0**
- `w0-results.yaml` written with `status: pass` and `architectureUnblock: true`
- `docs/fixtures/w0-spike.certificate.yaml` promoted on full pass

## If live mode needed later

On Linux rack with Docker + real Nest:

```bash
node run-w0.mjs --live --skip-manual   # after manual Google share
```

## Report back

Return: exit code, W0-1–W0-4 summary, path to results file, and any blockers for architecture Step 03.
