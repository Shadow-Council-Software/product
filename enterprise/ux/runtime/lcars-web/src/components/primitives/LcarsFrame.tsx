import type { ReactNode } from 'react';
import './LcarsFrame.css';

/** Vector LCARS bridge chrome — left rail + header elbows (Okuda geometry). */
export function LcarsFrame({ children }: { children: ReactNode }) {
  return (
    <div className="lcars-frame" data-substrate="bridge-dark" data-testid="lcars-frame">
      <aside className="lcars-frame__rail" aria-hidden="true">
        <svg viewBox="0 0 80 720" preserveAspectRatio="none" className="lcars-frame__rail-svg">
          <rect width="80" height="96" fill="var(--okuda-status-orange)" />
          <rect y="96" width="80" height="88" fill="var(--okuda-alert-cyan)" />
          <rect y="184" width="64" height="120" fill="var(--okuda-environmental-amber)" />
          <rect y="304" width="56" height="200" fill="var(--okuda-alert-amber)" />
          <path
            fill="var(--okuda-alert-red)"
            d="M0 504 H56 V600 H80 V720 H0 Z"
          />
        </svg>
      </aside>

      <div className="lcars-frame__main">
        <svg
          className="lcars-frame__header-svg"
          viewBox="0 0 1200 72"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="var(--okuda-alert-cyan)"
            d="M0 0 H520 V28 H480 V44 H0 V72 H1200 V0 H520 Z"
          />
          <path fill="var(--okuda-status-orange)" d="M520 0 H1200 V28 H560 V28 H520 Z" />
          <rect x="560" y="28" width="640" height="16" fill="var(--okuda-environmental-amber)" />
        </svg>

        <div className="lcars-frame__content">{children}</div>
      </div>
    </div>
  );
}
