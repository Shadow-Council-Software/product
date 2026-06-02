import type { ClearanceTier } from '../lib/types';
import './ChromeSessionLabel.css';

const LABEL_COLOR: Record<ClearanceTier, string> = {
  Captain: 'var(--okuda-alert-cyan)',
  Crew: 'var(--okuda-environmental-amber)',
  Guest: 'var(--okuda-text-operator)',
};

export function ChromeSessionLabel({ clearance }: { clearance: ClearanceTier }) {
  return (
    <div className="chrome-session" data-substrate="bridge-dark" data-testid="chrome.session">
      <span className="chrome-session__label" style={{ color: LABEL_COLOR[clearance] }}>
        Clearance: {clearance}
      </span>
    </div>
  );
}
