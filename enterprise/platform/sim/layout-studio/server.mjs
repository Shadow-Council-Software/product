#!/usr/bin/env node
/**
 * Layout Studio API + static server — http://127.0.0.1:3098
 *
 * Dev:  node server.mjs --dev   (proxies UI to Vite on :5173)
 * Prod: npm run build && node server.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { request as httpRequest } from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const simRoot = resolve(__dirname, '..');
const floorsDir = join(simRoot, 'layouts/floors');
const sourcesDir = join(simRoot, 'layouts/sources');
const manifestPath = join(sourcesDir, 'manifest.json');
const distDir = join(__dirname, 'dist');
const port = Number(process.env.LAYOUT_STUDIO_PORT ?? 3098);
const devMode = process.argv.includes('--dev');
const viteTarget = process.env.VITE_DEV_URL ?? 'http://127.0.0.1:5173';

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function readJson(path, fallback = null) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function sendText(res, status, text) {
  res.writeHead(status, { 'Content-Type': 'text/plain' });
  res.end(text);
}

function validateFloor(data) {
  if (!data || typeof data !== 'object') return 'body must be object';
  if (typeof data.levelId !== 'string') return 'levelId required';
  if (typeof data.label !== 'string') return 'label required';
  if (typeof data.elevation !== 'number') return 'elevation required';
  if (!Array.isArray(data.rooms)) return 'rooms must be array';
  for (const room of data.rooms) {
    if (!room.id || !room.label) return 'each room needs id and label';
    if (!Array.isArray(room.floorPolygon) || room.floorPolygon.length < 3) {
      return `room ${room.id}: floorPolygon needs >= 3 vertices`;
    }
    if (typeof room.floorElevation !== 'number') {
      return `room ${room.id}: floorElevation required`;
    }
  }
  return null;
}

function listFloors() {
  return readdirSync(floorsDir)
    .filter((f) => f.endsWith('.level.json'))
    .map((f) => JSON.parse(readFileSync(join(floorsDir, f), 'utf8')))
    .sort((a, b) => a.levelId.localeCompare(b.levelId));
}

function loadManifest() {
  const manifest = readJson(manifestPath, { sources: [] });
  if (!Array.isArray(manifest.sources)) manifest.sources = [];
  return manifest;
}

function saveManifest(data) {
  if (!data || !Array.isArray(data.sources)) throw new Error('manifest.sources required');
  writeFileSync(manifestPath, JSON.stringify(data, null, 2) + '\n');
  return data;
}

function listSourceFiles() {
  if (!existsSync(sourcesDir)) return [];
  return readdirSync(sourcesDir).filter((f) => f !== 'manifest.json');
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function serveStatic(res, urlPath) {
  const rel = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = join(distDir, rel);
  if (!filePath.startsWith(distDir) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    const index = join(distDir, 'index.html');
    if (existsSync(index)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(readFileSync(index));
      return true;
    }
    return false;
  }
  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
  res.end(readFileSync(filePath));
  return true;
}

function proxyToVite(req, res) {
  const target = new URL(req.url ?? '/', viteTarget);
  const opts = {
    hostname: target.hostname,
    port: target.port,
    path: target.pathname + target.search,
    method: req.method,
    headers: { ...req.headers, host: target.host },
  };
  const proxyReq = httpRequest(opts, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', () => {
    sendText(res, 502, 'Vite dev server unavailable — run npm run dev');
  });
  req.pipe(proxyReq);
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/floors' && req.method === 'GET') {
    sendJson(res, 200, listFloors());
    return;
  }

  const floorMatch = url.pathname.match(/^\/api\/floors\/([^/]+)$/);
  if (floorMatch) {
    const levelId = decodeURIComponent(floorMatch[1]);
    const filePath = join(floorsDir, `${levelId}.level.json`);
    if (req.method === 'GET') {
      if (!existsSync(filePath)) {
        sendJson(res, 404, { error: 'floor not found' });
        return;
      }
      sendJson(res, 200, readJson(filePath));
      return;
    }
    if (req.method === 'PUT') {
      const body = JSON.parse(await readBody(req));
      const err = validateFloor(body);
      if (err) {
        sendJson(res, 400, { error: err });
        return;
      }
      if (body.levelId !== levelId) {
        sendJson(res, 400, { error: 'levelId mismatch' });
        return;
      }
      writeFileSync(filePath, JSON.stringify(body, null, 2) + '\n');
      sendJson(res, 200, body);
      return;
    }
  }

  if (url.pathname === '/api/sources' && req.method === 'GET') {
    sendJson(res, 200, { manifest: loadManifest(), files: listSourceFiles() });
    return;
  }

  if (url.pathname === '/api/sources/manifest.json' && req.method === 'PUT') {
    const body = JSON.parse(await readBody(req));
    try {
      sendJson(res, 200, saveManifest(body));
    } catch (err) {
      sendJson(res, 400, { error: (err).message });
    }
    return;
  }

  const pdfMatch = url.pathname.match(/^\/api\/sources\/pdf\/([^/]+)$/);
  if (pdfMatch && req.method === 'GET') {
    const name = decodeURIComponent(pdfMatch[1]);
    const filePath = join(sourcesDir, name);
    if (!filePath.startsWith(sourcesDir) || !existsSync(filePath)) {
      sendJson(res, 404, { error: 'pdf not found' });
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/pdf' });
    res.end(readFileSync(filePath));
    return;
  }

  const fileMatch = url.pathname.match(/^\/api\/sources\/file\/([^/]+)$/);
  if (fileMatch && req.method === 'GET') {
    const name = decodeURIComponent(fileMatch[1]);
    const filePath = join(sourcesDir, name);
    if (!filePath.startsWith(sourcesDir) || !existsSync(filePath)) {
      sendJson(res, 404, { error: 'file not found' });
      return;
    }
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
    res.end(readFileSync(filePath));
    return;
  }

  if (url.pathname === '/api/pdf-preview.png' && req.method === 'GET') {
    const pdfName = url.searchParams.get('file') ?? 'Scanned_20260524-1944.pdf';
    const pdfPath = join(sourcesDir, pdfName);
    try {
      const png = execSync(`pdftoppm -png -f 1 -l 1 -singlefile "${pdfPath}" -`, {
        encoding: 'buffer',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(png);
    } catch {
      sendJson(res, 501, { error: 'pdftoppm unavailable — use client pdf.js underlay' });
    }
    return;
  }

  if (url.pathname === '/api/compile' && req.method === 'POST') {
    try {
      const mergeOut = execSync('node scripts/merge-layout-floors.mjs', {
        cwd: simRoot,
        encoding: 'utf8',
      });
      const convertOut = execSync('node scripts/convert-layout-for-unity.mjs', {
        cwd: simRoot,
        encoding: 'utf8',
      });
      sendJson(res, 200, { ok: true, merge: mergeOut.trim(), convert: convertOut.trim() });
    } catch (err) {
      sendJson(res, 500, {
        ok: false,
        error: err.stderr?.toString() ?? err.message ?? 'compile failed',
      });
    }
    return;
  }

  sendJson(res, 404, { error: 'not found' });
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

  if (url.pathname.startsWith('/api/')) {
    try {
      await handleApi(req, res, url);
    } catch (err) {
      sendJson(res, 500, { error: err.message ?? 'server error' });
    }
    return;
  }

  if (devMode) {
    proxyToVite(req, res);
    return;
  }

  if (!serveStatic(res, url.pathname)) {
    sendText(res, 404, 'Not found — run npm run build in layout-studio');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Layout Studio: http://127.0.0.1:${port}`);
  if (devMode) console.log(`  Dev proxy → ${viteTarget}`);
  else if (!existsSync(distDir)) console.log('  Warning: dist/ missing — run npm run build or use --dev');
  console.log('  Floors: layouts/floors/*.level.json');
  console.log('  Sources: layouts/sources/');
});
