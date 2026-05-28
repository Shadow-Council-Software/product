#!/usr/bin/env node
/**
 * Converts canonical house-layout JSON (array coords) to Unity JsonUtility-friendly format.
 * Usage: node convert-layout-for-unity.mjs [input.json] [output.json]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const simRoot = resolve(__dirname, '..');

const input =
  process.argv[2] ?? join(simRoot, 'layouts/onimurasame-residence-2026-05-24.json');
const output =
  process.argv[3] ??
  join(simRoot, 'unity/ENTERPRISE.HouseHarness/Assets/StreamingAssets/house-layout.json');

const raw = JSON.parse(readFileSync(input, 'utf8'));

function vec3(arr) {
  return { x: arr[0], y: arr[1], z: arr[2] };
}

function vec2(pair) {
  return { x: pair[0], y: pair[1] };
}

const unity = {
  schemaVersion: raw.schemaVersion,
  metadata: {
    name: raw.metadata?.name ?? 'house',
    units: raw.metadata?.units ?? 'meters',
  },
  rooms: (raw.rooms ?? [])
    .filter((r) => (r.levelId ?? 'main') === 'main' && (r.kind ?? 'interior') === 'interior')
    .map((r) => ({
    id: r.id,
    label: r.label,
    floorElevation: r.floorElevation ?? 0,
    ceilingHeight: r.ceilingHeight ?? 2.7,
    floorPolygon: (r.floorPolygon ?? []).map(vec2),
  })),
  stations: (raw.stations ?? []).map((s) => ({
    stationId: s.stationId,
    roomId: s.roomId,
    label: s.label ?? s.stationId,
    position: vec3(s.position),
    rotationY: s.rotationY ?? 0,
    matterNodeId: s.matterNodeId ?? 0,
    deviceType: s.deviceType ?? 'unknown',
  })),
  devices: (raw.devices ?? [])
    .filter((d) => d.deploymentStatus === 'installed')
    .map((d) => ({
      deviceId: d.deviceId,
      roomId: d.roomId,
      label: d.label,
      deviceType: d.deviceType,
      position: vec3(d.position),
      rotationY: d.rotationY ?? 0,
    })),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(unity, null, 2));
console.log(`✓ Unity layout written: ${output}`);
console.log(`  ${unity.rooms.length} rooms, ${unity.stations.length} stations, ${unity.devices.length} installed devices`);
