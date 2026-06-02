import type { EditorMode, FloorLevel, Room, SourceAlignment } from './types';
import { bounds, dist2, KIND_STYLE, pointInPolygon, polyArea, polyCenter } from './geometry';

export interface Viewport {
  panX: number;
  panY: number;
  zoom: number;
}

export interface CanvasEditorOptions {
  canvas: HTMLCanvasElement;
  onSelectionChange: (roomId: string | null) => void;
  onDrawComplete: (polygon: number[][]) => void;
  onFloorMutated: () => void;
}

export class CanvasEditor {
  private ctx: CanvasRenderingContext2D;
  private floor: FloorLevel | null = null;
  private selectedRoomId: string | null = null;
  private mode: EditorMode = 'select';
  private viewport: Viewport = { panX: 0, panY: 0, zoom: 1 };
  private worldBounds = { minX: 0, minZ: 0, maxX: 17.374, maxZ: 9.754 };
  private baseScale = 1;
  private baseOx = 48;
  private baseOy = 48;
  private draggingVertex: { roomId: string; index: number } | null = null;
  private isPanning = false;
  private panStart = { x: 0, y: 0, panX: 0, panY: 0 };
  private spaceHeld = false;
  private drawPoints: number[][] = [];
  private underlayCanvas: HTMLCanvasElement | null = null;
  private underlayAlignment: SourceAlignment | null = null;
  private underlayPdfSize: { width: number; height: number } | null = null;

  constructor(private opts: CanvasEditorOptions) {
    const ctx = opts.canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    this.ctx = ctx;
    this.bindEvents();
  }

  setFloor(floor: FloorLevel): void {
    this.floor = floor;
    this.selectedRoomId = null;
    this.drawPoints = [];
    this.fitView();
    this.render();
  }

  getFloor(): FloorLevel | null {
    return this.floor;
  }

  updateFloor(floor: FloorLevel): void {
    this.floor = floor;
    this.render();
  }

  setSelectedRoom(roomId: string | null): void {
    this.selectedRoomId = roomId;
    this.render();
  }

  getSelectedRoomId(): string | null {
    return this.selectedRoomId;
  }

  setMode(mode: EditorMode): void {
    this.mode = mode;
    if (mode === 'select') this.drawPoints = [];
    this.render();
  }

  getMode(): EditorMode {
    return this.mode;
  }

  cancelDraw(): void {
    this.drawPoints = [];
    this.setMode('select');
  }

  setUnderlay(
    canvas: HTMLCanvasElement | null,
    alignment: SourceAlignment | null,
    pdfSize: { width: number; height: number } | null,
  ): void {
    this.underlayCanvas = canvas;
    this.underlayAlignment = alignment;
    this.underlayPdfSize = pdfSize;
    this.render();
  }

  resize(): void {
    const wrap = this.opts.canvas.parentElement;
    if (!wrap) return;
    this.opts.canvas.width = wrap.clientWidth;
    this.opts.canvas.height = wrap.clientHeight;
    this.computeBaseTransform();
    this.render();
  }

  fitView(): void {
    this.viewport = { panX: 0, panY: 0, zoom: 1 };
    this.computeBaseTransform();
    this.render();
  }

  private computeBaseTransform(): void {
    const floor = this.floor;
    if (!floor) return;

    const env = floor.envelope?.floorPolygon ?? [];
    const rooms = floor.rooms ?? [];
    const allPolys = [...rooms.map((r) => r.floorPolygon), ...(env.length ? [env] : [])];
    let b = bounds(allPolys.length ? allPolys : [[[0, 0], [17.374, 0], [17.374, 9.754], [0, 9.754]]]);
    const pad = 1.2;
    b = {
      minX: b.minX - pad,
      minZ: b.minZ - pad,
      maxX: b.maxX + pad,
      maxZ: b.maxZ + pad,
    };
    this.worldBounds = b;

    const padPx = 48;
    const w = this.opts.canvas.width - padPx * 2;
    const h = this.opts.canvas.height - padPx * 2;
    const spanX = b.maxX - b.minX;
    const spanZ = b.maxZ - b.minZ;
    this.baseScale = Math.min(w / spanX, h / spanZ);
    this.baseOx = padPx + (w - spanX * this.baseScale) / 2;
    this.baseOy = padPx + (h - spanZ * this.baseScale) / 2;
  }

  worldToScreen(x: number, z: number): { x: number; y: number } {
    const b = this.worldBounds;
    const scale = this.baseScale * this.viewport.zoom;
    const ox = this.baseOx + this.viewport.panX;
    const oy = this.baseOy + this.viewport.panY;
    return {
      x: ox + (x - b.minX) * scale,
      y: oy + (b.maxZ - z) * scale,
    };
  }

