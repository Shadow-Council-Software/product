import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';
import type { AlertPhase } from '../types';

export interface ScannerSweepProps {
  x: number;
  y: number;
  width: number;
  height: number;
  alertPhase: AlertPhase;
}

/**
 * GSAP-driven tactical scanner: a sweeping scan bar + a rotating sensor wedge.
 * Demonstrates the adopted GSAP timeline stack on pure SVG. Honors reduced motion.
 */
export function ScannerSweep({ x, y, width, height, alertPhase }: ScannerSweepProps) {
  const reduced = useReducedMotion();
  const scope = useRef<SVGGElement>(null);
  const bar = useRef<SVGGElement>(null);
  const wedge = useRef<SVGGElement>(null);
  const hue = alertPhase === 'Red' ? '#ff4d4d' : '#7fd0ff';
  const speed = alertPhase === 'Red' ? 1.6 : 3.4;
  const cx = x + width / 2;
  const cy = y + height / 2;

  useGSAP(
    () => {
      if (reduced) return;
      gsap.killTweensOf([bar.current, wedge.current]);
      gsap.fromTo(
        bar.current,
        { y: 0 },
        { y: height, duration: speed, ease: 'sine.inOut', repeat: -1, yoyo: true },
      );
      gsap.to(wedge.current, {
        rotation: 360,
        transformOrigin: `${cx}px ${cy}px`,
        duration: speed * 2.4,
        ease: 'none',
        repeat: -1,
      });
    },
    { scope, dependencies: [alertPhase, reduced], revertOnUpdate: true },
  );

  const grid = 6;
  return (
    <g ref={scope} aria-hidden="true">
      <rect x={x} y={y} width={width} height={height} fill="#04070d" />
      {/* tactical grid */}
      {Array.from({ length: grid + 1 }, (_, i) => (
        <line key={`h${i}`} x1={x} y1={y + (i * height) / grid} x2={x + width} y2={y + (i * height) / grid} stroke="#10243f" strokeWidth={1} />
      ))}
      {Array.from({ length: grid + 1 }, (_, i) => (
        <line key={`v${i}`} x1={x + (i * width) / grid} y1={y} x2={x + (i * width) / grid} y2={y + height} stroke="#10243f" strokeWidth={1} />
      ))}

      {/* rotating sensor wedge */}
      <g ref={wedge} opacity={0.5} filter="url(#lcars-glow)">
        <path d={`M ${cx} ${cy} L ${cx} ${cy - Math.min(width, height) / 2} A ${Math.min(width, height) / 2} ${Math.min(width, height) / 2} 0 0 1 ${cx + Math.min(width, height) / 2 * 0.5} ${cy - Math.min(width, height) / 2 * 0.86} Z`} fill={hue} opacity={0.35} />
      </g>
      <circle cx={cx} cy={cy} r={Math.min(width, height) / 2} fill="none" stroke={hue} strokeWidth={1} opacity={0.3} />

      {/* sweeping scan bar */}
      <g ref={bar}>
        <rect x={x} y={y} width={width} height={3} fill={hue} filter="url(#lcars-glow)" />
        <rect x={x} y={y} width={width} height={40} fill={hue} opacity={0.08} />
      </g>
    </g>
  );
}
