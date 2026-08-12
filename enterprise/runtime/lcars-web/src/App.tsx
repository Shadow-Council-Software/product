import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ChromeSessionLabel } from './components/ChromeSessionLabel';
import { ClearanceOverlay } from './components/ClearanceOverlay';
import { BattleStationsConfirm } from './components/BattleStationsConfirm';
import { ConflictReconcile } from './components/ConflictReconcile';
import { EnvironmentalPanel } from './components/environmental/EnvironmentalPanel';
import { LcarsVectorShell } from './components/LcarsVectorShell';
import { useStations } from './hooks/useStations';
import { useConflict } from './hooks/useConflict';
import { useEventStream } from './hooks/useEventStream';
import type { ClearanceTier, OutcomePayload } from './lib/types';
import { SUBSYSTEM_CODES } from './lib/lcars-codes';
import './tokens/okuda.css';
import './App.css';

const queryClient = new QueryClient();
const ENGINE = import.meta.env.VITE_ENGINE_URL ?? '';
const MENU_ITEMS = ['Environmental', 'Operations', 'Tactical', 'Alert Status'] as const;
const CLEARANCE_TIERS = ['Guest', 'Crew', 'Captain'] as const;
const CLEARANCE_CODE: Record<ClearanceTier, string> = {
  Guest: 'L1',
  Crew: 'L4',
  Captain: 'L9',
};
type AlertPhase = 'Normal' | 'Yellow' | 'Red';
type MenuItem = (typeof MENU_ITEMS)[number];

const MODE_SUMMARIES: Record<MenuItem, { status: string; detail: string; code: string }> = {
  Environmental: {
    status: 'Live Command Surface',
    detail: 'Station telemetry, setpoint authority, and freshness verification.',
    code: SUBSYSTEM_CODES.env.panel,
  },
  Operations: {
    status: 'Operations Readout',
    detail: 'Mission summary, subsystem posture, and conflict pressure channels.',
    code: SUBSYSTEM_CODES.ops.panel,
  },
  Tactical: {
    status: 'Tactical Posture',
    detail: 'Perimeter watch, authority lock state, and escalation pathways.',
    code: SUBSYSTEM_CODES.tac.panel,
  },
  'Alert Status': {
    status: 'Alert Continuum',
    detail: 'Phase transitions, confirmation gates, and crew response choreography.',
    code: SUBSYSTEM_CODES.alert.panel,
  },
};

interface ClearanceDenial {
  required: ClearanceTier;
  subject: string;
}

