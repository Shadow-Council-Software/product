#!/usr/bin/env node
/**
 * Parity readiness report — compares house-program vs measurements vs floor JSON.
 * Usage: node scripts/check-parity.mjs [--json]
 */
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const simRoot = resolve(__dirname, '..');
const parityDir = join(simRoot, 'layouts/parity');
const floorsDir = join(simRoot, 'layouts/floors');
const jsonOut = process.argv.includes('--json');

const program = JSON.parse(readFileSync(join(parityDir, 'house-program.json'), 'utf8'));
const siteCirc = existsSync(join(parityDir, 'site-and-circulation.json'))
  ? JSON.parse(readFileSync(join(parityDir, 'site-and-circulation.json'), 'utf8'))
  : null;
const measurementsPath = join(parityDir, 'measurements.json');
const measurements = existsSync(measurementsPath)
  ? JSON.parse(readFileSync(measurementsPath, 'utf8'))
  : { rooms: [], controlDimensions: [], evidence: [] };

const floorRooms = new Map();
for (const file of readdirSync(floorsDir).filter((f) => f.endsWith('.level.json'))) {
  const floor = JSON.parse(readFileSync(join(floorsDir, file), 'utf8'));
  for (const room of floor.rooms ?? []) {
    floorRooms.set(room.id, { ...room, floorFile: file });
  }
}

const measureById = new Map((measurements.rooms ?? []).map((r) => [r.id, r]));

function roomGeometryReady(m) {
  if (!m || m.status !== 'confirmed') return false;
  const g = m.geometry;
  if (!g || g.type !== 'rect') return false;
  return [g.cornerX, g.cornerZ, g.lengthM, g.widthM].every((v) => typeof v === 'number' && v > 0);
}

function polygonReady(room) {
  if (!room?.floorPolygon || room.floorPolygon.length < 3) return false;
  const xs = room.floorPolygon.map((p) => p[0]);
  const zs = room.floorPolygon.map((p) => p[1]);
  const area =
    Math.abs(
      xs.reduce((sum, x, i) => {
        const j = (i + 1) % xs.length;
        return sum + x * zs[j] - xs[j] * zs[i];
      }, 0),
    ) / 2;
  return area > 0.05;
}

const required = program.requiredRooms ?? [];
const lines = [];
const issues = [];

let confirmedMeasure = 0;
let interiorTraced = 0;

for (const req of required) {
  const m = measureById.get(req.id);
  const fr = floorRooms.get(req.id);
  const mOk = roomGeometryReady(m);
  const fOk = fr && fr.kind === 'interior' && polygonReady(fr);
  if (mOk) confirmedMeasure++;
  if (fOk) interiorTraced++;

  const parts = [];
  if (!m) parts.push('no measurement row');
  else if (!mOk) parts.push(`measurements: ${m.status}`);
  if (!fr) parts.push('missing from floor JSON');
  else if (!fOk) parts.push(`floor: ${fr.kind}, polygon ${fOk ? 'ok' : 'placeholder'}`);

  if (parts.length) {
    issues.push({ id: req.id, levelId: req.levelId, label: req.label, blockers: parts });
    lines.push(`  ✗ ${req.id} (${req.levelId}) — ${parts.join('; ')}`);
  } else {
    lines.push(`  ✓ ${req.id} (${req.levelId}) — confirmed`);
  }
}

const controls = (measurements.controlDimensions ?? []).filter(
  (c) => c.measuredM == null || Math.abs(c.measuredM - c.expectedM) * 100 > (c.toleranceCm ?? 2),
);
const evidenceCount = (measurements.evidence ?? []).length;

const report = {
  generatedAt: new Date().toISOString(),
  requiredRooms: required.length,
  confirmedMeasurements: confirmedMeasure,
  interiorPolygonsReady: interiorTraced,
  openIssues: issues.length,
  controlDimensionsPending: controls.length,
  evidenceFiles: evidenceCount,
  parityPercent: Math.round((interiorTraced / required.length) * 100),
  issues,
};

const reportPath = join(parityDir, 'parity-report.json');
mkdirSync(parityDir, { recursive: true });
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(issues.length ? 1 : 0);
}

console.log('\n=== ENTERPRISE house parity report ===\n');
if (siteCirc?.site?.addressConfirmed) {
  console.log(`Site:               ✓ ${siteCirc.site.address} — front → ${siteCirc.site.frontFacesStreet}`);
}
if (siteCirc?.circulation?.main?.confirmed) {
  console.log(`Ground circulation: ✓ confirmed (see site-and-circulation.json)`);
}
console.log(`Required rooms:     ${required.length}`);
console.log(`Confirmed measures: ${confirmedMeasure}`);
console.log(`Interior polygons:  ${interiorTraced}`);
console.log(`Parity progress:    ${report.parityPercent}% (interior polygons / required rooms)`);
console.log(`Evidence files:     ${evidenceCount}`);
if (controls.length) {
  console.log(`\nControl dimensions still needed: ${controls.map((c) => c.id).join(', ')}`);
}
console.log('\nPer room:');
console.log(lines.join('\n'));
console.log(`\nFull report: ${reportPath}`);
console.log('\nNext: fill layouts/parity/measurements.json → node scripts/apply-measurements.mjs');
console.log('      or trace in Layout Studio → Save floor → Compile\n');

process.exit(issues.length ? 1 : 0);
