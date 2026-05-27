import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface LayoutDevice {
  deviceId: string;
  roomId: string;
  levelId: string;
  label: string;
  deviceType: string;
  deploymentStatus: 'installed' | 'planned';
  productModel?: string;
  position: [number, number, number];
  rotationY?: number;
  coverage?: {
    horizontalFovDeg: number;
    verticalFovDeg?: number;
    rangeM: number;
    mountHeightM?: number;
  };
  uxRole?: string;
  documentationRef?: string;
}

export interface HouseLayoutGeometry {
  source: string;
  matterportModelId?: string;
  mesh: {
    format: string;
    uri: string;
    materialUri?: string;
    transform: { position: number[]; rotationEulerDeg: number[]; scale: number[] };
  };
  alignment: {
    surveyRef: string;
    manifestUri: string;
    maxWallDeltaM: number;
    verifiedAt?: string;
    parityReportUri?: string;
  };
  bounds?: { min: number[]; max: number[]; extentM: number[] };
}

export interface HouseLayout {
  schemaVersion: number;
  metadata: { name: string; units: string };
  coverageGoals?: { perimeterComplete?: boolean; notes?: string };
  geometry?: HouseLayoutGeometry;
  rooms: Array<{ id: string; label: string }>;
  stations: Array<{
    stationId: string;
    roomId: string;
    label?: string;
    position: [number, number, number];
    matterNodeId: number;
    deviceType?: string;
    attributePaths?: Record<string, string>;
  }>;
  devices?: LayoutDevice[];
}

export interface SpatialStationState {
  stationId: string;
  roomId: string;
  nodeId: number;
  tempC: number;
  targetC: number;
  authority: 'enterprise' | 'google' | 'shared';
  freshnessTs: number;
  position: [number, number, number];
}

export interface VisualAidCapture {
  captureId: string;
  timestamp: number;
  camera?: { position: number[]; rotationEuler: number[]; fov: number };
  focus?: { stationId?: string; roomId?: string };
  spatialStateHash?: string;
  annotations?: Array<Record<string, unknown>>;
  imageBase64?: string;
  lcarsCorrelation?: Record<string, unknown>;
}

export class SpatialEngine {
  private stations = new Map<string, SpatialStationState>();
  private layout: HouseLayout | null = null;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<(event: { type: string; payload: unknown }) => void>();

  loadLayout(path: string): HouseLayout {
    const raw = readFileSync(path, 'utf8');
    this.layout = JSON.parse(raw) as HouseLayout;
    this.stations.clear();
    for (const s of this.layout.stations) {
      this.stations.set(s.stationId, {
        stationId: s.stationId,
        roomId: s.roomId,
        nodeId: s.matterNodeId,
        tempC: 21.5,
        targetC: 21.5,
        authority: 'enterprise',
        freshnessTs: Date.now(),
        position: s.position,
      });
    }
    return this.layout;
  }

  getLayout(): HouseLayout | null {
    return this.layout;
  }

  getGeometry(): HouseLayoutGeometry | null {
    return this.layout?.geometry ?? null;
  }

  getGeometryManifest(): {
    geometry: HouseLayoutGeometry | null;
    parityPassed: boolean;
    layoutName: string;
  } {
    const geometry = this.getGeometry();
    const parityPassed = Boolean(geometry?.alignment?.verifiedAt);
    return {
      geometry,
      parityPassed,
      layoutName: this.layout?.metadata.name ?? 'unknown',
    };
  }

  startTick(intervalMs = 2000): void {
    if (this.tickTimer) return;
    this.tickTimer = setInterval(() => this.tick(), intervalMs);
  }

  stopTick(): void {
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = null;
  }

  subscribe(handler: (event: { type: string; payload: unknown }) => void): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  getStations(): SpatialStationState[] {
    return [...this.stations.values()];
  }

  getStation(stationId: string): SpatialStationState | undefined {
    return this.stations.get(stationId);
  }

  readTemp(stationId: string): number {
    return this.stations.get(stationId)?.tempC ?? NaN;
  }

  writeSetpoint(stationId: string, targetC: number, authority: 'enterprise' | 'google' = 'enterprise'): boolean {
    const s = this.stations.get(stationId);
    if (!s || !Number.isFinite(targetC)) return false;
    s.targetC = targetC;
    s.authority = authority;
    s.freshnessTs = Date.now();
    this.emit('setpoint_commanded', { stationId, targetC, authority });
    return true;
  }

  simulateGoogleSetpoint(stationId: string, targetC: number): void {
    this.writeSetpoint(stationId, targetC, 'google');
    this.emit('external_write', { stationId, targetC, authority: 'google' });
  }

  stateHash(): string {
    const payload = JSON.stringify(this.getStations());
    return createHash('sha256').update(payload).digest('hex').slice(0, 16);
  }

