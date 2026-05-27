import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import type { Vec3 } from './types.js';

export interface ObjBounds {
  min: Vec3;
  max: Vec3;
  vertexCount: number;
}

/** Streaming OBJ vertex parser — returns axis-aligned bounds in Matterpak coordinates. */
export async function parseObjBounds(objPath: string): Promise<ObjBounds> {
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  let vertexCount = 0;

  const rl = createInterface({ input: createReadStream(objPath), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.startsWith('v ')) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) continue;
    const x = Number(parts[1]);
    const y = Number(parts[2]);
    const z = Number(parts[3]);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    vertexCount++;
    if (x < min[0]) min[0] = x;
    if (y < min[1]) min[1] = y;
    if (z < min[2]) min[2] = z;
    if (x > max[0]) max[0] = x;
    if (y > max[1]) max[1] = y;
    if (z > max[2]) max[2] = z;
  }

  if (vertexCount === 0) throw new Error(`No vertices in OBJ: ${objPath}`);
  return { min, max, vertexCount };
}

export function extent(bounds: ObjBounds): Vec3 {
  return [bounds.max[0] - bounds.min[0], bounds.max[1] - bounds.min[1], bounds.max[2] - bounds.min[2]];
}
