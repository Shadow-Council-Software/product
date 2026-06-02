import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClearanceOverlay } from './components/ClearanceOverlay';
import { ConflictReconcile } from './components/ConflictReconcile';
import { LcarsBridgeLayout } from './components/layout/LcarsBridgeLayout';
import type { ArcSegment } from './components/chrome/LcarsArcRail';
import { useAlerts } from './hooks/useAlerts';
import { useStations } from './hooks/useStations';
import { useConflict } from './hooks/useConflict';
import { useEventStream } from './hooks/useEventStream';
import { EnvSubsystemScreen } from './screens/EnvSubsystemScreen';
import { OpsOverviewScreen } from './screens/OpsOverviewScreen';
import type { ClearanceTier, OutcomePayload } from './lib/types';
import './tokens/okuda.css';
import './App.css';

const queryClient = new QueryClient();
const ENGINE = import.meta.env.VITE_ENGINE_URL ?? '';
const TEMP_PATH = '1/513/0';

type ScreenId = 'ops.overview' | 'env.subsystem' | 'ops.audit';

function LcarsConsole() {
  const [screen, setScreen] = useState<ScreenId>('ops.overview');
  const [clearance, setClearance] = useState<ClearanceTier>('Guest');
  const [showOverlay, setShowOverlay] = useState(false);
  const [alertPhase, setAlertPhase] = useState<'Normal' | 'Yellow' | 'Red'>('Normal');
  const [showConflictModal, setShowConflictModal] = useState(true);
  const [commandMessage, setCommandMessage] = useState('Standing by — Main Computer ready.');

  const { data: stations, isLoading } = useStations();
  const { data: conflict } = useConflict();
  const { data: alertApi } = useAlerts();
  const qc = useQueryClient();

  const primaryStation = stations?.find((s) => s.stationId === 'env.nest.primary') ?? stations?.[0];
  const conflictActive = conflict?.active ?? false;

  const alert = alertApi ?? { phase: alertPhase, lastTransitionTs: Date.now(), acknowledgedBy: null };

  const meanTempC = useMemo(() => {
    const t = primaryStation?.attributes[TEMP_PATH];
    return typeof t === 'number' ? t : null;
  }, [primaryStation]);

  useEventStream((event) => {
    if (event.type === 'AlertPhaseChanged') {
      const payload = event.payload as { phase?: 'Normal' | 'Yellow' | 'Red' };
      if (payload.phase) setAlertPhase(payload.phase);
    }
    if (event.type === 'StationUpdated' || event.type === 'SetpointCommanded') {
      void qc.invalidateQueries({ queryKey: ['stations'] });
      void qc.invalidateQueries({ queryKey: ['alerts'] });
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
    const outcome = (await res.json()) as OutcomePayload;
    setCommandMessage(`${outcome.outcomeType}: ${outcome.message}`);
    void qc.invalidateQueries({ queryKey: ['alerts'] });
    return outcome;
  }

  async function reconcileConflict() {
    await fetch(`${ENGINE}/api/v1/system/conflict/reconcile`, {
      method: 'POST',
      headers: { 'x-clearance': 'Captain' },
    });
    void qc.invalidateQueries({ queryKey: ['conflict'] });
    setShowConflictModal(false);
    setCommandMessage('Acknowledged: Conflict reconciled');
  }

  function handleEscalate() {
    if (clearance === 'Guest') {
      setShowOverlay(true);
      return;
    }
    void postAlert('/api/v1/alerts/escalate');
  }

  const leftArc: ArcSegment[] = [
    {
      id: 'ops',
      label: 'Ops',
      color: 'var(--okuda-alert-cyan)',
      active: screen === 'ops.overview',
      onClick: () => setScreen('ops.overview'),
    },
    {
      id: 'env',
      label: 'Environment',
      color: 'var(--okuda-environmental-amber)',
      active: screen === 'env.subsystem',
      onClick: () => setScreen('env.subsystem'),
    },
    {
      id: 'tactical',
      label: 'Tactical',
      color: 'var(--okuda-status-orange)',
    },
    {
      id: 'eng',
      label: 'Engineering',
      color: 'var(--okuda-alert-amber)',
    },
  ];

  const rightArc: ArcSegment[] = [
    { id: 'sensors', label: 'Sensors', color: 'var(--okuda-alert-cyan)' },
    { id: 'power', label: 'Power', color: 'var(--okuda-status-orange)' },
    { id: 'comm', label: 'Comm', color: 'var(--okuda-environmental-amber)' },
  ];

  return (
    <LcarsBridgeLayout
      alert={alert}
      clearance={clearance}
      onClearanceChange={setClearance}
      commandMessage={commandMessage}
      onEscalate={handleEscalate}
      leftArc={leftArc}
      rightArc={rightArc}
      conflictActive={conflictActive}
    >
      {screen === 'ops.overview' && (
        <OpsOverviewScreen
          stations={stations}
          meanTempC={meanTempC}
          onOpenEnvironment={() => setScreen('env.subsystem')}
          onOpenAudit={() => setCommandMessage('Audit log — Growth (ops.audit)')}
        />
      )}

      {screen === 'env.subsystem' && (
        <EnvSubsystemScreen
          station={primaryStation}
          clearance={clearance}
          conflictActive={conflictActive}
          alertPhase={alertPhase}
          isLoading={isLoading}
          onBack={() => setScreen('ops.overview')}
          onSetpointPosted={() => void qc.invalidateQueries({ queryKey: ['stations'] })}
          onAlertCancel={() => setAlertPhase('Yellow')}
          onBattleStationsConfirm={() =>
            void postAlert('/api/v1/alerts/battle-stations', { confirm: true, actor: clearance })
          }
        />
      )}

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
    </LcarsBridgeLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LcarsConsole />
    </QueryClientProvider>
  );
}