  getDevices(): LayoutDevice[] {
    return this.layout?.devices ?? [];
  }

  /** Simplified 2D perimeter coverage audit for Unity / LCARS UX planning */
  computeCoverageReport(): {
    perimeterComplete: boolean;
    samplePoints: number;
    coveredPoints: number;
    coveragePercent: number;
    gaps: Array<{ x: number; z: number; nearestDeviceId: string | null }>;
    devices: LayoutDevice[];
  } {
    const devices = this.getDevices().filter((d) => d.coverage);
    const perimeterRoom = this.layout?.rooms.find((r) => r.id === 'exterior-perimeter');
    const points: Array<[number, number]> = [];
    if (perimeterRoom && 'floorPolygon' in perimeterRoom) {
      const poly = (perimeterRoom as { floorPolygon: Array<[number, number]> }).floorPolygon;
      for (let i = 0; i < poly.length - 1; i++) {
        const [x1, z1] = poly[i];
        const [x2, z2] = poly[i + 1];
        for (let t = 0; t <= 1; t += 0.25) {
          points.push([x1 + (x2 - x1) * t, z1 + (z2 - z1) * t]);
        }
      }
    } else {
      points.push([0, 0], [17.374, 0], [17.374, 9.754], [0, 9.754]);
    }

    const gaps: Array<{ x: number; z: number; nearestDeviceId: string | null }> = [];
    let covered = 0;
    for (const [x, z] of points) {
      let hit: string | null = null;
      for (const d of devices) {
        if (!d.coverage) continue;
        const [dx, , dz] = d.position;
        const dist = Math.hypot(x - dx, z - dz);
        if (dist > d.coverage.rangeM) continue;
        const angle = (Math.atan2(z - dz, x - dx) * 180) / Math.PI;
        const center = d.rotationY ?? 0;
        const half = d.coverage.horizontalFovDeg / 2;
        let diff = angle - center;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        if (Math.abs(diff) <= half) {
          hit = d.deviceId;
          break;
        }
      }
      if (hit) covered++;
      else gaps.push({ x, z, nearestDeviceId: null });
    }

    const coveragePercent = points.length ? Math.round((covered / points.length) * 100) : 0;
    return {
      perimeterComplete: coveragePercent >= 95,
      samplePoints: points.length,
      coveredPoints: covered,
      coveragePercent,
      gaps,
      devices,
    };
  }

  private tick(): void {
    for (const s of this.stations.values()) {
      const delta = s.targetC - s.tempC;
      if (Math.abs(delta) < 0.05) {
        s.tempC = s.targetC;
      } else {
        s.tempC += Math.sign(delta) * Math.min(0.15, Math.abs(delta));
      }
      s.freshnessTs = Date.now();
      this.emit('attribute_updated', {
        stationId: s.stationId,
        nodeId: s.nodeId,
        path: '1/513/0',
        value: s.tempC,
      });
    }
  }

  private emit(type: string, payload: unknown): void {
    for (const h of this.listeners) h({ type, payload });
  }
}

export class VisualAidStore {
  private capturesDir: string;
  private latest: VisualAidCapture | null = null;
  private retention: number;

  constructor(capturesDir: string, retention = 50) {
    this.capturesDir = capturesDir;
    this.retention = retention;
    if (!existsSync(capturesDir)) mkdirSync(capturesDir, { recursive: true });
  }

  save(capture: VisualAidCapture): VisualAidCapture {
    this.latest = capture;
    const path = join(this.capturesDir, `${capture.captureId}.json`);
    writeFileSync(path, JSON.stringify(capture, null, 2));
    this.prune();
    return capture;
  }

  getLatest(): VisualAidCapture | null {
    return this.latest;
  }

  history(limit = 10): VisualAidCapture[] {
    const files = readdirSync(this.capturesDir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);
    return files.map((f) => JSON.parse(readFileSync(join(this.capturesDir, f), 'utf8')) as VisualAidCapture);
  }

  private prune(): void {
    const files = readdirSync(this.capturesDir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse();
    for (const f of files.slice(this.retention)) {
      unlinkSync(join(this.capturesDir, f));
    }
  }
}

export function defaultLayoutPath(): string {
  const env = process.env.SIM_LAYOUT_PATH;
  if (env && existsSync(env)) return env;
  const residence = join(__dirname, '../../layouts/onimurasame-residence-2026-05-24.json');
  if (existsSync(residence)) return residence;
  const example = join(__dirname, '../../layouts/house-layout.example.json');
  if (existsSync(example)) return example;
  throw new Error('No layout file — set SIM_LAYOUT_PATH or add layouts/onimurasame-residence-2026-05-24.json');
}
