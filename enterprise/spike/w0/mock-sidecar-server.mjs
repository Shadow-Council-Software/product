#!/usr/bin/env node
/**
 * Minimal python-matter-server compatible mock for W0 --simulate runs.
 * Pre-loads a Nest Learning Thermostat node (Path A already complete).
 */

import { WebSocketServer } from 'ws';

const PORT = Number(process.env.MOCK_MATTER_PORT ?? 5580);
const HOST = process.env.MOCK_MATTER_HOST ?? '127.0.0.1';

const SERVER_INFO = {
  fabric_id: 1,
  compressed_fabric_id: 1,
  fabric_index: 1,
  schema_version: 10,
  min_supported_schema_version: 1,
  sdk_version: 'mock-w0-sidecar/1.0.0',
  wifi_credentials_set: true,
  thread_credentials_set: true,
  bluetooth_enabled: false,
};

function nestNode(tempRaw = 2100) {
  return {
    node_id: 42,
    date_commissioned: '2026-05-22T12:00:00.000Z',
    last_interview: '2026-05-22T12:00:00.000Z',
    interview_version: 4,
    available: true,
    is_bridge: false,
    attributes: {
      '0/40/3': 'Nest Learning Thermostat 4th gen',
      '0/40/1': 'Google Nest',
      '1/513/0': tempRaw,
      '1/513/17': 2400,
      '1/513/18': 2000,
    },
    attribute_subscriptions: [],
  };
}

let liveTemp = 2100;
let wss;

function sendJson(ws, payload) {
  ws.send(JSON.stringify(payload, (_, v) => (typeof v === 'bigint' ? Number(v) : v)));
}

function replyResult(ws, messageId, result) {
  sendJson(ws, { message_id: messageId, result });
}

function emitAttributeUpdated(ws, nodeId, key, value) {
  sendJson(ws, { event: 'attribute_updated', data: [nodeId, key, value] });
}

function handleCommand(ws, msg) {
  const { message_id: messageId, command, args = {} } = msg;

  switch (command) {
    case 'start_listening':
      replyResult(ws, messageId, [nestNode(liveTemp)]);
      break;
    case 'get_nodes':
      replyResult(ws, messageId, [nestNode(liveTemp)]);
      break;
    case 'get_node':
      replyResult(ws, messageId, nestNode(liveTemp));
      break;
    case 'read_attribute': {
      const node = nestNode(liveTemp);
      const path = args.attribute_path;
      const value = node.attributes[path];
      if (value === undefined) {
        sendJson(ws, {
          message_id: messageId,
          error_code: 1,
          details: `Attribute not found: ${path}`,
        });
      } else {
        replyResult(ws, messageId, value);
      }
      break;
    }
    case 'write_attribute': {
      const path = args.attribute_path;
      if (path === '1/513/17' || path === '1/513/18' || path === '1/513/0') {
        liveTemp = args.value;
        emitAttributeUpdated(ws, 42, path, args.value);
      }
      replyResult(ws, messageId, null);
      break;
    }
    case 'server_info':
      replyResult(ws, messageId, SERVER_INFO);
      break;
    default:
      replyResult(ws, messageId, null);
  }
}

function start() {
  return new Promise((resolve) => {
    wss = new WebSocketServer({ host: HOST, port: PORT }, () => {
      console.log(`mock-sidecar listening ws://${HOST}:${PORT}/ws`);
      resolve();
    });

    wss.on('connection', (ws) => {
      sendJson(ws, SERVER_INFO);
      ws.on('message', (raw) => {
        try {
          handleCommand(ws, JSON.parse(String(raw)));
        } catch (err) {
          console.error('mock-sidecar command error:', err.message);
        }
      });
    });
  });
}

function stop() {
  return new Promise((resolve) => {
    if (!wss) return resolve();
    wss.close(() => resolve());
  });
}

/** Simulate operator changing setpoint during W0-3 watch window */
function scheduleSetpointBump(delayMs = 8000, delta = 50) {
  setTimeout(() => {
    for (const client of wss?.clients ?? []) {
      liveTemp += delta;
      emitAttributeUpdated(client, 42, '1/513/0', liveTemp);
      console.log(`mock-sidecar: simulated setpoint bump → ${liveTemp}`);
    }
  }, delayMs);
}

import { pathToFileURL } from 'node:url';

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const bumpIdx = process.argv.indexOf('--auto-bump');
  const bumpSec = bumpIdx >= 0 ? Number(process.argv[bumpIdx + 1] ?? 8) : 0;
  await start();
  if (bumpSec > 0) scheduleSetpointBump(bumpSec * 1000, 50);
  process.on('SIGINT', async () => {
    await stop();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await stop();
    process.exit(0);
  });
}

export { start, stop, scheduleSetpointBump, PORT, HOST };
