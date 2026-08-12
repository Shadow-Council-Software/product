import { useState } from 'react';
import type { LcarsContext } from '../types';
import { CREAM, INK, MUTED, READOUT, TONE } from '../palette';
import { blockPath } from './geometry';

const ENGINE = import.meta.env.VITE_ENGINE_URL ?? '';
const TEMP_PATH = '1/513/0';
const PRESETS = [19, 21, 23];
const FONT = "'Antonio', 'Oswald', 'Arial Narrow', sans-serif";

export interface SvgEnvironmentalControlProps {
  x: number;
  y: number;
  w: number;
  ctx: LcarsContext;
}

/**
 * Pure-SVG environmental command control — no foreignObject. Tappable SVG blocks
 * for stepper, presets, and engage. Authentic to Starfleet (buttons, not text fields).
 */
export function SvgEnvironmentalControl({ x, y, w, ctx }: SvgEnvironmentalControlProps) {
  const [target, setTarget] = useState(21.5);
  const [message, setMessage] = useState<string | null>(null);
  const disabled = ctx.conflictActive || ctx.clearance === 'Guest';

  function nudge(delta: number) {
    if (disabled) return;
    setTarget((t) => Math.round((t + delta) * 10) / 10);
  }

  async function engage() {
    if (disabled) return;
    try {
      const res = await fetch(`${ENGINE}/api/v1/commands/setpoint`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-clearance': ctx.clearance },
        body: JSON.stringify({ stationId: 'env.nest.primary', path: TEMP_PATH, value: target }),
      });
      const body = (await res.json()) as { outcomeType?: string; message?: string };
      setMessage(`${body.outcomeType ?? 'OK'}: ${body.message ?? 'commanded'}`);
    } catch {
      setMessage('LINK OFFLINE — command not delivered');
    }
  }

  const rowY = y + 8;
  const stepperY = y + 92;
  const presetY = stepperY + 70;
  const engageY = presetY + 64;

  const tappable = (active: boolean) => ({
    style: { cursor: active ? 'pointer' : 'not-allowed' as const },
  });

  return (
    <g fontFamily={FONT}>
      {/* current readout — placeholder: no live snapshot is plumbed into LcarsContext yet */}
      <path d={blockPath(x, rowY, w * 0.6, 72, { tl: 22, bl: 22 })} fill={INK} />
      <text x={x + 18} y={rowY + 24} fill={MUTED} fontSize={11} letterSpacing="1.4">
        CURRENT · PLACEHOLDER — NO LIVE FEED
      </text>
      <text x={x + 18} y={rowY + 60} fill={TONE.butterscotch} fontSize={34} fontWeight={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
        21.5<tspan fontSize={16} fill={MUTED} dx={6}>°C</tspan>
      </text>

      {/* stepper: [-]  value  [+] */}
      <g {...tappable(!disabled)} onClick={() => nudge(-0.5)} role="button" aria-label="Decrease setpoint">
        <path d={blockPath(x, stepperY, 56, 56, { tl: 18, bl: 18 })} fill={disabled ? TONE.inactive : TONE.peach} />
        <text x={x + 28} y={stepperY + 37} fill={INK} fontSize={30} fontWeight={700} textAnchor="middle">−</text>
      </g>
      <path d={blockPath(x + 60, stepperY, 150, 56)} fill={READOUT} />
      <text x={x + 135} y={stepperY + 28} fill={MUTED} fontSize={10} letterSpacing="1.4" textAnchor="middle">TARGET SETPOINT</text>
      <text x={x + 135} y={stepperY + 50} fill={disabled ? TONE.inactive : TONE.iceBlue} fontSize={26} fontWeight={700} textAnchor="middle" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {target.toFixed(1)}°C
      </text>
      <g {...tappable(!disabled)} onClick={() => nudge(0.5)} role="button" aria-label="Increase setpoint">
        <path d={blockPath(x + 214, stepperY, 56, 56, { tr: 18, br: 18 })} fill={disabled ? TONE.inactive : TONE.peach} />
        <text x={x + 242} y={stepperY + 37} fill={INK} fontSize={28} fontWeight={700} textAnchor="middle">＋</text>
      </g>

      {/* presets */}
      {PRESETS.map((p, i) => (
        <g key={p} {...tappable(!disabled)} onClick={() => !disabled && setTarget(p)} role="button" aria-label={`Preset ${p}`}>
          <rect x={x + i * 76} y={presetY} width={68} height={42} rx={21} fill={disabled ? TONE.inactive : TONE.lavender} />
          <text x={x + i * 76 + 34} y={presetY + 28} fill={INK} fontSize={18} fontWeight={700} textAnchor="middle" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {p}°
          </text>
        </g>
      ))}

      {/* engage */}
      <g {...tappable(!disabled)} onClick={() => void engage()} role="button" aria-label="Engage setpoint">
        <path d={blockPath(x, engageY, 260, 48, { tl: 24, bl: 24, tr: 6, br: 6 })} fill={disabled ? TONE.inactive : TONE.amber} />
        <text x={x + 130} y={engageY + 31} fill={INK} fontSize={17} fontWeight={700} letterSpacing="1.5" textAnchor="middle">
          {disabled ? 'LOCKED' : 'ENGAGE SETPOINT'}
        </text>
      </g>

      {(message || disabled) && (
        <text x={x} y={engageY + 74} fill={disabled ? TONE.red : CREAM} fontSize={12} letterSpacing="0.5">
          {disabled
            ? ctx.conflictActive
              ? 'AUTHORITY CONFLICT — COMMANDS LOCKED'
              : 'GUEST PROFILE — READ ONLY'
            : (message ?? '').toUpperCase()}
        </text>
      )}
    </g>
  );
}
