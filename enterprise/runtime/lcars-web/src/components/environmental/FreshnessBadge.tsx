import { useEffect, useState } from 'react';
import './FreshnessBadge.css';

const STALE_MS = 15_000;

export interface FreshnessBadgeProps {
  freshnessTs: number;
}

export function FreshnessBadge({ freshnessTs }: FreshnessBadgeProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const stale = now - freshnessTs > STALE_MS;
  return (
    <span className={`freshness-badge ${stale ? 'freshness-badge--stale' : 'freshness-badge--fresh'}`}>
      {stale ? 'Stale' : 'Fresh'} · {new Date(freshnessTs).toLocaleTimeString()}
    </span>
  );
}
