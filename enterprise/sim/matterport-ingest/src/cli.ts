#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';
import { resolveBundle, summarizeBundle } from './discover-bundle.js';
import { loadLayout, mergeGeometryIntoLayout, writeLayout } from './merge-layout.js';
import { parseObjBounds } from './parse-obj-bounds.js';
import { buildParityReport, writeParityReport } from './parity-report.js';
import { copyToUnityStreamingAssets, publishBundle } from './publish-assets.js';
import type { AlignmentManifest } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SIM_ROOT = join(__dirname, '../..');
const DEFAULT_LAYOUT = join(SIM_ROOT, 'layouts/onimurasame-residence-2026-05-24.json');
const PUBLISH_ROOT = join(SIM_ROOT, 'layouts/matterport/published');
const UNITY_STREAMING = join(
  SIM_ROOT,
  'unity/ENTERPRISE.HouseHarness/Assets/StreamingAssets/matterport'
);

function usage(): void {
  console.log(`ENTERPRISE Matterport ingest

Usage:
  npm run ingest -- <command> [options]

Commands:
  discover <path>              List OBJ / floor plan / textures in Matterpak folder or .zip
  ingest --bundle <path>       Full pipeline: publish assets, merge layout, parity report
  parity --layout <path>       Re-run parity on existing published bundle + alignment manifest

Options (ingest):
  --bundle <path>              Matterpak extract dir or .zip (also: layouts/matterport/inbox/)
  --layout <path>              Survey house-layout.json (default: onimurasame-residence)
  --alignment <path>           alignment-manifest.json (required for ingest)
  --model-slug <id>            Publish folder name (default: matterportModelId from manifest)
  --unity                      Copy published mesh to Unity StreamingAssets/matterport
  --out <path>                 Output house-layout.json path (default: layouts/house-layout.json)

Environment (optional API fetch — future):
  MATTERPORT_API_TOKEN         Model API token (order Matterpak, download assets)
  MATTERPORT_MODEL_ID          Space model id
`);
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = { _: argv[0] ?? 'help' };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else out[key] = true;
    } else if (!out._ || out._ === 'help') {
      out._ = a;
    }
  }
  return out;
}

async function cmdDiscover(path: string): Promise<void> {
  const bundle = resolveBundle(path);
  console.log(summarizeBundle(bundle));
  const bounds = await parseObjBounds(bundle.objPath);
  console.log(`vertices: ${bounds.vertexCount}`);
  console.log(`bounds min: ${bounds.min.join(', ')} max: ${bounds.max.join(', ')}`);
}

async function cmdIngest(args: Record<string, string | boolean>): Promise<void> {
  const bundlePath = String(args.bundle ?? '');
  if (!bundlePath) {
    console.error('Missing --bundle <path-to-matterpak.zip-or-folder>');
    process.exit(1);
  }
  const alignmentPath = String(args.alignment ?? '');
  if (!alignmentPath || !existsSync(alignmentPath)) {
    console.error('Missing or invalid --alignment <alignment-manifest.json>');
    console.error('See layouts/matterport/alignment-manifest.example.json');
    process.exit(1);
  }

  const alignment = JSON.parse(readFileSync(alignmentPath, 'utf8')) as AlignmentManifest;
  const layoutPath = String(args.layout ?? DEFAULT_LAYOUT);
  const outPath = String(args.out ?? join(SIM_ROOT, 'layouts/house-layout.json'));
  const modelSlug = String(args['model-slug'] ?? alignment.matterportModelId);

  const bundle = resolveBundle(bundlePath);
  console.log('Discovered Matterpak:\n' + summarizeBundle(bundle));

  const bounds = await parseObjBounds(bundle.objPath);
  const published = publishBundle(bundle, alignment, PUBLISH_ROOT, modelSlug);

  const layout = loadLayout(layoutPath);
  const parityPath = join(published.publishDir, 'parity-report.json');
  const report = buildParityReport(layout, bounds, alignment);
  writeParityReport(parityPath, report);

  const merged = mergeGeometryIntoLayout(layout, published, alignment, bounds, relativeParityUri(parityPath));
  if (report.passed) {
    merged.geometry!.alignment.verifiedAt = report.generatedAt;
    const src = merged.metadata.sources?.find((s) => s.uri.includes('matterport'));
    if (src) src.scaleVerified = true;
  }

  writeLayout(outPath, merged);
  console.log(`\n✓ Published mesh → ${published.publishDir}`);
  console.log(`✓ Layout written → ${outPath}`);
  console.log(`  Parity: ${report.passed ? 'PASS' : 'FAIL'} (${report.checks.filter((c) => !c.passed).length} failing checks)`);
  console.log(`  Report → ${parityPath}`);

  if (args.unity) {
    copyToUnityStreamingAssets(published, UNITY_STREAMING);
    console.log(`✓ Unity StreamingAssets → ${UNITY_STREAMING}`);
  }

  if (!report.passed) process.exit(2);
}

async function cmdParity(args: Record<string, string | boolean>): Promise<void> {
  const layoutPath = String(args.layout ?? DEFAULT_LAYOUT);
  const publishDir = String(args['publish-dir'] ?? '');
  if (!publishDir) {
    console.error('Missing --publish-dir <layouts/matterport/published/...>');
    process.exit(1);
  }
  const alignmentPath = join(publishDir, 'alignment-manifest.json');
  const alignment = JSON.parse(readFileSync(alignmentPath, 'utf8')) as AlignmentManifest;
  const layout = loadLayout(layoutPath);
  const obj = join(publishDir, readdirObj(publishDir));
  const bounds = await parseObjBounds(obj);
  const report = buildParityReport(layout, bounds, alignment);
  const parityPath = join(publishDir, 'parity-report.json');
  writeParityReport(parityPath, report);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.passed ? 0 : 2);
}

function readdirObj(dir: string): string {
  const hit = readdirSync(dir).find((f) => f.endsWith('.obj'));
  if (!hit) throw new Error(`No OBJ in ${dir}`);
  return hit;
}

function relativeParityUri(abs: string): string {
  const i = abs.indexOf('enterprise/sim/');
  return i >= 0 ? abs.slice(i + 'enterprise/sim/'.length) : abs;
}

const args = parseArgs(process.argv.slice(2));
const cmd = String(args._);

try {
  if (cmd === 'discover') {
    const path = String(args.path ?? process.argv[3] ?? '');
    if (!path) {
      console.error('Usage: ingest discover <path-to-zip-or-folder>');
      process.exit(1);
    }
    await cmdDiscover(path);
  }
  else if (cmd === 'ingest') await cmdIngest(args);
  else if (cmd === 'parity') await cmdParity(args);
  else {
    usage();
    process.exit(cmd === 'help' ? 0 : 1);
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
