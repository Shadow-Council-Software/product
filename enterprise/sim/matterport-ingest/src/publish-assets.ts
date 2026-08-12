import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import type { AlignmentManifest, MatterpakBundle } from './types.js';

export interface PublishedBundle {
  publishDir: string;
  meshRelativeUri: string;
  materialRelativeUri?: string;
  textureRelativeUris: string[];
  manifestPath: string;
}

export function publishBundle(
  bundle: MatterpakBundle,
  alignment: AlignmentManifest,
  publishRoot: string,
  modelSlug: string
): PublishedBundle {
  const publishDir = join(publishRoot, modelSlug);
  mkdirSync(publishDir, { recursive: true });

  const meshName = basename(bundle.objPath);
  const meshDest = join(publishDir, meshName);
  copyFileSync(bundle.objPath, meshDest);

  let materialRelativeUri: string | undefined;
  if (bundle.mtlPath) {
    const mtlName = basename(bundle.mtlPath);
    copyFileSync(bundle.mtlPath, join(publishDir, mtlName));
    materialRelativeUri = `layouts/matterport/published/${modelSlug}/${mtlName}`;
  }

  const textureRelativeUris: string[] = [];
  for (const tex of bundle.texturePaths) {
    const name = basename(tex);
    copyFileSync(tex, join(publishDir, name));
    textureRelativeUris.push(`layouts/matterport/published/${modelSlug}/${name}`);
  }

  const manifestPath = join(publishDir, 'alignment-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(alignment, null, 2));

  return {
    publishDir,
    meshRelativeUri: `layouts/matterport/published/${modelSlug}/${meshName}`,
    materialRelativeUri,
    textureRelativeUris,
    manifestPath,
  };
}

export function copyToUnityStreamingAssets(
  published: PublishedBundle,
  unityStreamingDir: string
): void {
  if (!existsSync(unityStreamingDir)) mkdirSync(unityStreamingDir, { recursive: true });
  const srcDir = published.publishDir;
  for (const file of [published.meshRelativeUri.split('/').pop()!, 'alignment-manifest.json']) {
    if (!file) continue;
    const from = join(srcDir, file);
    if (existsSync(from)) copyFileSync(from, join(unityStreamingDir, file));
  }
  const mtl = published.materialRelativeUri?.split('/').pop();
  if (mtl && existsSync(join(srcDir, mtl))) copyFileSync(join(srcDir, mtl), join(unityStreamingDir, mtl));
}
