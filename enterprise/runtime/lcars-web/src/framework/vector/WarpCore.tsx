import { motion, useReducedMotion } from 'framer-motion';
import type { AlertPhase } from '../types';

export interface WarpCoreProps {
  /** Center x of the core column. */
  cx: number;
  y: number;
  height: number;
  alertPhase: AlertPhase;
}

/**
 * Vector warp core — a vertical matter/antimatter intermix column with a
 * pulsing plasma flow. Pulse cadence intensifies under alert. The core sits as
 * a decorative-but-diegetic element behind engineering controls.
 */
export function WarpCore({ cx, y, height, alertPhase }: WarpCoreProps) {
  const reduced = useReducedMotion();
  const coreW = 70;
  const x = cx - coreW / 2;
  const segH = 64;
  const segments = Math.max(3, Math.floor(height / segH) - 1);
  const pulse = alertPhase === 'Red' ? 0.7 : alertPhase === 'Yellow' ? 1.1 : 1.6;
  const glow = alertPhase === 'Red' ? '#ff5a5a' : '#7fa8ff';
  const plasma = alertPhase === 'Red' ? '#ffd0d0' : '#dce9ff';

  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id="lcars-warp-plasma" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={plasma} stopOpacity="0.1" />
          <stop offset="50%" stopColor={glow} stopOpacity="0.95" />
          <stop offset="100%" stopColor={plasma} stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="lcars-warp-chamber" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* chamber halo */}
      <rect x={x - 40} y={y} width={coreW + 80} height={height} fill="url(#lcars-warp-chamber)" />

      {/* outer housing */}
      <rect x={x} y={y} width={coreW} height={height} rx={coreW / 2} fill="#0c1018" stroke="#2a3142" strokeWidth={3} />

      {/* plasma column */}
      <motion.rect
        x={x + 14}
        y={y + 10}
        width={coreW - 28}
        height={height - 20}
        rx={(coreW - 28) / 2}
        fill="url(#lcars-warp-plasma)"
        initial={false}
        animate={reduced ? { opacity: 0.8 } : { opacity: [0.55, 1, 0.55] }}
        transition={reduced ? undefined : { duration: pulse, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* travelling intermix pulses */}
      {!reduced &&
        Array.from({ length: segments }, (_, i) => (
          <motion.ellipse
            key={i}
            cx={cx}
            rx={(coreW - 30) / 2}
            ry={16}
            fill={plasma}
            initial={{ opacity: 0 }}
            animate={{
              cy: [y + height - 20, y + 20],
              opacity: [0, 0.85, 0],
            }}
            transition={{
              duration: pulse * 1.6,
              delay: (i * pulse * 1.6) / segments,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

      {/* intermix reaction chambers (top/bottom) */}
      <circle cx={cx} cy={y} r={coreW / 2 + 6} fill="#0c1018" stroke={glow} strokeWidth={3} />
      <circle cx={cx} cy={y + height} r={coreW / 2 + 6} fill="#0c1018" stroke={glow} strokeWidth={3} />
      <motion.circle
        cx={cx}
        cy={y}
        r={coreW / 2 - 8}
        fill={glow}
        initial={false}
        animate={reduced ? { opacity: 0.7 } : { opacity: [0.4, 0.95, 0.4] }}
        transition={reduced ? undefined : { duration: pulse, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx={cx}
        cy={y + height}
        r={coreW / 2 - 8}
        fill={glow}
        initial={false}
        animate={reduced ? { opacity: 0.7 } : { opacity: [0.95, 0.4, 0.95] }}
        transition={reduced ? undefined : { duration: pulse, repeat: Infinity, ease: 'easeInOut' }}
      />
    </g>
  );
}
