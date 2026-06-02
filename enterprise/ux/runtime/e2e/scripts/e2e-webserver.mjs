#!/usr/bin/env node
/**
 * Playwright webServer hook: platform mock engine + UX LCARS.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const uxRuntimeRoot = fileURLToPath(new URL('../..', import.meta.url));
const platformRuntimeRoot = fileURLToPath(new URL('../../../../platform/runtime', import.meta.url));
const children = [];

async function waitOk(url, timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(400);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function start(name, command, args, cwd, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  });
  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[e2e-webserver] ${name} exited with code ${code}`);
    }
  });
  children.push(child);
  return child;
}

async function ensureEngine() {
  try {
    const res = await fetch('http://127.0.0.1:3001/health');
    if (res.ok) return;
  } catch {
    /* start */
  }
  console.log('[e2e-webserver] starting mock engine on :3001 (platform)');
  start('engine', 'npm', ['run', 'dev:engine'], platformRuntimeRoot, {
    MATTER_ADAPTER: 'mock',
    ALERT_STORE: 'memory',
  });
  await waitOk('http://127.0.0.1:3001/health');
}

async function ensureLcars() {
  try {
    const res = await fetch('http://localhost:5173/');
    if (res.ok) return;
  } catch {
    /* start */
  }
  console.log('[e2e-webserver] starting LCARS on :5173 (ux)');
  start('lcars', 'npm', ['run', 'dev:lcars'], uxRuntimeRoot);
  await waitOk('http://localhost:5173/');
}

function shutdown() {
  for (const child of children) {
    try {
      child.kill();
    } catch {
      /* ignore */
    }
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await ensureEngine();
await ensureLcars();
console.log('[e2e-webserver] stack ready');
await new Promise(() => {});
