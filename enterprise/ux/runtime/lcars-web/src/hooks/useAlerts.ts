import { useQuery } from '@tanstack/react-query';
import type { AlertSnapshot } from '../lib/types';

const ENGINE = import.meta.env.VITE_ENGINE_URL ?? '';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async (): Promise<AlertSnapshot> => {
      const res = await fetch(`${ENGINE}/api/v1/alerts`);
      if (!res.ok) throw new Error('alerts fetch failed');
      return res.json() as Promise<AlertSnapshot>;
    },
    refetchInterval: 5000,
  });
}
