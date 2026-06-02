import type { RoomKind } from './types';

export const KIND_STYLE: Record<
  RoomKind,
  { fill: string; stroke: string; dash: number[] }
> = {
  interior: { fill: '#1e3a5f', stroke: '#5eb3ff', dash: [] },
  gap: { fill: '#4a3520', stroke: '#ffb347', dash: [6, 4] },
  placeholder: { fill: '#222228', stroke: '#666', dash: [4, 4] },
  virtual: { fill: '#1a2838', stroke: '#668899', dash: [2, 4] },
};

export function slugId(prefix: string): string {
  const base = prefix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base || 'room'}-${Date.now().toString(36)}`;
}

export function bounds(polys: number[][][]): {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
} {
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  for (const poly of polys) {
    for (const p of poly) {
      minX = Math.min(minX, p[0]);
      maxX = Math.max(maxX, p[0]);
      minZ = Math.min(minZ, p[1]);
      maxZ = Math.max(maxZ, p[1]);
    }
  }
  if (!Number.isFinite(minX)) {
    return { minX: 0, minZ: 0, maxX: 17.374, maxZ: 9.754 };
  }
  return { minX, minZ, maxX, maxZ };
}

export function polyCenter(poly: number[][]): { x: number; z: number } {
  let sx = 0;
  let sz = 0;
  for (const p of poly) {
    sx += p[0];
    sz += p[1];
  }
  return { x: sx / poly.length, z: sz / poly.length };
}

export function polyArea(poly: number[][]): number {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    a += poly[i][0] * poly[j][1] - poly[j][0] * poly[i][1];
  }
  return Math.abs(a / 2);
}

export function pointInPolygon(x: number, z: number, poly: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const zi = poly[i][1];
    const xj = poly[j][0];
    const zj = poly[j][1];
    const intersect =
      zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function dist2(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
}
