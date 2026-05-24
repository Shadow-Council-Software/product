import './ConflictReconcile.css';

export interface ConflictReconcileProps {
  active: boolean;
  authorities: string[];
  onReconcile: () => void;
  onDismiss: () => void;
}

export function ConflictReconcile({
  active,
  authorities,
  onReconcile,
  onDismiss,
}: ConflictReconcileProps) {
  if (!active) return null;

  return (
    <div className="conflict-reconcile" role="dialog" aria-labelledby="conflict-title">
      <h2 id="conflict-title">Authority conflict</h2>
      <p>
        Competing control detected: {authorities.join(' vs ')}. Commands are blocked until reconcile.
      </p>
      <div className="conflict-reconcile__actions">
        <button type="button" className="lcars-btn lcars-btn--danger" onClick={onReconcile}>
          Reconcile (Captain)
        </button>
        <button type="button" className="lcars-btn" onClick={onDismiss}>
          Dismiss view
        </button>
      </div>
    </div>
  );
}
