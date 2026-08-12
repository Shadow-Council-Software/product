import type { AlertPhase, ToneKey } from './types';

/** Tone key -> concrete color (mirrors tokens/okuda.css for SVG fills). */
export const TONE: Record<ToneKey, string> = {
  amber: '#f4a000',
  butterscotch: '#f7c46a',
  peach: '#ff9c6e',
  lavender: '#b9a6e6',
  iceBlue: '#8fc4ff',
  tan: '#c8a98a',
  inactive: '#5a6172',
  red: '#ff2d2d',
  green: '#2f7d4f',
  // Yellow Alert gold — deliberately distinct from chrome amber (#f4a000)
  gold: '#ffcc00',
};

/** Alert hue overlay color, independent of department chrome. null at Normal. */
export function alertHue(phase: AlertPhase): string | null {
  if (phase === 'Red') return TONE.red;
  if (phase === 'Yellow') return TONE.gold;
  return null;
}

/** Across-the-room condition label. null at Normal. */
export function conditionLabel(phase: AlertPhase): string | null {
  if (phase === 'Red') return 'RED ALERT';
  if (phase === 'Yellow') return 'YELLOW ALERT';
  return null;
}

export const INK = '#000000';
export const FIELD = '#0a0a0a';
export const READOUT = '#11151c';
export const MUTED = '#b9c2d6';
export const CREAM = '#f4d7a1';

/** The accent tone for a given alert phase (header/rail energy). */
export function phaseTone(phase: AlertPhase): ToneKey {
  if (phase === 'Red') return 'red';
  if (phase === 'Yellow') return 'amber';
  return 'amber';
}

export function phaseColor(phase: AlertPhase): string {
  return TONE[phaseTone(phase)];
}
