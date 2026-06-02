#!/usr/bin/env node
/**
 * Headless UX verification — runs Playwright and writes a markdown summary for agents.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const e2eRoot = fileURLToPath(new URL('..', import.meta.url));
const reportsDir = path.join(e2eRoot, 'reports');
const summaryPath = path.join(reportsDir, 'ux-verify-summary.md');

/** Avoid writing summary to wrong folder if script path resolution fails. */
if (!existsSync(path.join(e2eRoot, 'playwright.config.ts'))) {
  console.error('ux-verify: expected playwright.config.ts in', e2eRoot);
  process.exit(1);
}

mkdirSync(reportsDir, { recursive: true });

async function stackAlreadyUp() {
  try {
    const [health, lcars] = await Promise.all([
      fetch('http://127.0.0.1:3001/health'),
      fetch('http://localhost:5173/'),
    ]);
    return health.ok && lcars.ok;
  } catch {
    return false;
  }
}

const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1' || (await stackAlreadyUp());
const pwCli = path.join(e2eRoot, '..', 'node_modules', 'playwright', 'cli.js');
const run = spawnSync(process.execPath, [pwCli, 'test'], {
  cwd: e2eRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    PLAYWRIGHT_SKIP_WEBSERVER: skipWebServer ? '1' : '',
  },
});

let json = { suites: [], stats: { expected: 0, unexpected: 0, skipped: 0 } };
const jsonPath = path.join(e2eRoot, 'reports', 'results.json');
if (existsSync(jsonPath)) {
  try {
    json = JSON.parse(readFileSync(jsonPath, 'utf8'));
  } catch {
    /* ignore */
  }
}

const passed = json.stats?.expected ?? 0;
const failed = json.stats?.unexpected ?? 0;
const skipped = json.stats?.skipped ?? 0;
const status = run.status === 0 ? 'PASS' : 'FAIL';

const lines = [
  '# ENTERPRISE UX verification',
  '',
  `**Status:** ${status}`,
  `**When:** ${new Date().toISOString()}`,
  '',
  '| Metric | Count |',
  '|--------|-------|',
  `| Passed | ${passed} |`,
  `| Failed | ${failed} |`,
  `| Skipped | ${skipped} |`,
  '',
  '## Artifacts (for agents — do not ask the operator to open the browser)',
  '',
  `- HTML report: \`enterprise/runtime/e2e/playwright-report/index.html\``,
  `- JSON results: \`enterprise/runtime/e2e/reports/results.json\``,
  `- Screenshots / traces: \`enterprise/runtime/e2e/test-results/\``,
  '',
  '## How to review failures',
  '',
  '1. Read this summary and `reports/results.json`.',
  '2. Open failed test attachments under `test-results/` (PNG screenshots, trace.zip).',
  '3. For visual drift: `cd enterprise/runtime/e2e && npx playwright test --update-snapshots` (only when UI change is intentional).',
  '',
];

if (failed > 0 && Array.isArray(json.suites)) {
  lines.push('## Failed tests', '');
  for (const suite of json.suites) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        if (test.status === 'unexpected' || test.status === 'failed') {
          lines.push(`- **${spec.title}** › ${test.projectName ?? 'default'}`);
        }
      }
    }
  }
  lines.push('');
}

writeFileSync(summaryPath, lines.join('\n'), 'utf8');
console.log(`\nUX summary: ${summaryPath}\n`);

process.exit(run.status ?? 1);
