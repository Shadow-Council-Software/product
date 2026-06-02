#!/usr/bin/env node
/**
 * Merge per-floor level files into master house layout JSON.
 * Usage: node merge-layout-floors.mjs [output.json]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const simRoot = resolve(__dirname, '..');
const floorsDir = join(simRoot, 'layouts/floors');
const output =
  process.argv[2] ?? join(simRoot, 'layouts/onimurasame-residence-2026-05-24.json');

const floorFiles = readdirSync(floorsDir)
  .filter((f) => f.endsWith('.level.json'))
  .sort();

const levels = [];
const rooms = [];

for (const file of floorFiles) {
  const floor = JSON.parse(readFileSync(join(floorsDir, file), 'utf8'));
  levels.push({
    id: floor.levelId,
    label: floor.label,
    elevation: floor.elevation,
    envelope: floor.envelope,
  });
  for (const room of floor.rooms ?? []) {
    rooms.push({
      ...room,
      levelId: room.levelId ?? floor.levelId,
    });
  }
}

const devicesPath = join(simRoot, 'layouts/devices.registry.json');
let devices = [];
let stations = [];
try {
  const reg = JSON.parse(readFileSync(devicesPath, 'utf8'));
  devices = reg.devices ?? [];
  stations = reg.stations ?? [];
} catch {
  try {
    const existing = JSON.parse(readFileSync(output, 'utf8'));
    devices = existing.devices ?? [];
    stations = existing.stations ?? [];
  } catch {
    /* first run */
  }
}

const layout = {
  schemaVersion: 1,
  metadata: {
    name: 'Onimurasame residence — official scanned floor plan',
    units: 'meters',
    origin: {
      label: 'Front entrance center (south facade) — Nest Doorbell 3rd gen',
      position: [8.534, 0, 0],
      documentationRef: 'layouts/sources/Scanned_20260524-1944.pdf — owner-provided scan 2026-05-24',
    },
    totalFloorArea: 48.0,
    sources: [
      {
        title: 'Official house map scan (owner)',
        uri: 'enterprise/sim/layouts/sources/Scanned_20260524-1944.pdf',
        scaleVerified: true,
        notes: 'Per-floor edits in layouts/floors/*.level.json — merge with merge-layout-floors.mjs',
      },
    ],
  },
  coverageGoals: {
    perimeterComplete: false,
    notes: 'Edit exterior.level.json for lot line; main.level.json for interior parity',
  },
  levels,
  rooms,
  stations,
  devices,
};

writeFileSync(output, JSON.stringify(layout, null, 2) + '\n');

const interior = rooms.filter((r) => r.kind === 'interior').length;
const gaps = rooms.filter((r) => r.kind === 'gap').length;
console.log(`✓ Merged ${floorFiles.length} floors → ${output}`);
console.log(`  ${rooms.length} rooms (${interior} interior, ${gaps} gap zones, ${rooms.length - interior - gaps} other)`);
console.log(`  ${stations.length} stations, ${devices.length} devices`);
