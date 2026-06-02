#!/usr/bin/env node
/**
 * Apply confirmed rectangular room measurements to per-floor level JSON.
 * Usage: node scripts/apply-measurements.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const simRoot = resolve(__dirname, '..');
const parityDir = join(simRoot, 'layouts/parity');
const floorsDir = join(simRoot, 'layouts/floors');
const dryRun = process.argv.includes('--dry-run');

const program = JSON.parse(readFileSync(join(parityDir, 'house-program.json'), 'utf8'));
const measurements = JSON.parse(readFileSync(join(parityDir, 'measurements.json'), 'utf8'));

const labelById = new Map(program.requiredRooms.map((r) => [r.id, r.label]));

function rectPolygon(g) {
  const { cornerX: x, cornerZ: z, lengthM: l, widthM: w } = g;
  return [
    [x, z],
    [x + l, z],
    [x + l, z + w],
    [x, z + w],
  ];
}

function roomGeometryReady(m) {
  if (m.status !== 'confirmed') return false;
  const g = m.geometry;
  if (!g || g.type !== 'rect') return false;
  return [g.cornerX, g.cornerZ, g.lengthM, g.widthM].every((v) => typeof v === 'number' && v > 0);
}

const byLevel = new Map();
for (const m of measurements.rooms ?? []) {
  if (!roomGeometryReady(m)) continue;
  if (!byLevel.has(m.levelId)) byLevel.set(m.levelId, []);
  byLevel.get(m.levelId).push(m);
}

let applied = 0;

for (const file of readdirSync(floorsDir).filter((f) => f.endsWith('.level.json'))) {
  const path = join(floorsDir, file);
  const floor = JSON.parse(readFileSync(path, 'utf8'));
  const updates = byLevel.get(floor.levelId);
  if (!updates?.length) continue;

  for (const m of updates) {
    const idx = floor.rooms.findIndex((r) => r.id === m.id);
    const polygon = rectPolygon(m.geometry);
    const ceiling = m.ceilingHeightM ?? (floor.elevation === -2.7 ? 2.4 : 2.7);
    const kind = m.id.startsWith('stairs-') ? 'gap' : 'interior';
    const room = {
      id: m.id,
      label: labelById.get(m.id) ?? m.id,
      levelId: floor.levelId,
      kind,
      floorElevation: floor.elevation,
      ceilingHeight: ceiling,
      floorPolygon: polygon,
      documentationRef: `From measurements.json (${m.status})${m.notes ? ` — ${m.notes}` : ''}`,
    };
    if (idx >= 0) floor.rooms[idx] = room;
    else floor.rooms.push(room);
    applied++;
    console.log(`  ${floor.levelId}/${m.id}: ${m.geometry.lengthM}×${m.geometry.widthM} m @ (${m.geometry.cornerX}, ${m.geometry.cornerZ})`);
  }

  if (!dryRun) {
    writeFileSync(path, JSON.stringify(floor, null, 2) + '\n');
  }
}

if (applied === 0) {
  console.log('No rooms with status=confirmed and full rect geometry.');
  console.log('Edit layouts/parity/measurements.json then re-run.');
  process.exit(0);
}

console.log(`\n${dryRun ? '[dry-run] Would apply' : 'Applied'} ${applied} room(s).`);
if (!dryRun) {
  console.log('Run: node scripts/merge-layout-floors.mjs && node scripts/check-parity.mjs');
}
