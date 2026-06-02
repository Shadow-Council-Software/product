import { setup, assign } from 'xstate';

export type AlertPhase = 'Normal' | 'Yellow' | 'Red';

export interface AlertContext {
  phase: AlertPhase;
  lastTransitionTs: number;
  acknowledgedBy: string | null;
}

export type AlertEvent =
  | { type: 'ESCALATE' }
  | { type: 'BATTLE_STATIONS_CONFIRM'; actor: string }
  | { type: 'STAND_DOWN' };

export const alertMachine = setup({
  types: {
    context: {} as AlertContext,
    events: {} as AlertEvent,
  },
}).createMachine({
  id: 'alertFsm',
  initial: 'Normal',
  context: {
    phase: 'Normal',
    lastTransitionTs: Date.now(),
    acknowledgedBy: null,
  },
  states: {
    Normal: {
      on: {
        ESCALATE: {
          target: 'Yellow',
          actions: assign({
            phase: 'Yellow',
            lastTransitionTs: () => Date.now(),
            acknowledgedBy: () => null,
          }),
        },
      },
    },
    Yellow: {
      on: {
        BATTLE_STATIONS_CONFIRM: {
          target: 'Red',
          actions: assign({
            phase: 'Red',
            lastTransitionTs: () => Date.now(),
            acknowledgedBy: ({ event }) => event.actor,
          }),
        },
        STAND_DOWN: {
          target: 'Normal',
          actions: assign({
            phase: 'Normal',
            lastTransitionTs: () => Date.now(),
            acknowledgedBy: () => null,
          }),
        },
      },
    },
    Red: {
      on: {
        STAND_DOWN: {
          target: 'Normal',
          actions: assign({
            phase: 'Normal',
            lastTransitionTs: () => Date.now(),
            acknowledgedBy: () => null,
          }),
        },
      },
    },
  },
});

export function getPhaseFromState(stateValue: unknown): AlertPhase {
  if (stateValue === 'Normal' || stateValue === 'Yellow' || stateValue === 'Red') {
    return stateValue;
  }
  return 'Normal';
}
