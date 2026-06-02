import { useEffect, useState } from 'react';
import type { EventEnvelopeV1 } from '../lib/types';

const ENGINE = import.meta.env.VITE_ENGINE_URL ?? '';

export function useEventStream(onEvent?: (event: EventEnvelopeV1) => void) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<EventEnvelopeV1 | null>(null);

  useEffect(() => {
    const wsUrl = `${ENGINE.replace(/^http/, 'ws')}/api/v1/events/stream`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data as string) as EventEnvelopeV1;
      setLastEvent(parsed);
      onEvent?.(parsed);
    };

    return () => ws.close();
  }, [onEvent]);

  return { connected, lastEvent };
}
