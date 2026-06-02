import './FreshnessBadge.css';

const STALE_MS = 15_000;

export interface FreshnessBadgeProps {
  freshnessTs: number;
}

export function FreshnessBadge({ freshnessTs }: FreshnessBadgeProps) {
  const age = Date.now() - freshnessTs;
  const stale = age > STALE_MS;
  return (
    <span className={`freshness-badge ${stale ? 'freshness-badge--stale' : 'freshness-badge--fresh'}`}>
      {stale ? 'Stale' : 'Fresh'} · {new Date(freshnessTs).toLocaleTimeString()}
    </span>
  );
}
