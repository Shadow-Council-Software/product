# Headless LCARS UX verification (Playwright). Requires platform engine + UX LCARS.
$ErrorActionPreference = "Stop"
$UxRuntime = Join-Path $PSScriptRoot "..\runtime"
$PlatformRuntime = Join-Path $PSScriptRoot "..\..\platform\runtime"
$E2e = Join-Path $UxRuntime "e2e"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm not found. Install Node.js LTS and reopen the terminal."
}

Write-Host "Building platform engine..."
Set-Location $PlatformRuntime
npm install
npm run build

Write-Host "Building UX LCARS..."
Set-Location $UxRuntime
npm install
npm run build

Set-Location $E2e
npm install
npx playwright install chromium

foreach ($port in 5173, 5174, 5175) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}

npm run ux:verify
$code = $LASTEXITCODE

Write-Host ""
Write-Host "Agent-readable summary: enterprise/ux/runtime/e2e/reports/ux-verify-summary.md"
Write-Host "HTML report (optional):   enterprise/ux/runtime/e2e/playwright-report/index.html"
exit $code
