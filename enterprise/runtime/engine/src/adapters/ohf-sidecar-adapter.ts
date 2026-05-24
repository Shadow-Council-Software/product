import type {
  AttributePath,
  CommandReceipt,
  CommissioningPayload,
  MatterAdapterPort,
  MatterNodeEvent,
  StationSnapshot,
} from '@enterprise/matter-port';

/** Stub for OHF sidecar — connect throws until W0 live rack certificate. */
export class OhfSidecarAdapter implements MatterAdapterPort {
  private handlers = new Set<(event: MatterNodeEvent) => void>();

  async connect(): Promise<void> {
    const url = process.env.OHF_SIDECAR_URL ?? 'ws://127.0.0.1:5580/ws';
    throw new Error(
      `OhfSidecarAdapter not implemented for sprint 1. Configure sidecar at ${url} after W0 live certificate.`
    );
  }

  async disconnect(): Promise<void> {
    /* no-op stub */
  }

  async getStations(): Promise<StationSnapshot[]> {
    throw new Error('OhfSidecarAdapter not connected');
  }

  async readAttribute(_stationId: string, _path: AttributePath): Promise<unknown> {
    throw new Error('OhfSidecarAdapter not connected');
  }

  async writeAttribute(
    _stationId: string,
    _path: AttributePath,
    _value: unknown
  ): Promise<CommandReceipt> {
    throw new Error('OhfSidecarAdapter not connected');
  }

  subscribe(handler: (event: MatterNodeEvent) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async openCommissioningWindow(_nodeId: number): Promise<CommissioningPayload> {
    throw new Error('OhfSidecarAdapter not connected');
  }
}
