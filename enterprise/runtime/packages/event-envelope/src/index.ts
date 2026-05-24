export const EVENT_SCHEMA_VERSION = 1 as const;

export type DomainEventType =
  | 'StationUpdated'
  | 'SetpointCommanded'
  | 'ConflictDetected'
  | 'AlertPhaseChanged';

export interface EventEnvelopeV1<T = unknown> {
  schemaVersion: typeof EVENT_SCHEMA_VERSION;
  eventId: string;
  type: DomainEventType;
  timestamp: number;
  payload: T;
}

export function isEventEnvelopeV1(value: unknown): value is EventEnvelopeV1 {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    o.schemaVersion === EVENT_SCHEMA_VERSION &&
    typeof o.eventId === 'string' &&
    typeof o.type === 'string' &&
    typeof o.timestamp === 'number' &&
    'payload' in o
  );
}

export function createEventEnvelope<T>(
  type: DomainEventType,
  payload: T,
  eventId = crypto.randomUUID()
): EventEnvelopeV1<T> {
  return {
    schemaVersion: EVENT_SCHEMA_VERSION,
    eventId,
    type,
    timestamp: Date.now(),
    payload,
  };
}
