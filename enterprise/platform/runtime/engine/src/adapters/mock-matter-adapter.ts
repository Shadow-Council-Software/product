import {
  NEST_PRIMARY_STATION_ID,
  THERMOSTAT_LOCAL_TEMP,
  type AttributePath,
  type CommandReceipt,
  type CommissioningPayload,
  type MatterAdapterPort,
  type MatterNodeEvent,
  type StationSnapshot,
} from '@enterprise/matter-port';

const DEFAULT_TEMP_C = 21.5;
const FRESHNESS_INTERVAL_MS = Number(process.env.MOCK_FRESHNESS_MS ?? 5000);
const HOUSEHOLD_ROSTER = process.env.MOCK_HOUSEHOLD !== '0';

export class MockMatterAdapter implements MatterAdapterPort {
  private connected = false;
  private tempC = DEFAULT_TEMP_C;
  private handlers = new Set<(event: MatterNodeEvent) => void>();
  private freshnessTimer: ReturnType<typeof setInterval> | null = null;

  async connect(): Promise<void> {
    this.connected = true;
    this.emit({ type: 'sidecar_reconnected' });
    this.freshnessTimer = setInterval(() => {
      this.emit({
        type: 'attribute_updated',
        nodeId: 1,
        path: THERMOSTAT_LOCAL_TEMP,
        value: this.tempC,
      });
    }, FRESHNESS_INTERVAL_MS);
  }

  async disconnect(): Promise<void> {
    if (this.freshnessTimer) {
      clearInterval(this.freshnessTimer);
      this.freshnessTimer = null;
    }
    this.connected = false;
    this.emit({ type: 'sidecar_disconnected', reason: 'mock disconnect' });
  }

  async getStations(): Promise<StationSnapshot[]> {
    this.assertConnected();
    if (!HOUSEHOLD_ROSTER) {
      return [this.thermostatSnapshot()];
    }
    return [
      this.thermostatSnapshot(),
      {
        stationId: 'sec.nest.doorbell.main',
        nodeId: 2,
        available: true,
        attributes: { 'status': 'online (mock)' },
        freshnessTs: Date.now(),
        authority: 'google',
        label: 'Nest Doorbell (mock)',
        deviceKind: 'doorbell',
      },
      {
        stationId: 'tac.nest.camera.main',
        nodeId: 3,
        available: true,
        attributes: { 'status': 'cloud-stream (mock — Tier C)' },
        freshnessTs: Date.now(),
        authority: 'google',
        label: 'Nest Camera (mock)',
        deviceKind: 'camera',
      },
    ];
  }

  async readAttribute(stationId: string, path: AttributePath): Promise<unknown> {
    this.assertConnected();
    if (stationId !== NEST_PRIMARY_STATION_ID) {
      throw new Error(`Mock read not implemented for ${stationId}`);
    }
    if (path === THERMOSTAT_LOCAL_TEMP) {
      return this.tempC;
    }
    throw new Error(`Unknown attribute path: ${path}`);
  }

  async writeAttribute(
    stationId: string,
    path: AttributePath,
    value: unknown
  ): Promise<CommandReceipt> {
    this.assertConnected();
    if (stationId !== NEST_PRIMARY_STATION_ID) {
      return {
        receiptId: crypto.randomUUID(),
        pending: false,
        outcomeType: 'UnableToComply',
      };
    }
    if (path !== THERMOSTAT_LOCAL_TEMP) {
      return {
        receiptId: crypto.randomUUID(),
        pending: false,
        outcomeType: 'UnableToComply',
      };
    }
    const next = Number(value);
    if (!Number.isFinite(next)) {
      return {
        receiptId: crypto.randomUUID(),
        pending: false,
        outcomeType: 'Denied',
      };
    }
    this.tempC = next;
    this.emit({
      type: 'attribute_updated',
      nodeId: 1,
      path: THERMOSTAT_LOCAL_TEMP,
      value: this.tempC,
    });
    return {
      receiptId: crypto.randomUUID(),
      pending: false,
      outcomeType: 'Acknowledged',
    };
  }

  subscribe(handler: (event: MatterNodeEvent) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async openCommissioningWindow(_nodeId: number): Promise<CommissioningPayload> {
    this.assertConnected();
    return { pairingCode: 'MOCK-1234' };
  }

  private thermostatSnapshot(): StationSnapshot {
    return {
      stationId: NEST_PRIMARY_STATION_ID,
      nodeId: 1,
      available: true,
      attributes: { [THERMOSTAT_LOCAL_TEMP]: this.tempC },
      freshnessTs: Date.now(),
      authority: 'enterprise',
      label: 'Nest Thermostat (mock)',
      deviceKind: 'thermostat',
    };
  }

  private emit(event: MatterNodeEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }

  private assertConnected(): void {
    if (!this.connected) {
      throw new Error('MockMatterAdapter not connected');
    }
  }
}
