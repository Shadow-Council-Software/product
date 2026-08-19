import { useQuery } from '@tanstack/react-query';
import type { StationSnapshot } from '../lib/types';

const ENGINE = import.meta.env.VITE_ENGINE_URL ?? '';

async function fetchStations(): Promise<StationSnapshot[]> {
  const res = await fetch(`${ENGINE}/api/v1/stations`);
  if (!res.ok) throw new Error('Failed to load stations');
  const data = (await res.json()) as { stations: StationSnapshot[] };
  return data.stations;
}

export function useStations() {
  return useQuery({
    queryKey: ['stations'],
    queryFn: fetchStations,
    refetchInterval: 10_000,
  });
}
