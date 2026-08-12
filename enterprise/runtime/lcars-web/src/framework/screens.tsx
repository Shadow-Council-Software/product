import type { LcarsContext, RailItem, ScreenDefinition, ToneKey } from './types';
import { SUBSYSTEM_CODES } from '../lib/lcars-codes';
import { SvgEnvironmentalControl } from './vector/SvgEnvironmentalControl';

/**
 * Screen registry. Every screen in the domain is authored here as data; the
 * LcarsScreen renderer turns each into a scalable vector layout. Department
 * theme (themes.ts) supplies default palette, effect, and layout per family.
 */

const STATION_NAV: RailItem[] = [
  { kind: 'nav', id: 'ops.overview', label: 'Ops', code: SUBSYSTEM_CODES.ops.rail, tone: 'amber' },
  { kind: 'nav', id: 'env.subsystem', label: 'Environment', code: SUBSYSTEM_CODES.env.rail },
  { kind: 'nav', id: 'tac.overview', label: 'Tactical', code: SUBSYSTEM_CODES.tac.rail },
  { kind: 'nav', id: 'eng.engineering', label: 'Engineering', code: SUBSYSTEM_CODES.eng.rail },
  { kind: 'nav', id: 'sci.overview', label: 'Science', code: SUBSYSTEM_CODES.sci.rail },
  { kind: 'nav', id: 'ops.conflict', label: 'Conflict', code: SUBSYSTEM_CODES.conflict.rail, tone: 'tan' },
];

const alertTone = (ctx: LcarsContext): ToneKey =>
  ctx.alertPhase === 'Red' ? 'red' : ctx.alertPhase === 'Yellow' ? 'gold' : 'green';

const alertText = (ctx: LcarsContext): string =>
  ctx.alertPhase === 'Normal' ? 'Condition Green' : `${ctx.alertPhase} Alert`;

const RAIL_READOUTS: RailItem[] = [
  { kind: 'spacer', id: 'sp', flex: 1 },
  { kind: 'readout', id: 'alert', label: 'Alert Condition', value: alertText, tone: alertTone },
  {
    kind: 'readout',
    id: 'authority',
    label: 'Authority',
    value: (ctx) => (ctx.conflictActive ? 'CONFLICT' : 'Main Computer'),
    tone: (ctx) => (ctx.conflictActive ? 'red' : 'iceBlue'),
  },
  {
    kind: 'readout',
    id: 'clearance',
    label: 'Authorization',
    value: (ctx) => `${ctx.clearance} · L${ctx.clearance === 'Captain' ? 9 : ctx.clearance === 'Crew' ? 4 : 1}`,
    tone: 'lavender',
  },
  { kind: 'cap', id: 'cap', label: '1701-D', tone: 'inactive' },
];

const rail = (): RailItem[] => [...STATION_NAV, ...RAIL_READOUTS];

const envControl = (height: number) =>
  ({
    kind: 'svgcontrol' as const,
    id: 'live-env',
    height,
    render: (ctx: LcarsContext, geo: { x: number; y: number; w: number }) => (
      <SvgEnvironmentalControl x={geo.x} y={geo.y} w={geo.w} ctx={ctx} />
    ),
  });

