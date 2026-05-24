import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ChromeSessionLabel } from './components/ChromeSessionLabel';
import { ClearanceOverlay } from './components/ClearanceOverlay';
import { BattleStationsConfirm } from './components/BattleStationsConfirm';
import { ConflictReconcile } from './components/ConflictReconcile';
import { EnvironmentalPanel } from './components/environmental/EnvironmentalPanel';
import { useStations } from './hooks/useStations';
import { useConflict } from './hooks/useConflict';
import { useEventStream } from './hooks/useEventStream';
import type { ClearanceTier, OutcomePayload } from './lib/types';
import './tokens/okuda.css';
import './App.css';

const queryClient = new QueryClient();
const ENGINE = import.meta.env.VITE_ENGINE_URL ?? '';

function LcarsConsole() {
  const [clearance, setClearance] = useState<ClearanceTier>('Guest');
  const [showOverlay, setShowOverlay] = useState(false);
  const [alertPhase, setAlertPhase] = useState<'Normal' | 'Yellow' | 'Red'>('Normal');
  const [showConflictModal, setShowConflictModal] = useState(true);
  const { data: stations, isLoading } = useStations();
  const { data: conflict } = useConflict();
  const qc = useQueryClient();
  const primaryStation = stations?.[0];
  const conflictActive = conflict?.active ?? false;

  useEventStream((event) => {
    if (event.type === 'AlertPhaseChanged') {
      const payload = event.payload as { phase?: 'Normal' | 'Yellow' | 'Red' };
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
    await fetch(`${ENGINE}/api/v1/system/conflict/reconcile`, {
      method: 'POST',
      headers: { 'x-clearance': 'Captain' },
    });
    void qc.invalidateQueries({ queryKey: ['conflict'] });
    setShowConflictModal(false);
  }

  function tryAdjustSetpoint() {
    if (clearance === 'Guest') {
      setShowOverlay(true);
      return;
    }
    void postAlert('/api/v1/alerts/escalate');
  }

  return (
    <div className="lcars-app">
      <ChromeSessionLabel clearance={clearance} />
      <header className="lcars-header">
        <h1>ENTERPRISE Main Computer</h1>
        <label>
          Session clearance
          <select value={clearance} onChange={(e) => setClearance(e.target.value as ClearanceTier)}>
            <option value="Guest">Guest</option>
            <option value="Crew">Crew</option>
            <option value="Captain">Captain</option>
          </select>
        </label>
      </header>

      <main className="lcars-main" data-substrate="white-panel">
        {isLoading ? (
          <p>Loading stations…</p>
        ) : (
          <EnvironmentalPanel
            station={primaryStation}
            clearance={clearance}
            conflictActive={conflictActive}
            onSetpointPosted={() => void qc.invalidateQueries({ queryKey: ['stations'] })}
          />
        )}

        <button type="button" className="lcars-btn" onClick={tryAdjustSetpoint}>
          Escalate alert (demo)
        </button>

        <BattleStationsConfirm
          phase={alertPhase}
          onCancel={() => setAlertPhase('Yellow')}
          onConfirm={() => void postAlert('/api/v1/alerts/battle-stations', { confirm: true, actor: clearance })}
        />

        <section className="alert-status">
          <h2>Alert phase</h2>
          <p>{alertPhase}</p>
        </section>
      </main>

      {showOverlay && (
        <ClearanceOverlay required="Crew" current={clearance} onDismiss={() => setShowOverlay(false)} />
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
