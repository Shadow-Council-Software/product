#!/usr/bin/env node
/** Per-floor layout preview — http://127.0.0.1:3099 */
import { createServer as httpCreateServer } from 'node:http';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const simRoot = resolve(__dirname, '..');
const floorsDir = join(simRoot, 'layouts/floors');
const masterLayout = join(simRoot, 'layouts/onimurasame-residence-2026-05-24.json');

function ensureMerged() {
  execSync('node scripts/merge-layout-floors.mjs', { cwd: simRoot, stdio: 'pipe' });
}

ensureMerged();

const html = readFileSync(join(__dirname, 'preview.html'), 'utf8');
const layout = JSON.parse(readFileSync(masterLayout, 'utf8'));

const floorFiles = readdirSync(floorsDir).filter((f) => f.endsWith('.level.json'));
const levels = floorFiles.map((f) => JSON.parse(readFileSync(join(floorsDir, f), 'utf8')));

const port = Number(process.env.POC_PREVIEW_PORT ?? 3099);
httpCreateServer((req, res) => {
  if (req.url === '/api/layout') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        metadata: layout.metadata,
        levels,
        devices: layout.devices ?? [],
        stations: layout.stations ?? [],
      }),
    );
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}).listen(port, '127.0.0.1', () => {
  console.log(`Floor layout preview: http://127.0.0.1:${port}`);
  console.log('Edit layouts/floors/*.level.json — one floor at a time.');
});
