import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  compileLayout,
  fetchFloor,
  fetchFloors,
  fetchSources,
  imageUrl,
  pdfUrl,
  saveFloor,
  saveManifest,
} from './api';
import { CanvasEditor } from './canvas-editor';
import { slugId } from './geometry';
import type { FloorLevel, Room, SourceEntry, SourceManifest } from './types';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const els = {
  floorTabs: document.getElementById('floor-tabs')!,
  status: document.getElementById('status')!,
  roomList: document.getElementById('room-list')!,
  roomEditor: document.getElementById('room-editor')!,
  roomLabel: document.getElementById('room-label') as HTMLInputElement,
  roomKind: document.getElementById('room-kind') as HTMLSelectElement,
  roomId: document.getElementById('room-id') as HTMLInputElement,
  vertexList: document.getElementById('vertex-list')!,
  sourceList: document.getElementById('source-list')!,
  sourceNotes: document.getElementById('source-notes') as HTMLTextAreaElement,
  canvas: document.getElementById('editor-canvas') as HTMLCanvasElement,
  btnSave: document.getElementById('btn-save')!,
  btnCompile: document.getElementById('btn-compile')!,
  btnAddRoom: document.getElementById('btn-add-room')!,
  btnDeleteRoom: document.getElementById('btn-delete-room') as HTMLButtonElement,
  btnModeSelect: document.getElementById('btn-mode-select')!,
  btnModeDraw: document.getElementById('btn-mode-draw')!,
  btnCancelDraw: document.getElementById('btn-cancel-draw')!,
  btnSaveAlignment: document.getElementById('btn-save-alignment')!,
  btnSaveSources: document.getElementById('btn-save-sources')!,
  alignOpacity: document.getElementById('align-opacity') as HTMLInputElement,
  alignScale: document.getElementById('align-scale') as HTMLInputElement,
  alignOffsetX: document.getElementById('align-offsetX') as HTMLInputElement,
  alignOffsetZ: document.getElementById('align-offsetZ') as HTMLInputElement,
  outOpacity: document.getElementById('out-opacity')!,
  outScale: document.getElementById('out-scale')!,
  outOffsetX: document.getElementById('out-offsetX')!,
  outOffsetZ: document.getElementById('out-offsetZ')!,
};

let floors: FloorLevel[] = [];
let currentLevelId = 'main';
let currentFloor: FloorLevel | null = null;
let manifest: SourceManifest = { sources: [] };
let sourceFiles: string[] = [];
let selectedSourceId: string | null = null;
let dirty = false;
let underlayCanvas: HTMLCanvasElement | null = null;
let underlaySize: { width: number; height: number } | null = null;

const editor = new CanvasEditor({
  canvas: els.canvas,
  onSelectionChange: (roomId) => {
    renderRoomEditor(roomId);
    renderRoomList();
  },
  onDrawComplete: (polygon) => {
    if (!currentFloor) return;
    const room: Room = {
      id: slugId('room-untitled'),
      label: 'Room (untitled)',
      levelId: currentFloor.levelId,
      kind: 'gap',
      floorElevation: currentFloor.elevation,
      ceilingHeight: 2.7,
      floorPolygon: polygon,
      documentationRef: 'Added in Layout Studio — verify against scan',
    };
    currentFloor.rooms.push(room);
    editor.updateFloor(currentFloor);
    editor.setSelectedRoom(room.id);
    markDirty();
    renderRoomList();
    renderRoomEditor(room.id);
    setStatus('New room added — verify label and kind before save');
  },
  onFloorMutated: () => markDirty(),
});

function markDirty(): void {
  dirty = true;
  setStatus('Unsaved changes');
}

function setStatus(text: string): void {
  els.status.textContent = text;
}

function currentSourceForLevel(): SourceEntry | undefined {
  return manifest.sources.find((s) => s.levelId === currentLevelId);
}

async function loadUnderlay(source: SourceEntry | undefined): Promise<void> {
  underlayCanvas = null;
  underlaySize = null;

  if (!source) {
    editor.setUnderlay(null, null, null);
    return;
  }

  syncAlignmentControls(source.alignment);

  if (source.type === 'pdf') {
    try {
      const doc = await pdfjsLib.getDocument(pdfUrl(source.path)).promise;
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      underlayCanvas = canvas;
      underlaySize = { width: viewport.width / 2, height: viewport.height / 2 };
      applyUnderlayAlignment(source.alignment);
    } catch (err) {
      console.warn('PDF underlay failed', err);
      editor.setUnderlay(null, source.alignment, null);
      setStatus('PDF underlay unavailable — adjust rooms without scan');
    }
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imageUrl(source.path);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('image load failed'));
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext('2d')!.drawImage(img, 0, 0);
  underlayCanvas = canvas;
  underlaySize = { width: img.naturalWidth, height: img.naturalHeight };
  applyUnderlayAlignment(source.alignment);
}

