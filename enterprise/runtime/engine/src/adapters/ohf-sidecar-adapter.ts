import WebSocket from 'ws';
import { MatterClient } from '@matter-server/ws-client';
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

const RECONNECT_BASE_MS = Number(process.env.OHF_RECONNECT_BASE_MS ?? 1000);
const RECONNECT_MAX_MS = Number(process.env.OHF_RECONNECT_MAX_MS ?? 30_000);

function matterTempFromRaw(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return NaN;
  // Matter temperature is centidegrees Celsius for thermostat cluster
  return n / 100;
}

function matterTempToRaw(celsius: number): number {
  return Math.round(celsius * 100);
}

function pickNestNode(nodes: Record<string, { node_id: number }>): { node_id: number } | null {
  const list = Object.values(nodes ?? {});
  const named = list.find((n) =>
    /nest|thermostat|learning/i.test(JSON.stringify(n))
  );
  return named ?? list[0] ?? null;
}

export class OhfSidecarAdapter implements MatterAdapterPort {
  private client: MatterClient | null = null;
  private connected = false;
  private handlers = new Set<(event: MatterNodeEvent) => void>();
  private nodeId: number | null = null;
  private stationId = NEST_PRIMARY_STATION_ID;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalDisconnect = false;

  async connect(): Promise<void> {
    const url = process.env.OHF_SIDECAR_URL ?? 'ws://127.0.0.1:5580/ws';
    this.intentionalDisconnect = false;
    await this.connectOnce(url);
  }

  async disconnect(): Promise<void> {
    this.intentionalDisconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.client?.disconnect();
    this.client = null;
    this.connected = false;
    this.nodeId = null;
  }

  async getStations(): Promise<StationSnapshot[]> {
    this.assertConnected();
    const snap = await this.buildSnapshot();
    return snap ? [snap] : [];
  }

  async readAttribute(_stationId: string, path: AttributePath): Promise<unknown> {
    this.assertConnected();
    if (!this.client || this.nodeId == null) {
      throw new Error('No Matter node available');
    }
    const raw = await this.client.readAttribute(this.nodeId, path);
    if (path === THERMOSTAT_LOCAL_TEMP) {
      return matterTempFromRaw(raw);
    }
    return raw;
  }

  async writeAttribute(
    _stationId: string,
    path: AttributePath,
    value: unknown
  ): Promise<CommandReceipt> {
    this.assertConnected();
    if (!this.client || this.nodeId == null) {
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
    const celsius = Number(value);
    if (!Number.isFinite(celsius)) {
      return {
        receiptId: crypto.randomUUID(),
        pending: false,
        outcomeType: 'Denied',
      };
    }
    try {
      const raw = matterTempToRaw(celsius);
      await this.client.writeAttribute(this.nodeId, path, raw);
      this.emit({
        type: 'attribute_updated',
        nodeId: this.nodeId,
        path,
        value: celsius,
      });
      return {
        receiptId: crypto.randomUUID(),
        pending: false,
        outcomeType: 'Acknowledged',
      };
    } catch (err) {
      return {
        receiptId: crypto.randomUUID(),
        pending: false,
        outcomeType: 'UnableToComply',
      };
    }
  }

  subscribe(handler: (event: MatterNodeEvent) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async openCommissioningWindow(nodeId: number): Promise<CommissioningPayload> {
    this.assertConnected();
    if (!this.client) throw new Error('OhfSidecarAdapter not connected');
    const result = await this.client.openCommissioningWindow(nodeId);
    return {
      pairingCode: (result as { pairing_code?: string }).pairing_code,
      manualCode: (result as { manual_code?: string }).manual_code,
    };
  }

  private async connectOnce(url: string): Promise<void> {
    const client = new MatterClient(url, (u) => new WebSocket(u) as never);
    client.addEventListener('nodes_changed', () => {
      void this.refreshNode(client);
    });
    try {
      await client.startListening();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(
        `UnableToComply: OHF sidecar unreachable at ${url} — ${message}`
      );
    }
    this.client = client;
    this.connected = true;
    this.reconnectAttempt = 0;
    await this.refreshNode(client);
    this.emit({ type: 'sidecar_reconnected' });
  }

  private async refreshNode(client: MatterClient): Promise<void> {
    const node = pickNestNode(client.nodes as Record<string, { node_id: number }>);
    if (!node) return;
    this.nodeId = node.node_id;
    this.emit({ type: 'node_added', nodeId: node.node_id });
  }

  private scheduleReconnect(url: string): void {
    if (this.intentionalDisconnect || this.reconnectTimer) return;
    this.emit({ type: 'sidecar_disconnected', reason: 'connection lost' });
    this.connected = false;
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** this.reconnectAttempt,
      RECONNECT_MAX_MS
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectOnce(url).catch(() => this.scheduleReconnect(url));
    }, delay);
  }

  private async buildSnapshot(): Promise<StationSnapshot | null> {
    if (!this.client || this.nodeId == null) return null;
    let tempC = NaN;
    try {
      const raw = await this.client.readAttribute(this.nodeId, THERMOSTAT_LOCAL_TEMP);
      tempC = matterTempFromRaw(raw);
    } catch {
      tempC = NaN;
    }
    return {
      stationId: this.stationId,
      nodeId: this.nodeId,
      available: Number.isFinite(tempC),
      attributes: Number.isFinite(tempC)
        ? { [THERMOSTAT_LOCAL_TEMP]: tempC }
        : {},
      freshnessTs: Date.now(),
      authority: 'enterprise',
    };
  }

  private emit(event: MatterNodeEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }

  private assertConnected(): void {
    if (!this.connected || !this.client) {
      throw new Error('OhfSidecarAdapter not connected');
    }
  }
}
