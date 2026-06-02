# ENTERPRISE local MVP — mock household (thermostat + doorbell + camera labels)
# Requires Node.js 20+ on PATH (install from https://nodejs.org if npm missing)

$ErrorActionPreference = "Stop"
$Runtime = Join-Path $PSScriptRoot "..\runtime"

Write-Host "ENTERPRISE dev (mock) — installing and starting engine + LCARS..."
Set-Location $Runtime

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm not found. Install Node.js LTS and reopen the terminal."
}

npm install
npm run build

Write-Host ""
Write-Host "Starting engine on http://localhost:3001 (mock adapter)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Runtime'; `$env:MATTER_ADAPTER='mock'; npm run dev:engine"

Start-Sleep -Seconds 3

Write-Host "Starting LCARS on http://localhost:5173 ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Runtime'; npm run dev:lcars"

Write-Host ""
Write-Host "Open http://localhost:5173 — Device roster shows 3 mock Nest devices."
Write-Host "For LIVE Nest: see enterprise/docs/SAME-MACHINE-SETUP.md Phase 3"
