import { readFileSync, writeFileSync } from 'node:fs';
import type { ObjBounds } from './parse-obj-bounds.js';
import type { AlignmentManifest, HouseLayout, HouseLayoutGeometry } from './types.js';
import type { PublishedBundle } from './publish-assets.js';

export function loadLayout(path: string): HouseLayout {
  return JSON.parse(readFileSync(path, 'utf8')) as HouseLayout;
}

export function mergeGeometryIntoLayout(
  layout: HouseLayout,
  published: PublishedBundle,
  alignment: AlignmentManifest,
  bounds: ObjBounds,
  parityReportUri?: string
): HouseLayout {
  const geometry: HouseLayoutGeometry = {
    source: 'matterport',
    matterportModelId: alignment.matterportModelId,
    mesh: {
      format: 'obj',
      uri: published.meshRelativeUri,
      materialUri: published.materialRelativeUri,
      textureUris: published.textureRelativeUris,
      transform: {
        position: alignment.transform.position,
        rotationEulerDeg: alignment.transform.rotationEulerDeg,
        scale: alignment.transform.scale,
      },
    },
    alignment: {
      surveyRef: alignment.surveyRef,
      manifestUri: relativeUri(published.manifestPath),
      maxWallDeltaM: alignment.parityTargets?.maxWallDeltaM ?? 0.01,
      verifiedAt: new Date().toISOString(),
      parityReportUri,
    },
    bounds: {
      min: bounds.min,
      max: bounds.max,
      extentM: [
        bounds.max[0] - bounds.min[0],
        bounds.max[1] - bounds.min[1],
        bounds.max[2] - bounds.min[2],
      ],
    },
  };

  const sources = layout.metadata.sources ?? [];
  if (!sources.some((s) => s.uri.includes('matterport'))) {
    sources.push({
      title: `Matterport scan (${alignment.matterportModelId})`,
      uri: published.meshRelativeUri,
      scaleVerified: false,
      notes: 'Run parity report after alignment; set scaleVerified when within tolerance',
    });
  }

  return {
    ...layout,
    metadata: { ...layout.metadata, sources },
    geometry,
  };
}

function relativeUri(absPath: string): string {
  const idx = absPath.indexOf('enterprise/sim/');
  if (idx >= 0) return absPath.slice(idx + 'enterprise/sim/'.length);
  return absPath;
}

export function writeLayout(path: string, layout: HouseLayout): void {
  writeFileSync(path, JSON.stringify(layout, null, 2) + '\n');
}
