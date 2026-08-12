import { useEffect, useRef } from 'react';
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
  const panelRef = useRef<HTMLDivElement>(null);
  const primaryActionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!active) return;
    const priorFocused = document.activeElement as HTMLElement | null;
    primaryActionRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onDismiss();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const target = document.activeElement as HTMLElement | null;

      if (event.shiftKey && target === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && target === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      priorFocused?.focus();
    };
  }, [active, onDismiss]);

  if (!active) return null;

  return (
    <div className="conflict-reconcile" role="dialog" aria-modal="true" aria-labelledby="conflict-title">
      <div ref={panelRef} className="conflict-reconcile__panel" tabIndex={-1}>
        <p className="conflict-reconcile__kicker">Authority Collision</p>
        <h2 id="conflict-title">Command path conflict</h2>
        <p>
          Competing control detected: {authorities.join(' vs ')}. Commands are blocked until reconcile.
        </p>
        <div className="conflict-reconcile__actions">
          <button
            ref={primaryActionRef}
            type="button"
            className="lcars-btn lcars-btn--danger"
            onClick={onReconcile}
          >
            Reconcile (Captain)
          </button>
          <button type="button" className="lcars-btn" onClick={onDismiss}>
            Dismiss panel (conflict remains)
          </button>
        </div>
      </div>
    </div>
  );
}
