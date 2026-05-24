import { useState } from 'react';
import './BattleStationsConfirm.css';

export interface BattleStationsConfirmProps {
  phase: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BattleStationsConfirm({ phase, onConfirm, onCancel }: BattleStationsConfirmProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (phase !== 'Yellow') {
    return null;
  }

  return (
    <section className="battle-stations" aria-labelledby="battle-stations-title">
      <h2 id="battle-stations-title">Battle Stations</h2>
      <p>Confirm escalation to Red alert. This gate cannot be bypassed.</p>
      <label className="battle-stations__check">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
        />
        I have reviewed alert status and authorize battle stations.
      </label>
      <div className="battle-stations__actions">
        <button type="button" className="lcars-btn lcars-btn--danger" disabled={!acknowledged} onClick={onConfirm}>
          Confirm battle stations
        </button>
        <button type="button" className="lcars-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
}
