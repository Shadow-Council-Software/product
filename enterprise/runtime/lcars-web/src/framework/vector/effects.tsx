import { motion, useReducedMotion } from 'framer-motion';
import type { AlertPhase } from '../types';

/**
 * Reusable native SVG filter definitions for LCARS "fancy" effects. These are
 * built in-house (no dependency) per the effects-stack decision: Motion drives
 * declarative motion, GSAP handles advanced timelines, and native SVG filters
 * supply textures (nebula / plasma / glow). Mount <LcarsFilters/> once per SVG.
 *
 * Performance note (from research): animated filters are costly if many run at
 * once, so we animate at most one slow filter per screen — consistent with the
 * Okuda "one moving element at rest" law.
 *
 * SMIL <animate> children are omitted under prefers-reduced-motion so the
 * filters render as static textures (lcars-ux-framework.md §4).
 */
export function LcarsFilters() {
  const reduced = useReducedMotion();
  return (
    <defs>
      {/* soft additive glow for energetic elements */}
      <filter id="lcars-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* drifting nebula cloud (fractal noise tinted blue) */}
      <filter id="lcars-nebula" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.011 0.018" numOctaves="3" seed="17" result="n">
          {!reduced && (
            <animate
              attributeName="baseFrequency"
              dur="42s"
              values="0.011 0.018;0.016 0.024;0.011 0.018"
              repeatCount="indefinite"
            />
          )}
        </feTurbulence>
        <feColorMatrix
          in="n"
          type="matrix"
          values="0 0 0 0 0.05  0 0 0 0 0.13  0 0 0 0 0.30  0 0 0 0.85 0"
        />
      </filter>

      {/* red-shifted nebula for Red Alert */}
      <filter id="lcars-nebula-red" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.014 0.02" numOctaves="3" seed="17" result="n">
          {!reduced && (
            <animate
              attributeName="baseFrequency"
              dur="18s"
              values="0.014 0.02;0.02 0.03;0.014 0.02"
              repeatCount="indefinite"
            />
          )}
        </feTurbulence>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.32  0 0 0 0 0.04  0 0 0 0 0.06  0 0 0 0.85 0" />
      </filter>

      {/* energy displacement for plasma conduits */}
      <filter id="lcars-energy" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="turbulence" baseFrequency="0.008 0.05" numOctaves="2" seed="3" result="n">
          {!reduced && (
            <animate attributeName="baseFrequency" dur="6s" values="0.008 0.05;0.012 0.08;0.008 0.05" repeatCount="indefinite" />
          )}
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
}

export interface BackgroundProps {
  x: number;
  y: number;
  width: number;
  height: number;
  alertPhase: AlertPhase;
}

/** Nebula cloud + faint grid — for command/science/ops surfaces. */
export function NebulaField({ x, y, width, height, alertPhase }: BackgroundProps) {
  const reduced = useReducedMotion();
  const nebula = alertPhase === 'Red' ? 'url(#lcars-nebula-red)' : 'url(#lcars-nebula)';
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={width} height={height} fill="#04060c" />
      <rect x={x} y={y} width={width} height={height} filter={nebula} opacity={0.9} />
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke={alertPhase === 'Red' ? '#ff5a5a' : '#1b3a63'}
        strokeWidth={1}
        initial={false}
        animate={reduced ? { opacity: 0.15 } : { opacity: [0.08, 0.2, 0.08] }}
        transition={reduced ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </g>
  );
}

/** Vertical energy conduits with glow — for engineering surfaces. */
export function EnergyField({ x, y, width, height, alertPhase }: BackgroundProps) {
  const reduced = useReducedMotion();
  const hue = alertPhase === 'Red' ? '#ff5a5a' : '#5b8bff';
  const conduits = 5;
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={width} height={height} fill="#05070d" />
      {Array.from({ length: conduits }, (_, i) => {
        const cx = x + ((i + 0.5) * width) / conduits;
        return (
          <g key={i} filter="url(#lcars-glow)">
            <line x1={cx} y1={y} x2={cx} y2={y + height} stroke="#13203a" strokeWidth={6} />
            {!reduced && (
              <motion.circle
                cx={cx}
                r={5}
                fill={hue}
                initial={{ opacity: 0 }}
                animate={{ cy: [y + height, y], opacity: [0, 0.9, 0] }}
                transition={{ duration: alertPhase === 'Red' ? 1.4 : 3 + i * 0.4, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
