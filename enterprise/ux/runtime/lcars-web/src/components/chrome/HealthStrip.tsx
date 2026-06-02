import './HealthStrip.css';

export interface HealthStripProps {
  adapter?: string;
  staleThresholdMs?: number;
}

export function HealthStrip({ adapter = 'mock', staleThresholdMs = 15000 }: HealthStripProps) {
  return (
    <aside className="health-strip" data-testid="chrome.health" data-substrate="bridge-dark">
      <span className="health-strip__posture">POSTURE: HYBRID</span>
      <span className="health-strip__detail">
        {adapter.toUpperCase()} · stale &gt; {Math.round(staleThresholdMs / 1000)}s
      </span>
    </aside>
  );
}
