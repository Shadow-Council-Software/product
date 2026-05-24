import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ChromeSessionLabel } from './components/ChromeSessionLabel';
import { ClearanceOverlay } from './components/ClearanceOverlay';
import { BattleStationsConfirm } from './components/BattleStationsConfirm';
import { useStations } from './hooks/useStations';
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
  const { data: stations, isLoading } = useStations();
  const qc = useQueryClient();

  useEventStream((event) => {
    if (event.type === 'AlertPhaseChanged') {
      const payload = event.payload as { phase?: 'Normal' | 'Yellow' | 'Red' };
      if (payload.phase) setAlertPhase(payload.phase);
    }
    if (event.type === 'StationUpdated') {
      void qc.invalidateQueries({ queryKey: ['stations'] });
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
        <section>
          <h2>Environmental</h2>
          {isLoading ? (
            <p>Loading stations…</p>
          ) : (
            stations?.map((s) => (
              <div key={s.stationId} className="station-card">
                <strong>{s.stationId}</strong>
                <span>Freshness: {new Date(s.freshnessTs).toLocaleTimeString()}</span>
                <span>Temp: {String(s.attributes['1/513/0'] ?? '—')} °C</span>
              </div>
            ))
          )}
          <button type="button" className="lcars-btn" onClick={tryAdjustSetpoint}>
            Adjust environmental (demo)
          </button>
        </section>

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
