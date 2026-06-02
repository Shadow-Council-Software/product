import type { CSSProperties } from 'react';
import './LcarsArcRail.css';

export interface ArcSegment {
  id: string;
  label: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
}

export interface LcarsArcRailProps {
  side: 'left' | 'right';
  segments: ArcSegment[];
}

export function LcarsArcRail({ side, segments }: LcarsArcRailProps) {
  return (
    <nav
      className={`lcars-arc lcars-arc--${side}`}
      data-testid={side === 'left' ? 'chrome.nav' : 'chrome.sensor'}
      aria-label={side === 'left' ? 'Department navigation' : 'Sensor summary'}
    >
      {segments.map((seg) => (
        <button
          key={seg.id}
          type="button"
          className={`lcars-arc__seg ${seg.active ? 'lcars-arc__seg--active' : ''}`}
          style={{ '--seg-color': seg.color } as CSSProperties}
          onClick={seg.onClick}
          disabled={!seg.onClick}
        >
          <span className="lcars-arc__label">{seg.label}</span>
        </button>
      ))}
    </nav>
  );
}
