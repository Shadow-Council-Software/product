import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import AdmZip from 'adm-zip';
import type { MatterpakBundle } from './types.js';

const MESH_EXT = new Set(['.obj']);
const TEX_EXT = new Set(['.jpg', '.jpeg', '.png']);
const FLOOR_EXT = new Set(['.png', '.jpg', '.jpeg', '.pdf']);
const CLOUD_EXT = new Set(['.xyz']);

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

/** Unzip Matterpak if needed, then locate OBJ + floor plan assets. */
export function resolveBundle(inputPath: string): MatterpakBundle {
  let rootDir = inputPath;
  if (inputPath.endsWith('.zip') && existsSync(inputPath)) {
    const zip = new AdmZip(inputPath);
    const extractTo = inputPath.replace(/\.zip$/i, '');
    zip.extractAllTo(extractTo, true);
    rootDir = extractTo;
  }
  if (!existsSync(rootDir)) throw new Error(`Bundle path not found: ${inputPath}`);

  const files = walk(rootDir);
  const obj = files.find((f) => MESH_EXT.has(extname(f).toLowerCase()) && !f.includes('floorplan'));
  if (!obj) throw new Error(`No .obj mesh in bundle at ${rootDir}`);

  const mtl = files.find((f) => extname(f).toLowerCase() === '.mtl');
  const texturePaths = files.filter((f) => TEX_EXT.has(extname(f).toLowerCase()));
  const floorPlanPaths = files.filter((f) => {
    const base = f.toLowerCase();
    return FLOOR_EXT.has(extname(f).toLowerCase()) && (base.includes('floor') || base.includes('plan'));
  });
  const pointCloudPath = files.find((f) => CLOUD_EXT.has(extname(f).toLowerCase()));

  return {
    rootDir,
    objPath: obj,
    mtlPath: mtl,
    texturePaths,
    floorPlanPaths,
    pointCloudPath,
  };
}

export function summarizeBundle(bundle: MatterpakBundle): string {
  return [
    `root: ${bundle.rootDir}`,
    `mesh: ${bundle.objPath}`,
    bundle.mtlPath ? `mtl: ${bundle.mtlPath}` : null,
    `textures: ${bundle.texturePaths.length}`,
    `floor plans: ${bundle.floorPlanPaths.length}`,
    bundle.pointCloudPath ? `point cloud: ${bundle.pointCloudPath}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}