function applyUnderlayAlignment(alignment: SourceEntry['alignment']): void {
  editor.setUnderlay(underlayCanvas, alignment, underlaySize);
}

function syncAlignmentControls(alignment: SourceEntry['alignment']): void {
  els.alignOpacity.value = String(alignment.opacity ?? 0.55);
  els.alignScale.value = String(alignment.scale);
  els.alignOffsetX.value = String(alignment.offsetX);
  els.alignOffsetZ.value = String(alignment.offsetZ);
  els.outOpacity.textContent = Number(els.alignOpacity.value).toFixed(2);
  els.outScale.textContent = Number(els.alignScale.value).toFixed(2);
  els.outOffsetX.textContent = Number(els.alignOffsetX.value).toFixed(2);
  els.outOffsetZ.textContent = Number(els.alignOffsetZ.value).toFixed(2);
}

function readAlignmentFromControls(): SourceEntry['alignment'] {
  return {
    scale: Number(els.alignScale.value),
    offsetX: Number(els.alignOffsetX.value),
    offsetZ: Number(els.alignOffsetZ.value),
    rotationDeg: currentSourceForLevel()?.alignment.rotationDeg ?? 0,
    opacity: Number(els.alignOpacity.value),
  };
}

function renderTabs(): void {
  els.floorTabs.innerHTML = '';
  for (const f of floors) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tab' + (f.levelId === currentLevelId ? ' active' : '');
    btn.textContent = f.label;
    btn.onclick = () => void selectFloor(f.levelId);
    els.floorTabs.appendChild(btn);
  }
}

function renderRoomList(): void {
  const selected = editor.getSelectedRoomId();
  els.roomList.innerHTML = '';
  for (const room of currentFloor?.rooms ?? []) {
    const div = document.createElement('div');
    div.className = 'room-item';
    if (room.kind === 'gap') div.classList.add('gap');
    if (room.kind === 'placeholder') div.classList.add('placeholder');
    if (room.id === selected) div.classList.add('selected');
    div.textContent = room.label;
    div.title = room.documentationRef ?? room.id;
    div.onclick = () => {
      editor.setSelectedRoom(room.id);
      renderRoomList();
      renderRoomEditor(room.id);
    };
    els.roomList.appendChild(div);
  }
  els.btnDeleteRoom.disabled = !selected;
}

function renderRoomEditor(roomId: string | null): void {
  if (!roomId || !currentFloor) {
    els.roomEditor.classList.add('hidden');
    return;
  }
  const room = currentFloor.rooms.find((r) => r.id === roomId);
  if (!room) {
    els.roomEditor.classList.add('hidden');
    return;
  }
  els.roomEditor.classList.remove('hidden');
  els.roomLabel.value = room.label;
  els.roomKind.value = room.kind ?? 'interior';
  els.roomId.value = room.id;
  els.vertexList.innerHTML = '';
  room.floorPolygon.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = `${i}: (${p[0].toFixed(3)}, ${p[1].toFixed(3)})`;
    els.vertexList.appendChild(li);
  });
}

function renderSources(): void {
  els.sourceList.innerHTML = '';
  for (const src of manifest.sources) {
    const div = document.createElement('div');
    div.className = 'source-item' + (src.id === selectedSourceId ? ' selected' : '');
    div.innerHTML = `<strong>${src.path}</strong><br><span class="muted">${src.type} · ${src.levelId}</span>`;
    div.onclick = () => {
      selectedSourceId = src.id;
      els.sourceNotes.value = src.notes;
      renderSources();
      if (src.levelId === currentLevelId) void loadUnderlay(src);
    };
    els.sourceList.appendChild(div);
  }

  for (const file of sourceFiles) {
    if (manifest.sources.some((s) => s.path === file)) continue;
    const div = document.createElement('div');
    div.className = 'source-item orphan';
    div.innerHTML = `<strong>${file}</strong><br><span class="muted">not in manifest</span>`;
    els.sourceList.appendChild(div);
  }

  const active = manifest.sources.find((s) => s.id === selectedSourceId);
  if (active) els.sourceNotes.value = active.notes;
}

async function selectFloor(levelId: string): Promise<void> {
  if (dirty && !confirm('Discard unsaved changes on this floor?')) return;
  currentLevelId = levelId;
  dirty = false;
  currentFloor = await fetchFloor(levelId);
  editor.setFloor(currentFloor);
  renderTabs();
  renderRoomList();
  renderRoomEditor(null);

  const source = currentSourceForLevel();
  selectedSourceId = source?.id ?? null;
  renderSources();
  await loadUnderlay(source);
  setStatus(`${currentFloor.label} loaded`);
}

