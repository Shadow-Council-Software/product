import type { ReactNode } from 'react';
import { AlertBanner } from '../chrome/AlertBanner';
import { CommandLine } from '../chrome/CommandLine';
import { HealthStrip } from '../chrome/HealthStrip';
import { LcarsArcRail, type ArcSegment } from '../chrome/LcarsArcRail';
import { VesselStatus } from '../chrome/VesselStatus';
import type { AlertSnapshot, ClearanceTier } from '../../lib/types';
import './LcarsBridgeLayout.css';

export interface LcarsBridgeLayoutProps {
  children: ReactNode;
  alert: AlertSnapshot | undefined;
  clearance: ClearanceTier;
  onClearanceChange: (tier: ClearanceTier) => void;
  commandMessage: string;
  onEscalate?: () => void;
  leftArc: ArcSegment[];
  rightArc: ArcSegment[];
  conflictActive?: boolean;
}

export function LcarsBridgeLayout({
  children,
  alert,
  clearance,
  onClearanceChange,
  commandMessage,
  onEscalate,
  leftArc,
  rightArc,
  conflictActive,
}: LcarsBridgeLayoutProps) {
  return (
    <div className="lcars-bridge" data-testid="lcars-bridge">
      <AlertBanner alert={alert} />

      {conflictActive && (
        <div className="lcars-bridge__conflict" data-testid="chrome.conflict" role="alert">
          CONFLICT — dual authority detected. Reconcile before commanding.
        </div>
      )}

      <div className="lcars-bridge__top">
        <VesselStatus alert={alert} clearance={clearance} />
        <label className="lcars-bridge__clearance">
          <span>Session</span>
          <select
            value={clearance}
            onChange={(e) => onClearanceChange(e.target.value as ClearanceTier)}
            data-testid="chrome.session-select"
          >
            <option value="Guest">Guest</option>
            <option value="Crew">Crew</option>
            <option value="Captain">Captain</option>
          </select>
        </label>
      </div>

      <div className="lcars-bridge__grid">
        <LcarsArcRail side="left" segments={leftArc} />
        <main className="lcars-bridge__center" id="ops-main" data-testid="lcars-console">
          {children}
        </main>
        <LcarsArcRail side="right" segments={rightArc} />
      </div>

      <footer className="lcars-bridge__footer">
        <CommandLine message={commandMessage} onEscalate={onEscalate} />
        <HealthStrip />
      </footer>
    </div>
  );
}
