/**
 * SVG path helpers for LCARS elbow geometry.
 *
 * A canonical elbow joins a vertical rail (left) to a horizontal header (top)
 * with concentric outer/inner radii so the limb width stays constant.
 */

export interface ElbowSpec {
  /** Top-left origin. */
  x: number;
  y: number;
  /** Thickness of the vertical limb (rail width). */
  railWidth: number;
  /** Thickness of the horizontal limb (header height). */
  barHeight: number;
  /** Total width and height of the elbow bounding box. */
  width: number;
  height: number;
  /** Outer (convex) corner radius. */
  outer: number;
}

/** Filled L-shaped elbow: vertical limb + horizontal limb + rounded inner sweep. */
export function elbowPath({ x, y, railWidth, barHeight, width, height, outer }: ElbowSpec): string {
  const inner = Math.max(0, outer - Math.min(railWidth, barHeight));
  const right = x + width;
  const bottom = y + height;
  const railRight = x + railWidth;
  const barBottom = y + barHeight;
  return [
    `M ${x + outer} ${y}`,
    `H ${right}`,
    `V ${barBottom}`,
    `H ${railRight + inner}`,
    `A ${inner} ${inner} 0 0 0 ${railRight} ${barBottom + inner}`,
    `V ${bottom}`,
    `H ${x}`,
    `V ${y + outer}`,
    `A ${outer} ${outer} 0 0 1 ${x + outer} ${y}`,
    'Z',
  ].join(' ');
}

/** Rounded-rect path with optional per-corner radii (LCARS block). */
export function blockPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: { tl?: number; tr?: number; br?: number; bl?: number } = {},
): string {
  const tl = r.tl ?? 0;
  const tr = r.tr ?? 0;
  const br = r.br ?? 0;
  const bl = r.bl ?? 0;
  return [
    `M ${x + tl} ${y}`,
    `H ${x + w - tr}`,
    tr ? `A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr}` : '',
    `V ${y + h - br}`,
    br ? `A ${br} ${br} 0 0 1 ${x + w - br} ${y + h}` : '',
    `H ${x + bl}`,
    bl ? `A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl}` : '',
    `V ${y + tl}`,
    tl ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}` : '',
    'Z',
  ]
    .filter(Boolean)
    .join(' ');
}
