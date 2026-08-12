import { motion, useReducedMotion } from 'framer-motion';
import type {
  Dynamic,
  LayoutKind,
  LcarsContext,
  PanelBlock,
  PanelDef,
  RailItem,
  ScreenDefinition,
  ToneKey,
} from './types';
import { alertHue, conditionLabel, CREAM, FIELD, INK, MUTED, READOUT, TONE } from './palette';
import { themeFor } from './themes';
import { blockPath, elbowPath } from './vector/geometry';
import { Starfield } from './vector/Starfield';
import { WarpCore } from './vector/WarpCore';
import { EnergyField, LcarsFilters, NebulaField } from './vector/effects';
import { ScannerSweep } from './vector/ScannerSweep';

const VIEW_W = 1280;
const VIEW_H = 812; // fixed — whole screen scales, never scrolls
const PAD = 8;
const RAIL_W = 216;
const BAR_H = 60;
const BRAND_H = 128;
// Locked to the token values in tokens/okuda.css (--okuda-elbow-outer / --okuda-elbow-inner).
const ELBOW_OUTER = 64;
const INNER_R = 30;
const RING_INSET = 5; // half the alert-frame stroke; outer edge sits on the viewBox border

const CONTENT_X = RAIL_W + PAD;
const CONTENT_W = VIEW_W - CONTENT_X;
const CONTENT_Y = BAR_H + PAD;
const CONTENT_H = VIEW_H - CONTENT_Y;

const FONT = "'Antonio', 'Oswald', 'Arial Narrow', sans-serif";

function resolve<T>(v: Dynamic<T>, ctx: LcarsContext): T {
  return typeof v === 'function' ? (v as (c: LcarsContext) => T)(ctx) : v;
}

