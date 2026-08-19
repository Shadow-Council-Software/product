import { useState } from 'react';
import type { ClearanceTier, StationSnapshot } from '../../lib/types';
import { QuickEnvPin } from './QuickEnvPin';
import { FreshnessBadge } from './FreshnessBadge';
import './EnvironmentalPanel.css';

const ENGINE = import.meta.env.VITE_ENGINE_URL ?? '';
const TEMP_PATH = '1/513/0';

export interface EnvironmentalPanelProps {
  station: StationSnapshot | undefined;
  clearance: ClearanceTier;
  conflictActive: boolean;
  onSetpointPosted: () => void;
}

export function EnvironmentalPanel({
  station,
  clearance,
  conflictActive,
  onSetpointPosted,
}: EnvironmentalPanelProps) {
  const [target, setTarget] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const current = station?.attributes[TEMP_PATH];
  const disabled = conflictActive || clearance === 'Guest';

  async function submitSetpoint() {
    if (disabled) return;
    const value = Number(target);
    if (!Number.isFinite(value)) {
      setMessage('Invalid setpoint');
      return;
    }
    const res = await fetch(`${ENGINE}/api/v1/commands/setpoint`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-clearance': clearance,
      },
      body: JSON.stringify({
        stationId: station?.stationId,
        path: TEMP_PATH,
        value,
      }),
    });
    const body = (await res.json()) as { outcomeType: string; message: string };
    setMessage(`${body.outcomeType}: ${body.message}`);
    if (res.ok) onSetpointPosted();
  }

  return (
    <section className="environmental-panel" data-substrate="white-panel">
      <h2>Environmental</h2>
      {station && <QuickEnvPin authority={station.authority} />}
      {station ? (
        <>
          <div className="environmental-panel__readings">
            <span>Current: {String(current ?? '—')} °C</span>
            <FreshnessBadge freshnessTs={station.freshnessTs} />
          </div>
          <label className="environmental-panel__setpoint">
            Target setpoint (°C)
            <input
              type="number"
              step="0.5"
              value={target}
              disabled={disabled}
              onChange={(e) => setTarget(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="lcars-btn"
            disabled={disabled}
            onClick={() => void submitSetpoint()}
          >
            Command setpoint
          </button>
          {message && <p className="environmental-panel__msg">{message}</p>}
          {conflictActive && (
            <p className="environmental-panel__blocked">Commands disabled — CONFLICT active</p>
          )}
        </>
      ) : (
        <p>No station data</p>
      )}
    </section>
  );
}
