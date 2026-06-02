import WebSocket from 'ws';
import { MatterClient } from '@matter-server/ws-client';
import {
  NEST_PRIMARY_STATION_ID,
  THERMOSTAT_LOCAL_TEMP,
  type AttributePath,
  type CommandReceipt,
  type CommissioningPayload,
  type DeviceKind,
  type MatterAdapterPort,
  type MatterNodeEvent,
  type StationSnapshot,
} from '@enterprise/matter-port';
import { classifyMatterNode, stationIdForNode } from '../matter/node-classify.js';

const RECONNECT_BASE_MS = Number(process.env.OHF_RECONNECT_BASE_MS ?? 1000);
const RECONNECT_MAX_MS = Number(process.env.OHF_RECONNECT_MAX_MS ?? 30_000);

const TEMP_PROBE_PATHS: AttributePath[] = [
  THERMOSTAT_LOCAL_TEMP,
  '1/1026/0',
  '1/513/17',
  '1/513/18',
];

function matterTempFromRaw(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return NaN;
  return n / 100;
}

function matterTempToRaw(celsius: number): number {
  return Math.round(celsius * 100);
}

interface NodeEntry {
  nodeId: number;
  stationId: string;
  deviceKind: DeviceKind;
  label: string;
}

export class OhfSidecarAdapter implements MatterAdapterPort {
  private client: MatterClient | null = null;
  private connected = false;
  private handlers = new Set<(event: MatterNodeEvent) => void>();
  private nodes = new Map<number, NodeEntry>();
  private primaryNodeId: number | null = null;
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
    this.nodes.clear();
    this.primaryNodeId = null;
  }

  async getStations(): Promise<StationSnapshot[]> {
    this.assertConnected();
    const out: StationSnapshot[] = [];
    for (const entry of this.nodes.values()) {
      const snap = await this.buildSnapshot(entry);
      if (snap) out.push(snap);
    }
    return out.sort((a, b) => a.stationId.localeCompare(b.stationId));
  }

  async readAttribute(stationId: string, path: AttributePath): Promise<unknown> {
    this.assertConnected();
    const nodeId = this.resolveNodeId(stationId);
    if (!this.client || nodeId == null) {
      throw new Error('No Matter node for station');
    }
    const raw = await this.client.readAttribute(nodeId, path);
    if (path === THERMOSTAT_LOCAL_TEMP || path === '1/1026/0') {
      return matterTempFromRaw(raw);
    }
    return raw;
  }

  async writeAttribute(
    stationId: string,
    path: AttributePath,
    value: unknown
  ): Promise<CommandReceipt> {
    this.assertConnected();
    const nodeId = this.resolveNodeId(stationId);
    if (!this.client || nodeId == null) {
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
      await this.client.writeAttribute(nodeId, path, raw);
      this.emit({
        type: 'attribute_updated',
        nodeId,
        path,
        value: celsius,
      });
      return {
        receiptId: crypto.randomUUID(),
        pending: false,
        outcomeType: 'Acknowledged',
      };
    } catch {
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

  private resolveNodeId(stationId: string): number | null {
    for (const [nodeId, entry] of this.nodes) {
      if (entry.stationId === stationId) return nodeId;
    }
    return this.primaryNodeId;
  }

  private async connectOnce(url: string): Promise<void> {
    const client = new MatterClient(url, (u) => new WebSocket(u) as never);
    client.addEventListener('nodes_changed', () => {
      void this.refreshAllNodes(client);
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
    await this.refreshAllNodes(client);
    this.emit({ type: 'sidecar_reconnected' });
  }

  private async refreshAllNodes(client: MatterClient): Promise<void> {
    const record = client.nodes as Record<string, { node_id: number }>;
    const list = Object.values(record ?? {});
    const seen = new Set<number>();

    for (const raw of list) {
      const nodeId = raw?.node_id;
      if (nodeId == null || seen.has(nodeId)) continue;
      seen.add(nodeId);
      const { deviceKind, label } = classifyMatterNode(JSON.stringify(raw));
      const stationId = stationIdForNode(nodeId, deviceKind);
      this.nodes.set(nodeId, { nodeId, stationId, deviceKind, label });
      this.emit({ type: 'node_added', nodeId });
    }

    let primary: number | null = null;
    for (const entry of this.nodes.values()) {
      if (entry.deviceKind === 'thermostat') {
        primary = entry.nodeId;
        break;
      }
    }
    if (primary == null && this.nodes.size > 0) {
      primary = [...this.nodes.keys()][0] ?? null;
    }
    this.primaryNodeId = primary;
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

  private async buildSnapshot(entry: NodeEntry): Promise<StationSnapshot | null> {
    if (!this.client) return null;
    const attributes: Record<string, unknown> = {};
    let available = false;

    if (entry.deviceKind === 'thermostat') {
      for (const path of TEMP_PROBE_PATHS) {
        try {
          const raw = await this.client.readAttribute(entry.nodeId, path);
          if (path === THERMOSTAT_LOCAL_TEMP || path === '1/1026/0') {
            const tempC = matterTempFromRaw(raw);
            if (Number.isFinite(tempC)) {
              attributes[path] = tempC;
              if (path === THERMOSTAT_LOCAL_TEMP) available = true;
            }
          } else {
            attributes[path] = raw;
          }
        } catch {
          /* probe optional paths */
        }
      }
    }

    return {
      stationId: entry.stationId,
      nodeId: entry.nodeId,
      available: available || entry.deviceKind !== 'thermostat',
      attributes,
      freshnessTs: Date.now(),
      authority: 'enterprise',
      label: `${entry.label} (node ${entry.nodeId})`,
      deviceKind: entry.deviceKind,
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
