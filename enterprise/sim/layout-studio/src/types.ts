export type RoomKind = 'interior' | 'gap' | 'placeholder' | 'virtual';

export interface Vec2 {
  0: number;
  1: number;
}

export interface Room {
  id: string;
  label: string;
  levelId?: string;
  kind?: RoomKind;
  floorElevation: number;
  ceilingHeight?: number;
  floorPolygon: number[][];
  documentationRef?: string;
}

export interface FloorLevel {
  levelId: string;
  label: string;
  elevation: number;
  envelope?: {
    floorPolygon: number[][];
    documentationRef?: string;
  };
  rooms: Room[];
}

export interface SourceAlignment {
  scale: number;
  offsetX: number;
  offsetZ: number;
  rotationDeg: number;
  opacity?: number;
}

export interface SourceEntry {
  id: string;
  type: 'pdf' | 'image';
  path: string;
  levelId: string;
  notes: string;
  alignment: SourceAlignment;
}

export interface SourceManifest {
  sources: SourceEntry[];
}

export interface SourcesResponse {
  manifest: SourceManifest;
  files: string[];
}

export interface CompileResult {
  ok: boolean;
  merge?: string;
  convert?: string;
  error?: string;
}

export type EditorMode = 'select' | 'draw';