function tone(key: ToneKey | undefined, fallback: ToneKey): string {
  return TONE[key ?? fallback];
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

const TITLE_BAND = 34;

function blockHeight(block: PanelBlock, ctx: LcarsContext, innerW: number): number {
  switch (block.kind) {
    case 'metric':
      return 64;
    case 'status':
      return 34;
    case 'svgcontrol':
    case 'custom':
      return block.height;
    case 'text': {
      const maxChars = Math.max(12, Math.floor(innerW / 7.2));
      const lines = wrapText(resolve(block.body, ctx), maxChars).length + (block.label ? 1 : 0);
      return 12 + lines * 18;
    }
  }
}

function panelHeight(panel: PanelDef, ctx: LcarsContext, innerW: number): number {
  const blocks = panel.blocks.reduce((sum, b) => sum + blockHeight(b, ctx, innerW) + 8, 0);
  return TITLE_BAND + blocks + 14;
}

interface Placed {
  panel: PanelDef;
  x: number;
  y: number;
  w: number;
  h: number;
}

function visiblePanels(panels: PanelDef[], ctx: LcarsContext): PanelDef[] {
  return panels.filter((p) => !p.visibleWhen || p.visibleWhen(ctx));
}

function layoutGrid(panels: PanelDef[], ctx: LcarsContext): Placed[] {
  const colW = (CONTENT_W - PAD) / 2;
  let yL = CONTENT_Y;
  let yR = CONTENT_Y;
  const placed: Placed[] = [];
  for (const panel of panels) {
    const span = panel.span ?? 1;
    if (span === 2) {
      const y = Math.max(yL, yR);
      const h = panelHeight(panel, ctx, CONTENT_W - 28);
      placed.push({ panel, x: CONTENT_X, y, w: CONTENT_W, h });
      yL = yR = y + h + PAD;
    } else {
      const leftShorter = yL <= yR;
      const x = leftShorter ? CONTENT_X : CONTENT_X + colW + PAD;
      const y = leftShorter ? yL : yR;
      const h = panelHeight(panel, ctx, colW - 28);
      placed.push({ panel, x, y, w: colW, h });
      if (leftShorter) yL = y + h + PAD;
      else yR = y + h + PAD;
    }
  }
  return placed;
}

function layoutConsole(panels: PanelDef[], ctx: LcarsContext): Placed[] {
  let y = CONTENT_Y;
  const placed: Placed[] = [];
  for (const panel of panels) {
    const h = panelHeight(panel, ctx, CONTENT_W - 28);
    placed.push({ panel, x: CONTENT_X, y, w: CONTENT_W, h });
    y += h + PAD;
  }
  return placed;
}

/** Feature: first panel is a tall left feature column; rest stack on the right. */
function layoutFeature(panels: PanelDef[], ctx: LcarsContext): Placed[] {
  if (panels.length === 0) return [];
  const leftW = Math.round(CONTENT_W * 0.6);
  const rightW = CONTENT_W - leftW - PAD;
  const [feature, ...rest] = panels;
  const placed: Placed[] = [
    { panel: feature, x: CONTENT_X, y: CONTENT_Y, w: leftW, h: CONTENT_H - PAD },
  ];
  let y = CONTENT_Y;
  const rx = CONTENT_X + leftW + PAD;
  for (const panel of rest) {
    const h = panelHeight(panel, ctx, rightW - 28);
    placed.push({ panel, x: rx, y, w: rightW, h });
    y += h + PAD;
  }
  return placed;
}

function layoutPanels(panels: PanelDef[], ctx: LcarsContext, layout: LayoutKind): Placed[] {
  const vis = visiblePanels(panels, ctx);
  if (layout === 'console') return layoutConsole(vis, ctx);
  if (layout === 'feature') return layoutFeature(vis, ctx);
  return layoutGrid(vis, ctx);
}

function BlockView({ block, x, y, w, ctx }: { block: PanelBlock; x: number; y: number; w: number; ctx: LcarsContext }) {
  if (block.kind === 'metric') {
    return (
      <g>
        <path d={blockPath(x, y, w, 60, { tl: INNER_R, bl: INNER_R })} fill={INK} />
        <text x={x + 16} y={y + 20} fill={MUTED} fontFamily={FONT} fontSize={11} letterSpacing="1.5">
          {block.label.toUpperCase()}
        </text>
        <text x={x + 16} y={y + 50} fill={tone(resolve(block.tone, ctx), 'butterscotch')} fontFamily={FONT} fontSize={32} fontWeight={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {resolve(block.value, ctx)}
          {block.unit ? <tspan fontSize={16} fill={MUTED} dx={6}>{block.unit}</tspan> : null}
        </text>
      </g>
    );
  }
  if (block.kind === 'status') {
    const st = block.state(ctx);
    return (
      <g>
        <path d={blockPath(x, y, w, 30, { tl: INNER_R, bl: INNER_R })} fill={TONE[st.tone]} />
        <text x={x + 16} y={y + 20} fill={INK} fontFamily={FONT} fontSize={12} fontWeight={700} letterSpacing="1">
          {block.label.toUpperCase()}
        </text>
        <text x={x + w - 16} y={y + 20} fill={INK} fontFamily={FONT} fontSize={12} fontWeight={700} textAnchor="end" letterSpacing="1">
          {st.text.toUpperCase()}
        </text>
      </g>
    );
  }
  if (block.kind === 'text') {
    const maxChars = Math.max(12, Math.floor(w / 7.2));
    const lines = wrapText(resolve(block.body, ctx), maxChars);
    return (
      <g>
        {block.label ? (
          <text x={x} y={y + 12} fill={TONE.iceBlue} fontFamily={FONT} fontSize={11} letterSpacing="1.5">
            {block.label.toUpperCase()}
          </text>
        ) : null}
        {lines.map((ln, i) => (
          <text key={i} x={x} y={y + (block.label ? 32 : 14) + i * 18} fill={CREAM} fontFamily={FONT} fontSize={14}>
            {ln}
          </text>
        ))}
      </g>
    );
  }
  if (block.kind === 'svgcontrol') {
    return <>{block.render(ctx, { x, y, w })}</>;
  }
  // custom -> foreignObject (escape hatch)
  return (
    <foreignObject x={x} y={y} width={w} height={block.height}>
      <div style={{ width: '100%', height: '100%' }}>{block.render(ctx)}</div>
    </foreignObject>
  );
}

function PanelView({ placed, ctx, accent }: { placed: Placed; ctx: LcarsContext; accent: ToneKey }) {
  const { panel, x, y, w, h } = placed;
  const panelAccent = tone(panel.tone, accent);
  const innerX = x + 14;
  const innerW = w - 28;
  const offsets: number[] = [];
  panel.blocks.reduce((acc, b) => {
    offsets.push(acc);
    return acc + blockHeight(b, ctx, innerW) + 8;
  }, y + TITLE_BAND);
  return (
    <g>
      <path d={blockPath(x, y, w, h, { br: INNER_R })} fill={READOUT} fillOpacity={0.94} />
      <rect x={x} y={y} width={w} height={26} fill={INK} />
      <text x={innerX} y={y + 18} fill={panelAccent} fontFamily={FONT} fontSize={15} fontWeight={700} letterSpacing="1.2">
        {panel.title.toUpperCase()}
      </text>
      {panel.code ? (
        <text x={x + w - 14} y={y + 18} fill={MUTED} fontFamily={FONT} fontSize={11} textAnchor="end" letterSpacing="1.4" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {panel.code}
        </text>
      ) : null}
      {panel.blocks.map((b, i) => (
        <BlockView key={b.id} block={b} x={innerX} y={offsets[i]} w={innerW} ctx={ctx} />
      ))}
    </g>
  );
}

function railLayout(items: RailItem[]) {
  const top = BRAND_H + PAD;
  const heights: Record<string, number> = { nav: 46, readout: 56, cap: 50 };
  const fixed = items.reduce((s, it) => s + (it.kind === 'spacer' ? 0 : heights[it.kind]) + PAD, 0);
  const flexTotal = items.reduce((s, it) => s + (it.kind === 'spacer' ? it.flex ?? 1 : 0), 0);
  const free = Math.max(0, VIEW_H - top - fixed);
  let cursor = top;
  return items.map((it) => {
    const h = it.kind === 'spacer' ? (flexTotal ? (free * (it.flex ?? 1)) / flexTotal : 0) : heights[it.kind];
    const y = cursor;
    cursor += h + PAD;
    return { item: it, y, h };
  });
}

function Background({ effect, ctx }: { effect: string; ctx: LcarsContext }) {
  const common = { x: CONTENT_X, y: CONTENT_Y, width: CONTENT_W, height: CONTENT_H, alertPhase: ctx.alertPhase };
  switch (effect) {
    case 'starfield':
      return (
        <>
          <rect {...{ x: CONTENT_X, y: CONTENT_Y, width: CONTENT_W, height: CONTENT_H }} fill="#04060c" />
          <Starfield width={VIEW_W} height={VIEW_H} alertPhase={ctx.alertPhase} />
        </>
      );
    case 'nebula':
      return <NebulaField {...common} />;
    case 'energy':
      return <EnergyField {...common} />;
    case 'tactical':
      return <ScannerSweep {...common} />;
    case 'warpcore':
      return (
        <>
          <rect x={CONTENT_X} y={CONTENT_Y} width={CONTENT_W} height={CONTENT_H} fill={FIELD} />
          <WarpCore cx={VIEW_W - 120} y={CONTENT_Y + 24} height={CONTENT_H - 48} alertPhase={ctx.alertPhase} />
        </>
      );
    default:
      return <rect x={CONTENT_X} y={CONTENT_Y} width={CONTENT_W} height={CONTENT_H} fill={FIELD} />;
  }
}

export interface LcarsScreenProps {
  screen: ScreenDefinition;
  ctx: LcarsContext;
  activeNavId?: string;
  onNavSelect?: (id: string) => void;
}

export function LcarsScreen({ screen, ctx, activeNavId, onNavSelect }: LcarsScreenProps) {
  const reduced = useReducedMotion();
  const theme = themeFor(screen.family);
  const effect = screen.decor ?? theme.effect;
  const layout = screen.layout ?? theme.layout;
  const ringHue = alertHue(ctx.alertPhase);
  const condition = conditionLabel(ctx.alertPhase);
  // Alert hue overrides chrome so Yellow/Red are never the same as department amber.
  const headerColor = ringHue ?? TONE[theme.accent];
  const placed = layoutPanels(screen.panels, ctx, layout);
  const rail = railLayout(screen.rail);

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${screen.title} LCARS screen`} style={{ display: 'block', background: '#000' }}>
      <LcarsFilters />

      <clipPath id="lcars-content-clip">
        <path d={blockPath(CONTENT_X, CONTENT_Y, CONTENT_W, CONTENT_H, { br: INNER_R })} />
      </clipPath>
      <g clipPath="url(#lcars-content-clip)">
        <Background effect={effect} ctx={ctx} />
      </g>

      {/* elbow frame */}
      <motion.path
        key={`${ctx.alertPhase}-${headerColor}`}
        d={elbowPath({ x: 0, y: 0, railWidth: RAIL_W, barHeight: BAR_H, width: VIEW_W, height: BRAND_H, outer: ELBOW_OUTER })}
        fill={headerColor}
        initial={reduced ? false : { opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {ctx.alertPhase === 'Red' && !reduced && (
        <motion.path
          d={elbowPath({ x: 0, y: 0, railWidth: RAIL_W, barHeight: BAR_H, width: VIEW_W, height: BRAND_H, outer: ELBOW_OUTER })}
          fill="#5a0d0d"
          animate={{ opacity: [0, 0, 1, 1] }}
          transition={{ duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: 'linear' }}
        />
      )}
      <text x={42} y={42} fill={INK} fontFamily={FONT} fontSize={22} fontWeight={700} letterSpacing="2">
        LCARS
      </text>
      <text x={CONTENT_X + 6} y={40} fill={INK} fontFamily={FONT} fontSize={24} fontWeight={700} letterSpacing="2">
        {screen.title.toUpperCase()}
      </text>
      <text x={VIEW_W - 16} y={40} fill={INK} fontFamily={FONT} fontSize={condition ? 18 : 14} fontWeight={condition ? 800 : 600} textAnchor="end" letterSpacing="2.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {condition ?? `${screen.code}${screen.deck ? ` · ${screen.deck}` : ''}`}
      </text>

      {/* rail */}
      {rail.map(({ item, y, h }) => {
        if (item.kind === 'spacer') return null;
        if (item.kind === 'nav') {
          const active = item.id === activeNavId;
          const fill = active ? TONE[theme.accent] : tone(item.tone, 'butterscotch');
          return (
            <g key={item.id} style={{ cursor: 'pointer' }} onClick={() => onNavSelect?.(item.id)} role="button" aria-pressed={active}>
              <path d={blockPath(0, y, RAIL_W, h, { tl: INNER_R, bl: INNER_R })} fill={fill} />
              <text x={16} y={y + h / 2 + 5} fill={INK} fontFamily={FONT} fontSize={14} fontWeight={600} letterSpacing="1">
                {item.label.toUpperCase()}
              </text>
              {item.code ? (
                <text x={RAIL_W - 12} y={y + h / 2 + 5} fill={INK} fontFamily={FONT} fontSize={10} textAnchor="end" opacity={0.7} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {item.code}
                </text>
              ) : null}
            </g>
          );
        }
        if (item.kind === 'readout') {
          const t = resolve(item.tone, ctx) ?? 'inactive';
          return (
            <g key={item.id}>
              <path d={blockPath(0, y, RAIL_W, h, { tl: INNER_R, bl: INNER_R })} fill={READOUT} />
              <text x={16} y={y + 20} fill={MUTED} fontFamily={FONT} fontSize={10} letterSpacing="1.4">
                {item.label.toUpperCase()}
              </text>
              <text x={16} y={y + 42} fill={TONE[t]} fontFamily={FONT} fontSize={18} fontWeight={700} letterSpacing="0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {resolve(item.value, ctx).toUpperCase()}
              </text>
            </g>
          );
        }
        return (
          <g key={item.id}>
            <path d={blockPath(0, y, RAIL_W, h, { tl: INNER_R, bl: ELBOW_OUTER })} fill={tone(item.tone, 'inactive')} />
            <text x={RAIL_W - 14} y={y + h / 2 + 5} fill={INK} fontFamily={FONT} fontSize={14} fontWeight={600} textAnchor="end" letterSpacing="1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {item.label.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* panels */}
      {placed.map((p) => (
        <PanelView key={p.panel.id} placed={p} ctx={ctx} accent={theme.accent} />
      ))}

      {/* screen-wide alert frame ring — gold steady (Yellow) / red hard-blink (Red),
          with rotating contrast lines marching around the perimeter.
          Reads across the room on any department palette; independent of chrome. */}
      {ringHue && (
        <motion.path
          key={`ring-${ctx.alertPhase}`}
          // Traces the true LCARS outer silhouette (corner radii match the elbow
          // and content cage), so the top/left limbs merge into the chrome and only
          // the open content edges read as a bezel — part of the display, not on top.
          d={blockPath(RING_INSET, RING_INSET, VIEW_W - RING_INSET * 2, VIEW_H - RING_INSET * 2, {
            tl: ELBOW_OUTER - RING_INSET,
            tr: 0,
            br: INNER_R - RING_INSET,
            bl: ELBOW_OUTER - RING_INSET,
          })}
          fill="none"
          stroke={ringHue}
          strokeWidth={RING_INSET * 2}
          pointerEvents="none"
          initial={reduced ? false : { opacity: 0 }}
          animate={
            reduced
              ? { opacity: 1 }
              : ctx.alertPhase === 'Red'
                ? { opacity: [1, 1, 0.15, 0.15] }
                : { opacity: 1 }
          }
          transition={
            reduced
              ? { duration: 0 }
              : ctx.alertPhase === 'Red'
                ? { duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: 'linear' }
                : { duration: 0.5, ease: 'easeOut' }
          }
        />
      )}
    </svg>
  );
}
