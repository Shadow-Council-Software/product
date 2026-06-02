# ENTERPRISE local MVP — live Matter sidecar (Windows port mapping)
$ErrorActionPreference = "Stop"
$Runtime = Join-Path $PSScriptRoot "..\runtime"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm not found. Install Node.js LTS first."
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker not found. Install Docker Desktop first."
}

Set-Location $Runtime
npm install
npm run build

Write-Host "Starting Matter sidecar on ws://127.0.0.1:5580/ws ..."
docker compose --profile sidecar up -d

Write-Host "Waiting for sidecar..."
Start-Sleep -Seconds 8

Write-Host "Starting engine (MATTER_ADAPTER=ohf)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$Runtime'
`$env:MATTER_ADAPTER='ohf'
`$env:OHF_SIDECAR_URL='ws://127.0.0.1:5580/ws'
npm run dev:engine
"@

Start-Sleep -Seconds 3

Write-Host "Starting LCARS..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Runtime'; npm run dev:lcars"

Write-Host ""
Write-Host "Open http://localhost:5173"
Write-Host "Commission Nest devices via Matter Server (see SAME-MACHINE-SETUP.md)."
Write-Host "Sidecar UI may be at http://127.0.0.1:5580 — check python-matter-server docs."
