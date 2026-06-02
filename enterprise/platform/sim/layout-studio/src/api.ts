import type { CompileResult, FloorLevel, SourceManifest, SourcesResponse } from './types';

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${url}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchFloors(): Promise<FloorLevel[]> {
  return json<FloorLevel[]>('/api/floors');
}

export async function fetchFloor(levelId: string): Promise<FloorLevel> {
  return json<FloorLevel>(`/api/floors/${encodeURIComponent(levelId)}`);
}

export async function saveFloor(levelId: string, floor: FloorLevel): Promise<FloorLevel> {
  return json<FloorLevel>(`/api/floors/${encodeURIComponent(levelId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(floor),
  });
}

export async function fetchSources(): Promise<SourcesResponse> {
  return json<SourcesResponse>('/api/sources');
}

export async function saveManifest(manifest: SourceManifest): Promise<SourceManifest> {
  return json<SourceManifest>('/api/sources/manifest.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(manifest),
  });
}

export async function compileLayout(): Promise<CompileResult> {
  return json<CompileResult>('/api/compile', { method: 'POST' });
}

export function pdfUrl(filename: string): string {
  return `/api/sources/pdf/${encodeURIComponent(filename)}`;
}

export function imageUrl(filename: string): string {
  return `/api/sources/file/${encodeURIComponent(filename)}`;
}