export const SCREENS: ScreenDefinition[] = [
  {
    id: 'ops.overview',
    family: 'Ops — Command',
    title: 'Bridge at a Glance',
    code: 'OPS-001',
    deck: 'Bridge',
    rail: rail(),
    panels: [
      {
        id: 'vessel',
        title: 'Vessel Status',
        code: 'VS-48',
        span: 2,
        blocks: [
          { kind: 'status', id: 'posture', label: 'Posture', state: () => ({ text: 'Hybrid', tone: 'peach' }) },
          { kind: 'status', id: 'alert', label: 'Alert', state: (c) => ({ text: alertText(c), tone: alertTone(c) }) },
          { kind: 'status', id: 'auth', label: 'Authority', state: (c) => (c.conflictActive ? { text: 'Conflict', tone: 'red' } : { text: 'Main Computer', tone: 'iceBlue' }) },
          { kind: 'text', id: 'site', label: 'Site', body: () => 'Residence One · Central Hall · 6 departments online.' },
        ],
      },
      { id: 'env-tile', title: 'Environment', code: 'ENV-513', span: 1, tone: 'iceBlue', blocks: [
        { kind: 'metric', id: 'temp', label: 'Deck 8 · Current', value: '21.5', unit: '°C', tone: 'butterscotch' },
        { kind: 'status', id: 'pin', label: 'Quick Env', state: (c) => (c.alertPhase === 'Normal' ? { text: 'Pinned', tone: 'green' } : { text: 'Suspended', tone: 'inactive' }) },
      ] },
      { id: 'tac-tile', title: 'Tactical', code: 'TAC-204', span: 1, tone: 'peach', blocks: [
        { kind: 'status', id: 'perimeter', label: 'Perimeter', state: (c) => (c.alertPhase === 'Red' ? { text: 'Breach Watch', tone: 'red' } : { text: 'Secure', tone: 'green' }) },
      ] },
      { id: 'eng-tile', title: 'Engineering', code: 'ENG-621', span: 1, tone: 'amber', blocks: [
        { kind: 'status', id: 'core', label: 'Warp Core', state: () => ({ text: 'Nominal', tone: 'green' }) },
      ] },
      { id: 'sci-tile', title: 'Science', code: 'SCI-880', span: 1, tone: 'lavender', blocks: [
        { kind: 'status', id: 'sensors', label: 'Sensors', state: () => ({ text: 'Standby', tone: 'inactive' }) },
      ] },
    ],
  },
  {
    id: 'eng.engineering',
    family: 'Engineering',
    title: 'Engineering · Main Computer',
    code: 'ENG-621',
    deck: 'Deck 8',
    decor: 'warpcore',
    layout: 'feature',
    rail: rail(),
    panels: [
      {
        id: 'env-auth',
        title: 'Environmental Authority',
        code: 'ENV-513',
        blocks: [
          { kind: 'text', id: 'note', body: () => 'Engineering holds house-wide environmental authority. Core animation is diegetic; the control below is live.' },
          envControl(320),
        ],
      },
      {
        id: 'core',
        title: 'Warp Core',
        code: 'WC-47',
        blocks: [
          { kind: 'metric', id: 'output', label: 'Core Output', value: (c) => (c.alertPhase === 'Red' ? '112' : '86'), unit: '%', tone: (c) => (c.alertPhase === 'Red' ? 'red' : 'butterscotch') },
          { kind: 'status', id: 'intermix', label: 'Intermix', state: (c) => (c.alertPhase === 'Red' ? { text: 'Forced', tone: 'red' } : { text: 'Stable', tone: 'green' }) },
        ],
      },
    ],
  },
  {
    id: 'env.subsystem',
    family: 'Environmental',
    title: 'Environmental Control',
    code: 'ENV-513',
    deck: 'Deck 8',
    rail: rail(),
    panels: [
      { id: 'env-live', title: 'Environmental Control', code: 'ENV-513', blocks: [envControl(340)] },
      { id: 'guest-note', title: 'Guest Profile', code: 'GST-04', visibleWhen: (c) => c.clearance === 'Guest', blocks: [
        { kind: 'text', id: 'hosp', body: () => 'Guest session: environmental controls are read-only. Hospitality profile active — request crew assistance for adjustments.' },
      ] },
    ],
  },
  {
    id: 'ops.conflict',
    family: 'Conflict & Coexistence',
    title: 'Conflict Reconcile',
    code: 'CFL-16',
    deck: 'Ops',
    rail: rail(),
    panels: [
      { id: 'conflict', title: 'Authority Conflict', code: 'CFL-16', blocks: [
        { kind: 'status', id: 'state', label: 'State', state: (c) => (c.conflictActive ? { text: 'Active — Commands Locked', tone: 'red' } : { text: 'Clear', tone: 'green' }) },
        { kind: 'text', id: 'detail', label: 'Contradiction', body: (c) => (c.conflictActive ? 'Main Computer and Google Home both issued setpoint authority. Reconcile to a single controller or dismiss to hold the lockout.' : 'No competing authority detected. Setpoint and escalation commands available.') },
      ] },
    ],
  },
  {
    id: 'tac.overview',
    family: 'Tactical',
    title: 'Tactical Posture',
    code: 'TAC-204',
    deck: 'Ops',
    rail: rail(),
    panels: [
      { id: 'tac', title: 'Perimeter Watch', code: 'TAC-204', blocks: [
        { kind: 'status', id: 'perimeter', label: 'Perimeter', state: (c) => (c.alertPhase === 'Red' ? { text: 'Breach Watch', tone: 'red' } : { text: 'Secure', tone: 'green' }) },
        { kind: 'status', id: 'lock', label: 'Authority Lock', state: (c) => ({ text: c.clearance === 'Captain' ? 'Command Cleared' : 'Restricted', tone: c.clearance === 'Captain' ? 'green' : 'inactive' }) },
        { kind: 'text', id: 'note', body: () => 'Escalation to Battle Stations requires command acknowledgment. Tactical station is a registered renderer of the Station API.' },
      ] },
      { id: 'scan', title: 'Sensor Sweep', code: 'SS-09', blocks: [
        { kind: 'status', id: 'sweep', label: 'Scan', state: (c) => (c.alertPhase === 'Red' ? { text: 'Active Lock', tone: 'red' } : { text: 'Passive', tone: 'iceBlue' }) },
      ] },
    ],
  },
  {
    id: 'sci.overview',
    family: 'Science',
    title: 'Science Station',
    code: 'SCI-880',
    deck: 'Ops',
    rail: rail(),
    panels: [
      { id: 'sci', title: 'Sensor Array', code: 'SCI-880', span: 2, blocks: [
        { kind: 'status', id: 'sensors', label: 'Sensors', state: () => ({ text: 'Standby', tone: 'inactive' }) },
        { kind: 'text', id: 'note', body: () => 'Science station registered, no live hardware bound. Awaiting subsystem commissioning per onboarding flow.' },
      ] },
      { id: 'astro', title: 'Stellar Cartography', code: 'AC-12', span: 1, blocks: [
        { kind: 'status', id: 'chart', label: 'Chart', state: () => ({ text: 'Nominal', tone: 'green' }) },
      ] },
      { id: 'spec', title: 'Spectral', code: 'SP-31', span: 1, blocks: [
        { kind: 'status', id: 'band', label: 'Band', state: () => ({ text: 'Idle', tone: 'inactive' }) },
      ] },
    ],
  },
];

export const SCREEN_MAP: Record<string, ScreenDefinition> = Object.fromEntries(
  SCREENS.map((s) => [s.id, s]),
);
