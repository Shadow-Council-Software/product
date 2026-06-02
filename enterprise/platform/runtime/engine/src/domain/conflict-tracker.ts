/** Sprint 2 conflict detection stub — ART-02/03 entry */

export interface ConflictState {
  active: boolean;
  authorities: string[];
  detectedTs: number | null;
  detail: string | null;
}

const CONFLICT_WINDOW_MS = Number(process.env.CONFLICT_WINDOW_MS ?? 30_000);

export class ConflictTracker {
  private state: ConflictState = {
    active: false,
    authorities: [],
    detectedTs: null,
    detail: null,
  };
  private lastWrites: Array<{ authority: string; ts: number }> = [];

  getState(): ConflictState {
    return { ...this.state };
  }

  recordWrite(authority: string): void {
    const now = Date.now();
    this.lastWrites.push({ authority, ts: now });
    this.lastWrites = this.lastWrites.filter((w) => now - w.ts <= CONFLICT_WINDOW_MS);
    const distinct = [...new Set(this.lastWrites.map((w) => w.authority))];
    if (distinct.length >= 2) {
      this.state = {
        active: true,
        authorities: distinct,
        detectedTs: now,
        detail: 'Competing writes within policy window',
      };
    }
  }

  recordExternalUpdate(authority: string): void {
    this.recordWrite(authority);
  }

  clear(): void {
    this.state = {
      active: false,
      authorities: [],
      detectedTs: null,
      detail: null,
    };
    this.lastWrites = [];
  }

  /** Test hook — simulate Google vs enterprise divergence */
  simulateConflict(authorities: string[] = ['enterprise', 'google']): void {
    this.state = {
      active: true,
      authorities,
      detectedTs: Date.now(),
      detail: 'Simulated authority divergence',
    };
  }
}
