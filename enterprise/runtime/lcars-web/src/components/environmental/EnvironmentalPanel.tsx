import { useState } from 'react';
import type { ClearanceTier, StationSnapshot } from '../../lib/types';
import { QuickEnvPin } from './QuickEnvPin';
import { FreshnessBadge } from './FreshnessBadge';
import './EnvironmentalPanel.css';

const ENGINE = import.meta.env.VITE_ENGINE_URL ?? '';
const TEMP_PATH = '1/513/0';
const PRESET_SETPOINTS = [19, 21, 23] as const;

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
    const normalized = target.replace(',', '.').trim();
    const value = Number(normalized);
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
      {station && <QuickEnvPin authority={station.authority} />}
      {station ? (
        <>
          <div className="environmental-panel__readings">
            <div className="environmental-panel__reading-cell">
              <span className="environmental-panel__reading-label">Current · Deck 8</span>
              <span className="environmental-panel__reading-value">
                {typeof current === 'number' ? current.toFixed(1) : '——'}
                <span className="environmental-panel__reading-unit">°C</span>
              </span>
            </div>
            <FreshnessBadge freshnessTs={station.freshnessTs} />
          </div>
          <label className="environmental-panel__setpoint">
            Target Setpoint
            <div className="environmental-panel__setpoint-input-row">
              <input
                type="text"
                inputMode="decimal"
                pattern="^-?[0-9]+([.,][0-9]+)?$"
                value={target}
                disabled={disabled}
                onChange={(e) => setTarget(e.target.value)}
              />
              <span className="environmental-panel__setpoint-unit">°C</span>
            </div>
          </label>
          <div className="environmental-panel__presets" aria-label="Thermal presets">
            {PRESET_SETPOINTS.map((preset) => (
              <button
                key={preset}
                type="button"
                className="environmental-panel__preset-btn"
                disabled={disabled}
                onClick={() => setTarget(String(preset))}
              >
                {preset.toFixed(0)}°
              </button>
            ))}
          </div>
          <button
            type="button"
            className="lcars-btn environmental-panel__command-btn"
            disabled={disabled}
            onClick={() => void submitSetpoint()}
          >
            Engage Setpoint
          </button>
          {message && <p className="environmental-panel__msg">{message}</p>}
          {conflictActive && (
            <p className="environmental-panel__blocked">Authority conflict — commands locked</p>
          )}
        </>
      ) : (
        <p className="environmental-panel__msg">No station telemetry</p>
      )}
    </section>
  );
}