function LcarsConsole() {
  const [clearance, setClearance] = useState<ClearanceTier>('Guest');
  const [denial, setDenial] = useState<ClearanceDenial | null>(null);
  const [alertPhase, setAlertPhase] = useState<AlertPhase>('Normal');
  const [showConflictModal, setShowConflictModal] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuItem>('Environmental');
  const { data: stations, isLoading } = useStations();
  const { data: conflict } = useConflict();
  const qc = useQueryClient();
  const primaryStation = stations?.[0];
  const conflictActive = conflict?.active ?? false;

  useEventStream((event) => {
    if (event.type === 'AlertPhaseChanged') {
      const payload = event.payload as { phase?: AlertPhase };
      if (payload.phase) setAlertPhase(payload.phase);
    }
    if (event.type === 'StationUpdated' || event.type === 'SetpointCommanded') {
      void qc.invalidateQueries({ queryKey: ['stations'] });
    }
    if (event.type === 'ConflictDetected') {
      setShowConflictModal(true);
      void qc.invalidateQueries({ queryKey: ['conflict'] });
    }
  });

  async function postAlert(path: string, body?: object): Promise<OutcomePayload> {
    const res = await fetch(`${ENGINE}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-clearance': clearance,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json() as Promise<OutcomePayload>;
  }

  async function reconcileConflict() {
    const res = await fetch(`${ENGINE}/api/v1/system/conflict/reconcile`, {
      method: 'POST',
      headers: { 'x-clearance': clearance },
    });
    if (!res.ok) {
      setDenial({ required: 'Captain', subject: 'Conflict reconcile' });
      return;
    }
    void qc.invalidateQueries({ queryKey: ['conflict'] });
    setShowConflictModal(false);
  }

  function tryEscalate() {
    if (clearance === 'Guest') {
      setDenial({ required: 'Crew', subject: 'Alert escalation' });
      return;
    }
    void postAlert('/api/v1/alerts/escalate');
  }

  const railControls = (
    <>
      <section className="lcars-auth" role="radiogroup" aria-label="Authorization level">
        <h2>Authorization</h2>
        <div className="lcars-auth__tiers">
          {CLEARANCE_TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              className={`lcars-auth__tier ${clearance === tier ? 'is-active' : ''}`}
              role="radio"
              aria-checked={clearance === tier}
              onClick={() => setClearance(tier)}
            >
              <span>{tier}</span>
              <span className="lcars-auth__code">{CLEARANCE_CODE[tier]}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="lcars-alert-readout" data-alert-phase={alertPhase} aria-live="polite">
        <h2>Alert Condition</h2>
        <p>{alertPhase === 'Normal' ? 'Condition Green' : `${alertPhase} Alert`}</p>
      </section>
    </>
  );

  const summary = MODE_SUMMARIES[activeMenu];

  return (
    <div className="lcars-app" data-alert-phase={alertPhase}>
      <ChromeSessionLabel clearance={clearance} />
      <LcarsVectorShell
        alertPhase={alertPhase}
        activeMenu={activeMenu}
        menuItems={MENU_ITEMS}
        onMenuSelect={(menu) => setActiveMenu(menu)}
        controls={railControls}
      >
        {conflictActive && (
          <section className="lcars-conflict-banner" role="status" aria-live="assertive">
            <p>Authority conflict active — setpoint and escalation commands locked out.</p>
            <button
              type="button"
              className="lcars-btn lcars-btn--danger"
              onClick={() => setShowConflictModal(true)}
            >
              Open Override
            </button>
          </section>
        )}

        <section className="lcars-deck">
          <header className="lcars-deck__header">
            <h2>{activeMenu} Control</h2>
            <span className="lcars-deck__code">{summary.code} · DECK 8</span>
          </header>
          {activeMenu !== 'Environmental' ? (
            <section className="lcars-deck__brief" aria-live="polite">
              <p className="lcars-deck__brief-status">{summary.status}</p>
              <p className="lcars-deck__brief-detail">{summary.detail}</p>
            </section>
          ) : isLoading ? (
            <p className="lcars-loading">Acquiring station telemetry…</p>
          ) : (
            <EnvironmentalPanel
              station={primaryStation}
              clearance={clearance}
              conflictActive={conflictActive}
              onSetpointPosted={() => void qc.invalidateQueries({ queryKey: ['stations'] })}
            />
          )}
        </section>

        <section className="lcars-deck lcars-deck--controls">
          <header className="lcars-deck__header">
            <h2>Command Authority</h2>
            <span className="lcars-deck__code">CMD-77</span>
          </header>
          <button type="button" className="lcars-btn" onClick={tryEscalate}>
            Escalate Condition
          </button>
          <BattleStationsConfirm
            phase={alertPhase}
            onCancel={() => setAlertPhase('Yellow')}
            onConfirm={() =>
              void postAlert('/api/v1/alerts/battle-stations', { confirm: true, actor: clearance })
            }
          />
        </section>
      </LcarsVectorShell>

      {denial && (
        <ClearanceOverlay
          required={denial.required}
          subject={denial.subject}
          current={clearance}
          onDismiss={() => setDenial(null)}
        />
      )}

      {showConflictModal && conflictActive && conflict && (
        <ConflictReconcile
          active={conflict.active}
          authorities={conflict.authorities}
          onReconcile={() => void reconcileConflict()}
          onDismiss={() => setShowConflictModal(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LcarsConsole />
    </QueryClientProvider>
  );
}
