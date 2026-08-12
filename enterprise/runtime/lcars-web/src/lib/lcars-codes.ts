/**
 * Single source of truth for LCARS reference codes.
 *
 * Production gate (LCARS-PRODUCTION-GATE-2026-05-29): reference-code format is
 * `NN-LL-NNN` per subsystem — NN rail ordinal, LL subsystem letters, NNN
 * subsystem number. Panel codes are the short `LLL-NNN` form of the same
 * subsystem number. Shell and framework must both read from this registry.
 */
export const SUBSYSTEM_CODES = {
  ops: { rail: '01-OP-001', panel: 'OPS-001', label: 'Operations' },
  env: { rail: '02-EN-513', panel: 'ENV-513', label: 'Environmental' },
  tac: { rail: '03-TC-204', panel: 'TAC-204', label: 'Tactical' },
  eng: { rail: '04-EG-621', panel: 'ENG-621', label: 'Engineering' },
  sci: { rail: '05-SC-880', panel: 'SCI-880', label: 'Science' },
  conflict: { rail: '06-CF-090', panel: 'CFL-16', label: 'Conflict' },
  alert: { rail: '07-AL-009', panel: 'ALR-009', label: 'Alert Status' },
} as const;

export type SubsystemKey = keyof typeof SUBSYSTEM_CODES;

const LABEL_TO_KEY: Record<string, SubsystemKey> = {
  Operations: 'ops',
  Ops: 'ops',
  Environmental: 'env',
  Environment: 'env',
  Tactical: 'tac',
  Engineering: 'eng',
  Science: 'sci',
  Conflict: 'conflict',
  'Alert Status': 'alert',
};

/** Rail code for a menu label, or null when the label has no registered subsystem. */
export function railCodeForLabel(label: string): string | null {
  const key = LABEL_TO_KEY[label];
  return key ? SUBSYSTEM_CODES[key].rail : null;
}
