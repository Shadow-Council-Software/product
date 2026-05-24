export type ClearanceTier = 'Captain' | 'Crew' | 'Guest';

export interface StationSnapshot {
  stationId: string;
  nodeId: number;
  available: boolean;
  attributes: Record<string, unknown>;
  freshnessTs: number;
  authority: string;
}

export interface AlertSnapshot {
  phase: 'Normal' | 'Yellow' | 'Red';
  lastTransitionTs: number;
  acknowledgedBy: string | null;
}

export interface EventEnvelopeV1 {
  schemaVersion: 1;
  eventId: string;
  type: string;
  timestamp: number;
  payload: unknown;
}

export interface OutcomePayload {
  outcomeType: string;
  message: string;
  cause?: string | null;
  remediation?: string | null;
  receiptId: string;
  freshnessTs: number;
}
