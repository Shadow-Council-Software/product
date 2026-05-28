#!/usr/bin/env node
/**
 * CLI verification for Sprint 1 sim UX proof (SIM-AC-01, layout anchor, optional engine FSM).
 * Usage: node enterprise/sim/scripts/verify-sprint1-proof.mjs [--engine-url http://127.0.0.1:3001]
 */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const simRoot = resolve(__dirname, '..');
const enterpriseRoot = resolve(simRoot, '..');

const engineUrl =
  process.argv.find((a) => a.startsWith('--engine-url='))?.split('=')[1] ??
  process.env.ENGINE_URL ??
  'http://127.0.0.1:3001';

const layoutPath = join(simRoot, 'layouts/onimurasame-residence-2026-05-24.json');
const capsPath = join(simRoot, 'unity/renderer-capabilities-descriptor.yaml');
const parityPath = join(simRoot, 'unity/engine-parity.certificate.yaml');
const parentCertPath = join(enterpriseRoot, 'docs/fixtures/visual-foundation-freeze.certificate.yaml');

let pass = 0;
let fail = 0;
let warn = 0;

function ok(label) {
  console.log(`✓ ${label}`);
  pass += 1;
}

function bad(label, detail = '') {
  console.log(`✗ ${label}${detail ? ` — ${detail}` : ''}`);
  fail += 1;
}

function note(label) {
  console.log(`⚠ ${label}`);
  warn += 1;
}

function yamlIncludes(path, patterns) {
  const text = readFileSync(path, 'utf8');
  return patterns.every((p) => (typeof p === 'string' ? text.includes(p) : p.test(text)));
}

console.log('Sprint 1 sim UX proof verification\n');

// SIM-AC-01 — capabilities descriptor
if (!existsSync(capsPath)) {
  bad('SIM-AC-01 renderer-capabilities-descriptor.yaml missing');
} else if (
  yamlIncludes(capsPath, ['engineId: unity', 'colorSpace: srgb-mvp', 'touch: false'])
) {
  ok('SIM-AC-01 renderer-capabilities-descriptor.yaml valid');
} else {
  bad('SIM-AC-01 descriptor missing required fields');
}

// C-SIM-04 — engine parity certificate scaffold
if (!existsSync(parityPath)) {
  bad('C-SIM-04 engine-parity.certificate.yaml missing');
} else {
  const parityText = readFileSync(parityPath, 'utf8');
  if (parityText.includes('engineId: unity') && parityText.includes('distanceLegibilityM: 3.0')) {
    ok('C-SIM-04 engine-parity.certificate.yaml scaffold present');
  } else {
    bad('C-SIM-04 certificate missing unity / 3m legibility');
  }
  if (parityText.includes('parentHash: PENDING')) {
    note('C-SIM-04 parentHash still PENDING — copy hash from output below');
  }
}

// Parent certificate hash helper
if (existsSync(parentCertPath)) {
  const hash = createHash('sha256').update(readFileSync(parentCertPath)).digest('hex');
  ok(`Parent visual freeze SHA-256: ${hash.slice(0, 16)}…`);
  console.log(`  Set engine-parity parentHash to: ${hash}`);
} else {
  note('Parent visual-foundation-freeze.certificate.yaml not found');
}

// C-SIM-15 / SIM-AC-03 — central-hall anchor
if (!existsSync(layoutPath)) {
  bad('Layout JSON missing');
} else {
  const layout = JSON.parse(readFileSync(layoutPath, 'utf8'));
  const station = layout.stations?.find((s) => s.stationId === 'env.nest.primary');
  const device = layout.devices?.find((d) => d.deviceId === 'env.nest.thermostat.primary');
  if (station?.roomId === 'central-hall' && device?.roomId === 'central-hall') {
    ok('C-SIM-15 central-hall Environmental anchor in layout');
  } else {
    bad('C-SIM-15 central-hall anchor mismatch');
  }
  if (layout.rooms?.some((r) => r.id === 'office')) {
    ok('Layout room id office (canonical)');
  } else if (layout.rooms?.some((r) => r.id === 'home-office')) {
    bad('Layout still uses home-office — rename to office');
  }
}

// SIM-AC-02 — optional live engine FSM
try {
  const res = await fetch(`${engineUrl.replace(/\/$/, '')}/api/v1/alerts`, {
    signal: AbortSignal.timeout(3000),
  });
  if (res.ok) {
    const body = await res.json();
    if (typeof body.phase === 'string') {
      ok(`SIM-AC-02 engine alert FSM reachable (phase=${body.phase})`);
    } else {
      bad('SIM-AC-02 /api/v1/alerts response missing phase');
    }
  } else {
    note(`SIM-AC-02 engine returned ${res.status} — start engine for live FSM proof`);
  }
} catch {
  note('SIM-AC-02 engine not running — start with MATTER_ADAPTER=sim npm run dev:engine');
}

console.log(`\nResult: ${pass} passed, ${fail} failed, ${warn} warnings`);
process.exit(fail > 0 ? 1 : 0);
