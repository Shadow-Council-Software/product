import { BattleStationsConfirm } from '../components/BattleStationsConfirm';
import { EnvironmentalPanel } from '../components/environmental/EnvironmentalPanel';
import type { ClearanceTier, StationSnapshot } from '../lib/types';
import './EnvSubsystemScreen.css';

export interface EnvSubsystemScreenProps {
  station: StationSnapshot | undefined;
  clearance: ClearanceTier;
  conflictActive: boolean;
  alertPhase: 'Normal' | 'Yellow' | 'Red';
  isLoading: boolean;
  onBack: () => void;
  onSetpointPosted: () => void;
  onAlertCancel: () => void;
  onBattleStationsConfirm: () => void;
}

export function EnvSubsystemScreen({
  station,
  clearance,
  conflictActive,
  alertPhase,
  isLoading,
  onBack,
  onSetpointPosted,
  onAlertCancel,
  onBattleStationsConfirm,
}: EnvSubsystemScreenProps) {
  return (
    <div className="env-subsystem" data-testid="env.subsystem">
      <button type="button" className="lcars-btn env-subsystem__back" onClick={onBack}>
        ← Ops overview
      </button>
      <header className="env-subsystem__header">
        <h1>Environmental Control</h1>
        <p className="env-subsystem__deck">Deck 1 · Central hall · Nest thermostat</p>
      </header>

      {isLoading ? (
        <p>Loading stations…</p>
      ) : (
        <EnvironmentalPanel
          station={station}
          clearance={clearance}
          conflictActive={conflictActive}
          onSetpointPosted={onSetpointPosted}
        />
      )}

      <BattleStationsConfirm
        phase={alertPhase}
        onCancel={onAlertCancel}
        onConfirm={onBattleStationsConfirm}
      />
    </div>
  );
}
