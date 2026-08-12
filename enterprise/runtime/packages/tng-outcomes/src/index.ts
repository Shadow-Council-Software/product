import type { OutcomeType } from '@enterprise/matter-port';

export interface OutcomePayload {
  outcomeType: OutcomeType;
  message: string;
  cause?: string | null;
  remediation?: string | null;
  receiptId: string;
  freshnessTs: number;
}

const OUTCOME_TYPES: OutcomeType[] = [
  'Acknowledged',
  'Pending',
  'Verified',
  'Denied',
  'UnableToComply',
  'Warning',
];

export function isOutcomeType(value: unknown): value is OutcomeType {
  return typeof value === 'string' && OUTCOME_TYPES.includes(value as OutcomeType);
}

export function isOutcomePayload(value: unknown): value is OutcomePayload {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    isOutcomeType(o.outcomeType) &&
    typeof o.message === 'string' &&
    typeof o.receiptId === 'string' &&
    typeof o.freshnessTs === 'number'
  );
}

export function createOutcome(
  outcomeType: OutcomeType,
  message: string,
  extras: Partial<Pick<OutcomePayload, 'cause' | 'remediation' | 'receiptId' | 'freshnessTs'>> = {}
): OutcomePayload {
  return {
    outcomeType,
    message,
    cause: extras.cause ?? null,
    remediation: extras.remediation ?? null,
    receiptId: extras.receiptId ?? crypto.randomUUID(),
    freshnessTs: extras.freshnessTs ?? Date.now(),
  };
}
