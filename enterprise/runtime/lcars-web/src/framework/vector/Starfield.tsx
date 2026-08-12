import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { AlertPhase } from '../types';

export interface StarfieldProps {
  width: number;
  height: number;
  alertPhase: AlertPhase;
  /** Deterministic layout seed so screens render consistently. */
  seed?: number;
  count?: number;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Vector starfield background. Stars twinkle gently at rest; under Red Alert
 * they elongate into warp streaks. Fully static under prefers-reduced-motion.
 */
export function Starfield({ width, height, alertPhase, seed = 1701, count = 80 }: StarfieldProps) {
  const reduced = useReducedMotion();
  const warp = alertPhase === 'Red';

  const stars = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: rand() * width,
      y: rand() * height,
      r: 0.4 + rand() * 1.6,
      delay: rand() * 4,
      dur: 2.5 + rand() * 3.5,
      base: 0.25 + rand() * 0.6,
    }));
  }, [width, height, seed, count]);

  return (
    <g aria-hidden="true">
      <rect x={0} y={0} width={width} height={height} fill="#04060c" />
      <defs>
        <radialGradient id="lcars-star-nebula" cx="72%" cy="22%" r="60%">
          <stop offset="0%" stopColor={warp ? '#3a0c12' : '#10233f'} stopOpacity="0.7" />
          <stop offset="100%" stopColor="#04060c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill="url(#lcars-star-nebula)" />
      {stars.map((s, i) =>
        warp && !reduced ? (
          <motion.line
            key={i}
            x1={s.x}
            y1={s.y}
            x2={s.x}
            y2={s.y}
            stroke="#bcd6ff"
            strokeWidth={s.r}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{
              x2: [s.x, s.x + 90 + s.r * 30],
              y2: [s.y, s.y + 8],
              opacity: [0, 0.9, 0],
            }}
            transition={{ duration: 0.9 + s.r * 0.2, delay: s.delay * 0.2, repeat: Infinity, ease: 'easeIn' }}
          />
        ) : (
          <motion.circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#cfe2ff"
            initial={false}
            animate={reduced ? { opacity: s.base } : { opacity: [s.base, s.base + 0.35, s.base] }}
            transition={reduced ? undefined : { duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ),
      )}
    </g>
  );
}
