#!/usr/bin/env node
/**
 * W0 spike automation — ART-01 §6 W0-1, W0-3, W0-4.
 * Emits W0_JSON_RESULT:{...} when W0_JSON=1 for run-w0.mjs orchestrator.
 */

import { MatterClient } from '@matter-server/ws-client';
import WebSocket from 'ws';

const WS_URL = process.env.MATTER_WS_URL ?? 'ws://127.0.0.1:5580/ws';
const NODE_ID = process.env.NODE_ID ? Number(process.env.NODE_ID) : undefined;
const EMIT_JSON = process.env.W0_JSON === '1';
const VERBOSE = process.env.W0_VERBOSE === '1';

if (!VERBOSE) {
  const origLog = console.log;
  console.log = (...a) => {
    const s = a.join(' ');
    if (
      s.startsWith('WebSocket ') ||
      s.startsWith('Trying to connect') ||
      s.startsWith('Incoming event')
    )
      return;
    origLog(...a);
  };
}
const WATCH_SEC = process.argv.includes('--watch')
  ? Number(process.argv[process.argv.indexOf('--watch') + 1] ?? 60)
  : 0;

const TEMP_READ_PATHS = [
  { path: '1/513/0', label: 'Thermostat.LocalTemperature' },
  { path: '1/1026/0', label: 'TemperatureMeasurement.MeasuredValue' },
  { path: '1/513/17', label: 'Thermostat.OccupiedCoolingSetpoint' },
  { path: '1/513/18', label: 'Thermostat.OccupiedHeatingSetpoint' },
];

function matterTempToF(raw) {
  if (raw == null) return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (Number.isNaN(n)) return null;
  return (n / 100) * (9 / 5) + 32;
}

function pickNestNode(nodesRecord) {
  const nodes = Object.values(nodesRecord ?? {});
  if (NODE_ID != null) return nodes.find((n) => n.node_id === NODE_ID) ?? null;
  const named = nodes.find((n) =>
    /nest|thermostat|learning/i.test(JSON.stringify(n))
  );
  return named ?? nodes[0] ?? null;
}

async function main() {
  const results = {
    w0_1: false,
    w0_3: false,
    w0_4: false,
    nodeCount: 0,
    nodeId: null,
    attributePath: '',
    sidecarRaw: null,
    notes: [],
  };

  console.log(`Connecting to ${WS_URL} …`);
  const client = new MatterClient(WS_URL, (url) => new WebSocket(url));

  let nodeChanged = false;
  client.addEventListener('nodes_changed', () => {
    nodeChanged = true;
    console.log('nodes_changed — subscription/event path active');
  });

  try {
    await client.startListening();
    results.w0_1 = true;
    console.log('W0-1 PASS — WebSocket connected + start_listening');
    if (client.serverInfo) {
      console.log('Server SDK:', client.serverInfo.sdk_version ?? 'unknown');
    }
  } catch (err) {
    console.error('W0-1 FAIL — cannot connect:', err.message);
    emitJson(results);
    process.exit(1);
  }

  const nodeList = Object.values(client.nodes ?? {});
  results.nodeCount = nodeList.length;
  console.log(`Nodes commissioned: ${nodeList.length}`);

  if (nodeList.length === 0) {
    console.log('No nodes — complete W0-2 Path A (Google share)');
    results.notes.push('W0-2 pending — zero nodes');
    emitJson(results);
    printSummary(results);
    client.disconnect();
    process.exit(2);
  }

  const node = pickNestNode(client.nodes);
  if (!node) {
    results.notes.push('No node selected');
    emitJson(results);
    client.disconnect();
    process.exit(2);
  }

  results.nodeId = node.node_id;
  console.log(`Using node_id=${node.node_id}`);

  for (const cand of TEMP_READ_PATHS) {
    try {
      const value = await client.readAttribute(node.node_id, cand.path);
      const f = matterTempToF(value);
      console.log(
        `read_attribute ${cand.label} → raw=${value}${f != null ? ` (~${f.toFixed(1)}°F)` : ''}`
      );
      results.w0_4 = true;
      results.attributePath = cand.path;
      results.sidecarRaw = value;
      results.notes.push(`W0-4 read ok ${cand.label} raw=${value}`);
      break;
    } catch (err) {
      console.log(`  skip ${cand.label}: ${err.message}`);
    }
  }

  if (!results.w0_4) {
    console.log('W0-4 FAIL — no Thermostat attribute returned');
    results.notes.push('W0-4 failed — attribute path discovery needed');
  } else {
    console.log('W0-4 PASS — read_attribute succeeded');
  }

  if (WATCH_SEC > 0) {
    nodeChanged = false;
    const baseline = results.w0_4
      ? await client.readAttribute(node.node_id, '1/513/0').catch(() => null)
      : null;
    console.log(`W0-3 — waiting ${WATCH_SEC}s for subscription update …`);
    const deadline = Date.now() + WATCH_SEC * 1000;
    while (Date.now() < deadline) {
      if (nodeChanged) break;
      await sleep(400);
    }
    if (!nodeChanged && baseline != null) {
      const after = await client.readAttribute(node.node_id, '1/513/0').catch(() => null);
      if (after != null && after !== baseline) nodeChanged = true;
    }
    results.w0_3 = nodeChanged;
    console.log(results.w0_3 ? 'W0-3 PASS' : 'W0-3 FAIL');
  }

  emitJson(results);
  printSummary(results);
  client.disconnect();
  process.exit(results.w0_1 && results.w0_4 ? 0 : 2);
}

function emitJson(r) {
  if (EMIT_JSON) console.log(`W0_JSON_RESULT:${JSON.stringify(r)}`);
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function printSummary(r) {
  console.log('\n--- W0 automation summary ---');
  console.log(`W0-1: ${r.w0_1 ? 'PASS' : 'FAIL'}`);
  console.log(`W0-3: ${WATCH_SEC ? (r.w0_3 ? 'PASS' : 'FAIL') : 'SKIP'}`);
  console.log(`W0-4: ${r.w0_4 ? 'PASS' : 'FAIL'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
