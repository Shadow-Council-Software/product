#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const layoutPath = process.argv[2] ?? join(__dirname, '../../layouts/house-layout.example.json');
const schemaPath = join(__dirname, '../../house-layout.schema.json');

const layout = JSON.parse(readFileSync(layoutPath, 'utf8'));
const errors = [];

if (layout.schemaVersion !== 1) errors.push('schemaVersion must be 1');
if (!layout.metadata?.units) errors.push('metadata.units required');
if (!Array.isArray(layout.rooms) || layout.rooms.length === 0) errors.push('rooms required');
if (!Array.isArray(layout.stations) || layout.stations.length === 0) errors.push('stations required');

const roomIds = new Set((layout.rooms ?? []).map((r) => r.id));
for (const s of layout.stations ?? []) {
  if (!roomIds.has(s.roomId)) errors.push(`station ${s.stationId} references unknown room ${s.roomId}`);
  if (!s.stationId || s.matterNodeId == null) errors.push('station missing id or matterNodeId');
}

for (const d of layout.devices ?? []) {
  if (!roomIds.has(d.roomId)) errors.push(`device ${d.deviceId} references unknown room ${d.roomId}`);
  if (!d.deviceId || !d.deviceType || !d.deploymentStatus) errors.push(`device ${d.deviceId ?? '?'} missing required fields`);
}

const deviceCount = layout.devices?.length ?? 0;
const installed = (layout.devices ?? []).filter((d) => d.deploymentStatus === 'installed').length;
const planned = (layout.devices ?? []).filter((d) => d.deploymentStatus === 'planned').length;

if (errors.length) {
  console.error('Layout validation failed:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

console.log(`✓ Layout valid: ${layout.metadata.name} (${layout.rooms.length} rooms, ${layout.stations.length} stations, ${deviceCount} devices: ${installed} installed, ${planned} planned)`);
console.log(`  Schema: ${schemaPath}`);
