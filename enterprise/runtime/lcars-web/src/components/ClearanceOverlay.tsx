import type { ClearanceTier } from '../lib/types';
import './ClearanceOverlay.css';

export interface ClearanceOverlayProps {
  required: ClearanceTier;
  current: ClearanceTier;
  onDismiss: () => void;
}

export function ClearanceOverlay({ required, current, onDismiss }: ClearanceOverlayProps) {
  return (
    <div className="clearance-overlay" role="dialog" aria-labelledby="clearance-denial-title">
      <div className="clearance-overlay__panel" data-substrate="white-panel">
        <h2 id="clearance-denial-title">Denied</h2>
        <p className="clearance-overlay__message">
          Environmental control requires {required} clearance. Your session: {current}.
        </p>
        <p className="clearance-overlay__hint">
          Return to Ops overview or request host authorization.
        </p>
        <button type="button" className="lcars-btn" onClick={onDismiss}>
          Return to read-only view
        </button>
      </div>
    </div>
  );
}
