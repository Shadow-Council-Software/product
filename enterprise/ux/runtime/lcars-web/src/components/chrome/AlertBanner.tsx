import type { AlertSnapshot } from '../../lib/types';
import './AlertBanner.css';

export interface AlertBannerProps {
  alert: AlertSnapshot | undefined;
}

export function AlertBanner({ alert }: AlertBannerProps) {
  const phase = alert?.phase ?? 'Normal';
  if (phase === 'Normal') {
    return (
      <div
        className="alert-banner alert-banner--hidden"
        data-testid="chrome.alert"
        aria-hidden="true"
      />
    );
  }

  const label =
    phase === 'Yellow'
      ? 'YELLOW ALERT — ADVISORY CONDITION'
      : 'RED ALERT — ALL HANDS';

  return (
    <div
      className={`alert-banner alert-banner--${phase.toLowerCase()}`}
      data-testid="chrome.alert"
      role="status"
      aria-live="polite"
    >
      <span className="alert-banner__label">{label}</span>
    </div>
  );
}
