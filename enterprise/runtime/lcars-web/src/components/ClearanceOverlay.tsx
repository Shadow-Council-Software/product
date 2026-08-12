import type { ClearanceTier } from '../lib/types';
import './ClearanceOverlay.css';

export interface ClearanceOverlayProps {
  required: ClearanceTier;
  current: ClearanceTier;
  onDismiss: () => void;
  /** What was denied, e.g. "Environmental control" or "Conflict reconcile". */
  subject?: string;
}

export function ClearanceOverlay({
  required,
  current,
  onDismiss,
  subject = 'Environmental control',
}: ClearanceOverlayProps) {
  return (
    <div className="clearance-overlay" role="dialog" aria-labelledby="clearance-denial-title">
      <div className="clearance-overlay__panel" data-substrate="white-panel">
        <h2 id="clearance-denial-title">Denied</h2>
        <p className="clearance-overlay__message">
          {subject} requires {required} clearance. Your session: {current}.
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
