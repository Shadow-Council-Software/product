import type { AlertPhase } from '../domain/alert-fsm.js';
import type { AlertRow, AuditEntry } from './db.js';

/** In-memory alert/audit store when better-sqlite3 native bindings are unavailable. */
export class MemoryAlertStore {
  private alert: AlertRow = {
    phase: 'Normal',
    lastTransitionTs: Date.now(),
    acknowledgedBy: null,
  };
  private auditLog: AuditEntry[] = [];
  private stations = new Map<string, { nodeId: number; authority: string; registeredTs: number }>();

  get(): AlertRow | null {
    return { ...this.alert };
  }

  save(state: AlertRow): void {
    this.alert = { ...state };
  }

  audit(action: string, actor: string | null, detail: string | null = null): void {
    this.auditLog.push({
      id: this.auditLog.length + 1,
      action,
      actor,
      detail,
      createdTs: Date.now(),
    });
  }

  listAudit(limit = 50): AuditEntry[] {
    return [...this.auditLog].reverse().slice(0, limit);
  }

  upsertStation(stationId: string, nodeId: number, authority: string): void {
    this.stations.set(stationId, { nodeId, authority, registeredTs: Date.now() });
  }

  close(): void {
    /* no-op */
  }
}

export type { AlertPhase };