async function init(): Promise<void> {
  floors = await fetchFloors();
  const sources = await fetchSources();
  manifest = sources.manifest;
  sourceFiles = sources.files;
  renderTabs();
  renderSources();
  await selectFloor(floors.some((f) => f.levelId === 'main') ? 'main' : floors[0].levelId);
  window.addEventListener('resize', () => editor.resize());
  editor.resize();
}

els.roomLabel.addEventListener('change', () => {
  const id = editor.getSelectedRoomId();
  const room = currentFloor?.rooms.find((r) => r.id === id);
  if (room) {
    room.label = els.roomLabel.value;
    markDirty();
    editor.render();
    renderRoomList();
  }
});

els.roomKind.addEventListener('change', () => {
  const id = editor.getSelectedRoomId();
  const room = currentFloor?.rooms.find((r) => r.id === id);
  if (room) {
    room.kind = els.roomKind.value as Room['kind'];
    markDirty();
    editor.render();
    renderRoomList();
  }
});

els.btnAddRoom.addEventListener('click', () => {
  editor.setMode('draw');
  els.btnModeDraw.classList.add('active');
  els.btnModeSelect.classList.remove('active');
  els.btnCancelDraw.classList.remove('hidden');
  setStatus('Draw mode: click vertices, double-click or Enter to finish');
});

els.btnModeSelect.addEventListener('click', () => {
  editor.setMode('select');
  els.btnModeSelect.classList.add('active');
  els.btnModeDraw.classList.remove('active');
  els.btnCancelDraw.classList.add('hidden');
});

els.btnModeDraw.addEventListener('click', () => els.btnAddRoom.click());

els.btnCancelDraw.addEventListener('click', () => {
  editor.cancelDraw();
  els.btnModeSelect.click();
});

els.btnDeleteRoom.addEventListener('click', () => {
  const id = editor.getSelectedRoomId();
  if (!id || !currentFloor) return;
  if (!confirm(`Delete room "${id}"?`)) return;
  currentFloor.rooms = currentFloor.rooms.filter((r) => r.id !== id);
  editor.setSelectedRoom(null);
  editor.updateFloor(currentFloor);
  markDirty();
  renderRoomList();
  renderRoomEditor(null);
});

els.btnSave.addEventListener('click', async () => {
  if (!currentFloor) return;
  try {
    currentFloor = await saveFloor(currentFloor.levelId, currentFloor);
    editor.updateFloor(currentFloor);
    dirty = false;
    setStatus(`Saved ${currentFloor.levelId}.level.json`);
  } catch (err) {
    setStatus(`Save failed: ${(err as Error).message}`);
  }
});

els.btnCompile.addEventListener('click', async () => {
  if (dirty && !confirm('Save before compile? Unsaved changes will not be included.')) return;
  els.btnCompile.textContent = 'Compiling…';
  try {
    const result = await compileLayout();
    if (result.ok) {
      setStatus('Compiled — Unity StreamingAssets updated');
    } else {
      setStatus(`Compile failed: ${result.error ?? 'unknown'}`);
    }
  } catch (err) {
    setStatus(`Compile failed: ${(err as Error).message}`);
  } finally {
    els.btnCompile.textContent = 'Compile → Unity';
  }
});

for (const [input, out] of [
  [els.alignOpacity, els.outOpacity],
  [els.alignScale, els.outScale],
  [els.alignOffsetX, els.outOffsetX],
  [els.alignOffsetZ, els.outOffsetZ],
] as const) {
  input.addEventListener('input', () => {
    out.textContent = Number(input.value).toFixed(2);
    if (!underlayCanvas) return;
    applyUnderlayAlignment(readAlignmentFromControls());
  });
}

els.btnSaveAlignment.addEventListener('click', async () => {
  const src = currentSourceForLevel();
  if (!src) {
    setStatus('No manifest entry for this floor');
    return;
  }
  src.alignment = readAlignmentFromControls();
  try {
    manifest = await saveManifest(manifest);
    setStatus('Alignment saved to manifest');
  } catch (err) {
    setStatus(`Alignment save failed: ${(err as Error).message}`);
  }
});

els.btnSaveSources.addEventListener('click', async () => {
  const src = manifest.sources.find((s) => s.id === selectedSourceId);
  if (src) src.notes = els.sourceNotes.value;
  try {
    manifest = await saveManifest(manifest);
    setStatus('Sources manifest saved');
  } catch (err) {
    setStatus(`Manifest save failed: ${(err as Error).message}`);
  }
});

init().catch((err) => {
  console.error(err);
  setStatus(`Load failed: ${(err as Error).message}`);
});
