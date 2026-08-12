import type { ReactNode } from 'react';

/**
 * LCARS layout framework — declarative screen schema.
 *
 * A screen is described as data: a left rail spine, a set of content panels,
 * and optional decorative vector layers. The renderer (LcarsScreen) computes a
 * pure-SVG layout from this description, so every screen scales infinitely and
 * new screens are authored as data, not bespoke components.
 */

export type AlertPhase = 'Normal' | 'Yellow' | 'Red';
export type Clearance = 'Guest' | 'Crew' | 'Captain';

/** Okuda department palette keys — color is information. */
export type ToneKey =
  | 'amber'
  | 'butterscotch'
  | 'peach'
  | 'lavender'
  | 'iceBlue'
  | 'tan'
  | 'inactive'
  | 'red'
  | 'green'
  | 'gold';

/** Runtime context every dynamic accessor receives. */
export interface LcarsContext {
  alertPhase: AlertPhase;
  clearance: Clearance;
  conflictActive: boolean;
}

/** Value that may be static or derived from context. */
export type Dynamic<T> = T | ((ctx: LcarsContext) => T);

/** Background effect layer (built from native SVG filters + Motion/GSAP). */
export type EffectKind = 'none' | 'starfield' | 'warpcore' | 'nebula' | 'energy' | 'tactical';

/** @deprecated use EffectKind */
export type DecorKind = EffectKind;

/** Per-department layout template. */
export type LayoutKind = 'grid' | 'feature' | 'console';

/* ---------- Left rail spine items ---------- */

export interface RailNav {
  kind: 'nav';
  id: string;
  label: string;
  code?: string;
  tone?: ToneKey;
}

export interface RailReadout {
  kind: 'readout';
  id: string;
  label: string;
  value: Dynamic<string>;
  tone?: Dynamic<ToneKey>;
}

export interface RailCap {
  kind: 'cap';
  id: string;
  label: string;
  tone?: ToneKey;
}

export interface RailSpacer {
  kind: 'spacer';
  id: string;
  /** Relative flex weight for distributing leftover rail height. */
  flex?: number;
}

export type RailItem = RailNav | RailReadout | RailCap | RailSpacer;

/* ---------- Content panel blocks ---------- */

export interface MetricBlock {
  kind: 'metric';
  id: string;
  label: string;
  value: Dynamic<string>;
  unit?: string;
  tone?: Dynamic<ToneKey>;
}

export interface TextBlock {
  kind: 'text';
  id: string;
  label?: string;
  body: Dynamic<string>;
}

export interface StatusBlock {
  kind: 'status';
  id: string;
  label: string;
  state: (ctx: LcarsContext) => { text: string; tone: ToneKey };
}

/** Pure-SVG interactive control rendered inline (no foreignObject). */
export interface SvgControlBlock {
  kind: 'svgcontrol';
  id: string;
  height: number;
  render: (ctx: LcarsContext, geo: { x: number; y: number; w: number }) => ReactNode;
}

/** Escape hatch: arbitrary interactive React rendered via <foreignObject>. */
export interface CustomBlock {
  kind: 'custom';
  id: string;
  height: number;
  render: (ctx: LcarsContext) => ReactNode;
}

export type PanelBlock = MetricBlock | TextBlock | StatusBlock | SvgControlBlock | CustomBlock;

export interface PanelDef {
  id: string;
  title: string;
  code?: string;
  /** Column span in the content grid (1 = half width, 2 = full width). */
  span?: 1 | 2;
  tone?: ToneKey;
  blocks: PanelBlock[];
  visibleWhen?: (ctx: LcarsContext) => boolean;
}

export interface ScreenDefinition {
  id: string;
  family: string;
  title: string;
  code: string;
  deck?: string;
  /** Background effect; defaults to the department theme's effect. */
  decor?: EffectKind;
  /** Layout template; defaults to the department theme's layout. */
  layout?: LayoutKind;
  rail: RailItem[];
  panels: PanelDef[];
}

/** Department theme: palette accent + default effect + default layout. */
export interface DepartmentTheme {
  accent: ToneKey;
  secondary: ToneKey;
  effect: EffectKind;
  layout: LayoutKind;
}
