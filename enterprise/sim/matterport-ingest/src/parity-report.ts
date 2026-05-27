import { writeFileSync } from 'node:fs';
import type { AlignmentManifest, HouseLayout, Vec2 } from './types.js';
import type { ObjBounds } from './parse-obj-bounds.js';

export interface ParityReport {
  generatedAt: string;
  surveyRef: string;
  matterportModelId: string;
  passed: boolean;
  checks: Array<{
    id: string;
    label: string;
    passed: boolean;
    expected?: number | string;
    actual?: number | string;
    deltaM?: number;
    toleranceM?: number;
  }>;
  controlPointResults?: Array<{
    label: string;
    deltaM: number;
    passed: boolean;
  }>;
}

function longestWallM(poly: Vec2[]): number {
  let max = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, z1] = poly[i];
    const [x2, z2] = poly[(i + 1) % poly.length];
    const len = Math.hypot(x2 - x1, z2 - z1);
    if (len > max) max = len;
  }
  return max;
}

export function buildParityReport(
  layout: HouseLayout,
  bounds: ObjBounds,
  alignment: AlignmentManifest
): ParityReport {
  const maxWall = alignment.parityTargets?.maxWallDeltaM ?? 0.01;
  const checks: ParityReport['checks'] = [];

  const surveyPolys = layout.rooms.map((r) => r.floorPolygon);
  const surveyMinX = Math.min(...surveyPolys.flatMap((p) => p.map((v) => v[0])));
  const surveyMaxX = Math.max(...surveyPolys.flatMap((p) => p.map((v) => v[0])));
  const surveyMinZ = Math.min(...surveyPolys.flatMap((p) => p.map((v) => v[1])));
  const surveyMaxZ = Math.max(...surveyPolys.flatMap((p) => p.map((v) => v[1])));

  const surveySpanX = surveyMaxX - surveyMinX;
  const surveySpanZ = surveyMaxZ - surveyMinZ;
  const meshSpanX = bounds.max[0] - bounds.min[0];
  const meshSpanZ = bounds.max[2] - bounds.min[2];

  const deltaX = Math.abs(surveySpanX - meshSpanX * alignment.transform.scale[0]);
  const deltaZ = Math.abs(surveySpanZ - meshSpanZ * alignment.transform.scale[2]);

  checks.push({
    id: 'footprint-span-x',
    label: 'Building span X (survey vs mesh)',
    passed: deltaX <= maxWall * 2,
    expected: surveySpanX,
    actual: meshSpanX * alignment.transform.scale[0],
    deltaM: deltaX,
    toleranceM: maxWall * 2,
  });
  checks.push({
    id: 'footprint-span-z',
    label: 'Building span Z (survey vs mesh)',
    passed: deltaZ <= maxWall * 2,
    expected: surveySpanZ,
    actual: meshSpanZ * alignment.transform.scale[2],
    deltaM: deltaZ,
    toleranceM: maxWall * 2,
  });

  const longestSurvey = Math.max(...layout.rooms.map((r) => longestWallM(r.floorPolygon)));
  const longestMesh = Math.max(meshSpanX, meshSpanZ) * Math.max(...alignment.transform.scale);
  checks.push({
    id: 'longest-wall',
    label: 'Longest surveyed wall vs mesh extent',
    passed: Math.abs(longestSurvey - longestMesh) <= maxWall * 3,
    expected: longestSurvey,
    actual: longestMesh,
    deltaM: Math.abs(longestSurvey - longestMesh),
    toleranceM: maxWall * 3,
  });

  const controlPointResults =
    alignment.controlPoints?.map((cp) => {
      const dx = cp.surveyPosition[0] - cp.meshPosition[0];
      const dy = cp.surveyPosition[1] - cp.meshPosition[1];
      const dz = cp.surveyPosition[2] - cp.meshPosition[2];
      const deltaM = Math.hypot(dx, dy, dz);
      const tol = cp.toleranceM ?? 0.01;
      return { label: cp.label, deltaM, passed: deltaM <= tol };
    }) ?? [];

  for (const cp of controlPointResults) {
    checks.push({
      id: `control-${cp.label}`,
      label: `Control point: ${cp.label}`,
      passed: cp.passed,
      deltaM: cp.deltaM,
      toleranceM: alignment.controlPoints?.find((c) => c.label === cp.label)?.toleranceM ?? 0.01,
    });
  }

  const passed = checks.every((c) => c.passed);
  return {
    generatedAt: new Date().toISOString(),
    surveyRef: alignment.surveyRef,
    matterportModelId: alignment.matterportModelId,
    passed,
    checks,
    controlPointResults: controlPointResults.length ? controlPointResults : undefined,
  };
}

export function writeParityReport(path: string, report: ParityReport): void {
  writeFileSync(path, JSON.stringify(report, null, 2) + '\n');
}