  screenToWorld(sx: number, sy: number): { x: number; z: number } {
    const b = this.worldBounds;
    const scale = this.baseScale * this.viewport.zoom;
    const ox = this.baseOx + this.viewport.panX;
    const oy = this.baseOy + this.viewport.panY;
    return {
      x: b.minX + (sx - ox) / scale,
      z: b.maxZ - (sy - oy) / scale,
    };
  }

  private bindEvents(): void {
    const c = this.opts.canvas;

    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const before = this.screenToWorld(e.offsetX, e.offsetY);
      this.viewport.zoom = Math.min(8, Math.max(0.2, this.viewport.zoom * factor));
      const after = this.screenToWorld(e.offsetX, e.offsetY);
      const scale = this.baseScale * this.viewport.zoom;
      this.viewport.panX += (before.x - after.x) * scale;
      this.viewport.panY += (after.z - before.z) * scale;
      this.render();
    });

    c.addEventListener('mousedown', (e) => {
      if (e.button === 1 || this.spaceHeld) {
        this.isPanning = true;
        this.panStart = {
          x: e.clientX,
          y: e.clientY,
          panX: this.viewport.panX,
          panY: this.viewport.panY,
        };
        e.preventDefault();
        return;
      }
      if (e.button !== 0) return;
      this.handlePrimaryDown(e.offsetX, e.offsetY);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        this.viewport.panX = this.panStart.panX + (e.clientX - this.panStart.x);
        this.viewport.panY = this.panStart.panY + (e.clientY - this.panStart.y);
        this.render();
        return;
      }
      if (this.draggingVertex && this.floor) {
        const rect = c.getBoundingClientRect();
        const w = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
        const room = this.floor.rooms.find((r) => r.id === this.draggingVertex!.roomId);
        if (room) {
          room.floorPolygon[this.draggingVertex.index] = [
            Math.round(w.x * 1000) / 1000,
            Math.round(w.z * 1000) / 1000,
          ];
          this.opts.onFloorMutated();
          this.render();
        }
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.draggingVertex) {
        this.draggingVertex = null;
        this.opts.onFloorMutated();
      }
      this.isPanning = false;
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.spaceHeld) {
        this.spaceHeld = true;
        c.style.cursor = 'grab';
      }
      if (e.key === 'Escape') this.cancelDraw();
      if (e.key === 'Enter' && this.mode === 'draw' && this.drawPoints.length >= 3) {
        this.finishDraw();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spaceHeld = false;
        c.style.cursor = 'crosshair';
      }
    });

    c.addEventListener('dblclick', (e) => {
      if (this.mode === 'draw' && this.drawPoints.length >= 3) {
        e.preventDefault();
        this.finishDraw();
      }
    });
  }

  private handlePrimaryDown(sx: number, sy: number): void {
    const w = this.screenToWorld(sx, sy);

    if (this.mode === 'draw') {
      this.drawPoints.push([Math.round(w.x * 1000) / 1000, Math.round(w.z * 1000) / 1000]);
      this.render();
      return;
    }

    const hit = this.hitTestVertex(sx, sy);
    if (hit) {
      this.draggingVertex = hit;
      this.selectedRoomId = hit.roomId;
      this.opts.onSelectionChange(hit.roomId);
      this.render();
      return;
    }

    const room = this.hitTestRoom(w.x, w.z);
    this.selectedRoomId = room?.id ?? null;
    this.opts.onSelectionChange(this.selectedRoomId);
    this.render();
  }

  private finishDraw(): void {
    const poly = this.drawPoints.map((p) => [...p]);
    this.drawPoints = [];
    this.setMode('select');
    this.opts.onDrawComplete(poly);
  }

  private hitTestVertex(sx: number, sy: number): { roomId: string; index: number } | null {
    if (!this.floor) return null;
    const threshold = 12;
    for (const room of this.floor.rooms) {
      for (let i = 0; i < room.floorPolygon.length; i++) {
        const p = room.floorPolygon[i];
        const s = this.worldToScreen(p[0], p[1]);
        if (dist2(sx, sy, s.x, s.y) <= threshold * threshold) {
          return { roomId: room.id, index: i };
        }
      }
    }
    return null;
  }

  private hitTestRoom(x: number, z: number): Room | null {
    if (!this.floor) return null;
    const sorted = [...this.floor.rooms].sort(
      (a, b) => polyArea(a.floorPolygon) - polyArea(b.floorPolygon),
    );
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (pointInPolygon(x, z, sorted[i].floorPolygon)) return sorted[i];
    }
    return null;
  }

  render(): void {
    const ctx = this.ctx;
    const c = this.opts.canvas;
    ctx.fillStyle = '#0c0e12';
    ctx.fillRect(0, 0, c.width, c.height);

    this.drawUnderlay();

    const floor = this.floor;
    if (!floor) return;

    const env = floor.envelope?.floorPolygon ?? [];
    const rooms = floor.rooms ?? [];

    if (env.length) {
      this.drawPolygon(env, { fill: 'transparent', stroke: '#ffffff55', dash: [8, 6] }, false);
    }

    const sorted = [...rooms].sort((a, b) => polyArea(a.floorPolygon) - polyArea(b.floorPolygon));
    for (const room of sorted) {
      const kind = room.kind ?? 'interior';
      const style = KIND_STYLE[kind] ?? KIND_STYLE.interior;
      this.drawPolygon(room.floorPolygon, style, room.id === this.selectedRoomId);
      const center = polyCenter(room.floorPolygon);
      const bb = bounds([room.floorPolygon]);
      const p0 = this.worldToScreen(bb.minX, bb.minZ);
      const p1 = this.worldToScreen(bb.maxX, bb.maxZ);
      const rw = Math.abs(p1.x - p0.x);
      if (rw > 36) this.drawLabel(room.label, center.x, center.z, rw - 8);
    }

    if (this.mode === 'draw' && this.drawPoints.length) {
      this.drawPolygon(this.drawPoints, { fill: '#ffffff18', stroke: '#ff9f43', dash: [4, 4] }, true);
      for (const p of this.drawPoints) {
        this.drawVertexHandle(p[0], p[1], '#ff9f43');
      }
    }

    if (this.selectedRoomId) {
      const room = rooms.find((r) => r.id === this.selectedRoomId);
      if (room) {
        for (const p of room.floorPolygon) {
          this.drawVertexHandle(p[0], p[1], '#fff');
        }
      }
    }

    if (env.length) {
      const eb = bounds([env]);
      const mid = this.worldToScreen((eb.minX + eb.maxX) / 2, eb.minZ);
      ctx.fillStyle = '#8b9bb4';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      const wM = (eb.maxX - eb.minX).toFixed(2);
      const wF = ((eb.maxX - eb.minX) / 0.3048).toFixed(1);
      ctx.fillText(`${wF}' / ${wM} m`, mid.x, mid.y + 20);
      ctx.fillText('SOUTH (front)', mid.x, mid.y + 34);
    }
  }

  private drawUnderlay(): void {
    if (!this.underlayCanvas || !this.underlayAlignment || !this.underlayPdfSize) return;
    const ctx = this.ctx;
    const align = this.underlayAlignment;
    const opacity = align.opacity ?? 0.55;

    const origin = this.worldToScreen(align.offsetX, align.offsetZ);
    const scale = this.baseScale * this.viewport.zoom * align.scale;
    const w = this.underlayPdfSize.width * scale;
    const h = this.underlayPdfSize.height * scale;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(origin.x, origin.y);
    if (align.rotationDeg) ctx.rotate((-align.rotationDeg * Math.PI) / 180);
    ctx.scale(1, -1);
    ctx.drawImage(this.underlayCanvas, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  private drawPolygon(
    poly: number[][],
    style: { fill: string; stroke: string; dash: number[] },
    selected: boolean,
  ): void {
    const ctx = this.ctx;
    ctx.beginPath();
    const first = this.worldToScreen(poly[0][0], poly[0][1]);
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < poly.length; i++) {
      const p = this.worldToScreen(poly[i][0], poly[i][1]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = style.fill;
    ctx.fill();
    ctx.setLineDash(style.dash);
    ctx.strokeStyle = selected ? '#fff' : style.stroke;
    ctx.lineWidth = selected ? 3 : 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawVertexHandle(x: number, z: number, color: string): void {
    const p = this.worldToScreen(x, z);
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  private drawLabel(text: string, x: number, z: number, maxW: number): void {
    const p = this.worldToScreen(x, z);
    const ctx = this.ctx;
    ctx.fillStyle = '#e8eef5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fs = 13;
    ctx.font = `600 ${fs}px system-ui`;
    while (fs > 8 && ctx.measureText(text).width > maxW) {
      fs -= 1;
      ctx.font = `600 ${fs}px system-ui`;
    }
    ctx.fillText(text, p.x, p.y);
  }
}
