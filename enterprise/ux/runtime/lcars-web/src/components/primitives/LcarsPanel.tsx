import type { ReactNode } from 'react';
import './LcarsPanel.css';

export interface LcarsPanelProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

/** White-panel substrate with LCARS elbow clip (Sprint 1 primitive). */
export function LcarsPanel({ children, title, className = '' }: LcarsPanelProps) {
  return (
    <section
      className={`lcars-panel ${className}`.trim()}
      data-substrate="white-panel"
      data-testid="lcars-panel"
    >
      <svg
        className="lcars-panel__elbow"
        viewBox="0 0 48 48"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="var(--okuda-alert-cyan)"
          d="M0 0 H48 V12 H32 V24 H16 V36 H0 V48 H0 V0 Z"
        />
      </svg>
      {title ? <h2 className="lcars-panel__title">{title}</h2> : null}
      <div className="lcars-panel__body">{children}</div>
    </section>
  );
}
