/** Attribute path: endpoint_id/cluster_id/attribute_id e.g. "1/513/0" */
export type AttributePath = string;

export type ClearanceTier = 'Captain' | 'Crew' | 'Guest';

export type OutcomeType =
  | 'Acknowledged'
  | 'Pending'
  | 'Verified'
  | 'Denied'
  | 'UnableToComply'
  | 'Warning';

export interface CommandReceipt {
  receiptId: string;
  pending: boolean;
  outcomeType?: OutcomeType;
}

export interface StationSnapshot {
  stationId: string;
  nodeId: number;
  available: boolean;
  attributes: Record<AttributePath, unknown>;
  freshnessTs: number;
  authority: 'enterprise' | 'google' | 'shared' | 'unknown';
}

export type MatterNodeEvent =
  | { type: 'attribute_updated'; nodeId: number; path: AttributePath; value: unknown }
  | { type: 'node_added'; nodeId: number }
  | { type: 'node_removed'; nodeId: number }
  | { type: 'sidecar_disconnected'; reason: string }
  | { type: 'sidecar_reconnected' };

export interface CommissioningPayload {
  pairingCode?: string;
  manualCode?: string;
}

export interface MatterAdapterPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getStations(): Promise<StationSnapshot[]>;
  readAttribute(stationId: string, path: AttributePath): Promise<unknown>;
  writeAttribute(
    stationId: string,
    path: AttributePath,
    value: unknown
  ): Promise<CommandReceipt>;
  subscribe(handler: (event: MatterNodeEvent) => void): () => void;
  openCommissioningWindow(nodeId: number): Promise<CommissioningPayload>;
}

export const NEST_PRIMARY_STATION_ID = 'env.nest.primary';
export const THERMOSTAT_LOCAL_TEMP = '1/513/0';
