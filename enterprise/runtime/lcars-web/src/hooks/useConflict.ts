import { useQuery } from '@tanstack/react-query';

const ENGINE = import.meta.env.VITE_ENGINE_URL ?? '';

export interface ConflictState {
  active: boolean;
  authorities: string[];
  detectedTs: number | null;
  detail: string | null;
}

async function fetchConflict(): Promise<ConflictState> {
  const res = await fetch(`${ENGINE}/api/v1/system/conflict`);
  if (!res.ok) throw new Error('Failed to load conflict state');
  return res.json() as Promise<ConflictState>;
}

export function useConflict() {
  return useQuery({
    queryKey: ['conflict'],
    queryFn: fetchConflict,
    refetchInterval: 5_000,
  });
}
