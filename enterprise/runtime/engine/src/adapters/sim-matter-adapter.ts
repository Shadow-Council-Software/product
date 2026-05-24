import {
  THERMOSTAT_LOCAL_TEMP,
  type AttributePath,
  type CommandReceipt,
  type CommissioningPayload,
  type MatterAdapterPort,
  type MatterNodeEvent,
  type StationSnapshot,
} from '@enterprise/matter-port';

interface SimSpatialStation {
  stationId: string;
  roomId: string;
  nodeId: number;
  tempC: number;
  targetC: number;
  authority: string;
  freshnessTs: number;
  position: [number, number, number];
}

/** Matter adapter backed by Sim Bridge — no hardware required */
export class SimMatterAdapter implements MatterAdapterPort {
  private baseUrl: string;
  private connected = false;
  private handlers = new Set<(event: MatterNodeEvent) => void>();
  private ws: WebSocket | null = null;
  private stations = new Map<string, SimSpatialStation>();

  constructor(baseUrl = process.env.SIM_BRIDGE_URL ?? 'http://127.0.0.1:3002') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async connect(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) {
      throw new Error(
        `UnableToComply: Sim Bridge unreachable at ${this.baseUrl} — start enterprise/sim/bridge`
      );
    }
    await this.refreshStations();
    this.connected = true;
    this.connectEvents();
    this.emit({ type: 'sidecar_reconnected' });
  }

  async disconnect(): Promise<void> {
    this.ws?.close();
    this.ws = null;
    this.connected = false;
    this.emit({ type: 'sidecar_disconnected', reason: 'sim disconnect' });
  }

  async getStations(): Promise<StationSnapshot[]> {
    this.assertConnected();
    await this.refreshStations();
    return [...this.stations.values()].map((s) => this.toSnapshot(s));
  }

  async readAttribute(stationId: string, path: AttributePath): Promise<unknown> {
    this.assertConnected();
    const s = this.stations.get(stationId);
    if (!s) throw new Error(`Unknown station: ${stationId}`);
    if (path === THERMOSTAT_LOCAL_TEMP) return s.tempC;
    throw new Error(`Unknown attribute path: ${path}`);
  }

  async writeAttribute(
    stationId: string,
    path: AttributePath,
    value: unknown
  ): Promise<CommandReceipt> {
    this.assertConnected();
    if (path !== THERMOSTAT_LOCAL_TEMP) {
      return { receiptId: crypto.randomUUID(), pending: false, outcomeType: 'UnableToComply' };
    }
    const targetC = Number(value);
    if (!Number.isFinite(targetC)) {
      return { receiptId: crypto.randomUUID(), pending: false, outcomeType: 'Denied' };
    }
    const res = await fetch(`${this.baseUrl}/sim/command/setpoint`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ stationId, targetC }),
    });
    if (!res.ok) {
      return { receiptId: crypto.randomUUID(), pending: false, outcomeType: 'UnableToComply' };
    }
    await this.refreshStations();
    const s = this.stations.get(stationId);
    if (s) {
      this.emit({
        type: 'attribute_updated',
        nodeId: s.nodeId,
        path: THERMOSTAT_LOCAL_TEMP,
        value: s.tempC,
      });
    }
    return { receiptId: crypto.randomUUID(), pending: false, outcomeType: 'Acknowledged' };
  }

  subscribe(handler: (event: MatterNodeEvent) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async openCommissioningWindow(_nodeId: number): Promise<CommissioningPayload> {
    return { pairingCode: 'SIM-NO-HARDWARE' };
  }

  private async refreshStations(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/sim/spatial-state`);
    if (!res.ok) throw new Error('Sim Bridge spatial-state failed');
    const data = (await res.json()) as { stations: SimSpatialStation[] };
    this.stations.clear();
    for (const s of data.stations) {
      this.stations.set(s.stationId, s);
    }
  }

  private connectEvents(): void {
    const wsUrl = this.baseUrl.replace(/^http/, 'ws') + '/sim/events/stream';
    this.ws = new WebSocket(wsUrl);
    this.ws.onmessage = (msg) => {
      try {
        const event = JSON.parse(String(msg.data)) as { type: string; payload?: Record<string, unknown> };
        if (event.type === 'attribute_updated' && event.payload) {
          const p = event.payload;
          this.emit({
            type: 'attribute_updated',
            nodeId: Number(p.nodeId),
            path: String(p.path),
            value: p.value,
          });
          void this.refreshStations();
        }
      } catch {
        /* ignore parse errors */
      }
    };
  }

  private toSnapshot(s: SimSpatialStation): StationSnapshot {
    return {
      stationId: s.stationId,
      nodeId: s.nodeId,
      available: true,
      attributes: { [THERMOSTAT_LOCAL_TEMP]: s.tempC },
      freshnessTs: s.freshnessTs,
      authority: s.authority === 'google' ? 'google' : 'enterprise',
    };
  }

  private emit(event: MatterNodeEvent): void {
    for (const h of this.handlers) h(event);
  }

  private assertConnected(): void {
    if (!this.connected) throw new Error('SimMatterAdapter not connected');
  }
}
