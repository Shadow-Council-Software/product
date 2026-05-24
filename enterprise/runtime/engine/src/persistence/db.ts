import Database from 'better-sqlite3';
import type { AlertPhase } from '../domain/alert-fsm.js';

export interface AlertRow {
  phase: AlertPhase;
  lastTransitionTs: number;
  acknowledgedBy: string | null;
}

export interface AuditEntry {
  id: number;
  action: string;
  actor: string | null;
  detail: string | null;
  createdTs: number;
}

export class AlertStore {
  private db: Database.Database;

  constructor(path = ':memory:') {
    this.db = new Database(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS alert_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        phase TEXT NOT NULL,
        last_transition_ts INTEGER NOT NULL,
        acknowledged_by TEXT
      );
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        actor TEXT,
        detail TEXT,
        created_ts INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS station_registry (
        station_id TEXT PRIMARY KEY,
        node_id INTEGER NOT NULL,
        authority TEXT NOT NULL,
        registered_ts INTEGER NOT NULL
      );
    `);
    const row = this.get();
    if (!row) {
      this.save({ phase: 'Normal', lastTransitionTs: Date.now(), acknowledgedBy: null });
    }
  }

  get(): AlertRow | null {
    const row = this.db
      .prepare('SELECT phase, last_transition_ts, acknowledged_by FROM alert_state WHERE id = 1')
      .get() as
      | { phase: AlertPhase; last_transition_ts: number; acknowledged_by: string | null }
      | undefined;
    if (!row) return null;
    return {
      phase: row.phase,
      lastTransitionTs: row.last_transition_ts,
      acknowledgedBy: row.acknowledged_by,
    };
  }

  save(state: AlertRow): void {
    this.db
      .prepare(
        `INSERT INTO alert_state (id, phase, last_transition_ts, acknowledged_by)
         VALUES (1, @phase, @lastTransitionTs, @acknowledgedBy)
         ON CONFLICT(id) DO UPDATE SET
           phase = excluded.phase,
           last_transition_ts = excluded.last_transition_ts,
           acknowledged_by = excluded.acknowledged_by`
      )
      .run(state);
  }

  audit(action: string, actor: string | null, detail: string | null = null): void {
    this.db
      .prepare(
        'INSERT INTO audit_log (action, actor, detail, created_ts) VALUES (@action, @actor, @detail, @createdTs)'
      )
      .run({ action, actor, detail, createdTs: Date.now() });
  }

  listAudit(limit = 50): AuditEntry[] {
    const rows = this.db
      .prepare(
        'SELECT id, action, actor, detail, created_ts FROM audit_log ORDER BY id DESC LIMIT ?'
      )
      .all(limit) as Array<{
      id: number;
      action: string;
      actor: string | null;
      detail: string | null;
      created_ts: number;
    }>;
    return rows.map((r) => ({
      id: r.id,
      action: r.action,
      actor: r.actor,
      detail: r.detail,
      createdTs: r.created_ts,
    }));
  }

  upsertStation(stationId: string, nodeId: number, authority: string): void {
    this.db
      .prepare(
        `INSERT INTO station_registry (station_id, node_id, authority, registered_ts)
         VALUES (@stationId, @nodeId, @authority, @registeredTs)
         ON CONFLICT(station_id) DO UPDATE SET
           node_id = excluded.node_id,
           authority = excluded.authority,
           registered_ts = excluded.registered_ts`
      )
      .run({ stationId, nodeId, authority, registeredTs: Date.now() });
  }

  close(): void {
    this.db.close();
  }
}
