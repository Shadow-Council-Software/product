import { createActor } from 'xstate';
import type { FastifyInstance } from 'fastify';
import { createEventEnvelope, type EventEnvelopeV1 } from '@enterprise/event-envelope';
import { createOutcome } from '@enterprise/tng-outcomes';
import { NEST_PRIMARY_STATION_ID, THERMOSTAT_LOCAL_TEMP, type MatterAdapterPort } from '@enterprise/matter-port';
import { alertMachine, getPhaseFromState } from '../domain/alert-fsm.js';
import { ConflictTracker } from '../domain/conflict-tracker.js';
import { AlertStore } from '../persistence/db.js';
import { clearancePlugin, requireClearance } from '../middleware/clearance.js';
import { isBattleStationsGateEnabled } from '../config/security.js';

type Broadcast = (event: EventEnvelopeV1) => void;

const STALE_MS = Number(process.env.FRESHNESS_STALE_MS ?? 15_000);

export async function registerRoutes(
  app: FastifyInstance,
  adapter: MatterAdapterPort,
  store: AlertStore,
  broadcast: Broadcast,
  conflictTracker = new ConflictTracker()
): Promise<void> {
  app.addHook('preHandler', clearancePlugin);

  const persisted = store.get()!;
  const actor = createActor(alertMachine, {
    snapshot: alertMachine.resolveState({
      value: persisted.phase,
      context: {
        phase: persisted.phase,
        lastTransitionTs: persisted.lastTransitionTs,
        acknowledgedBy: persisted.acknowledgedBy,
      },
    }),
  });
  actor.start();

  function broadcastConflictIfNeeded(): void {
    const state = conflictTracker.getState();
    if (state.active) {
      broadcast(createEventEnvelope('ConflictDetected', state));
    }
  }

  function persistAndBroadcast(eventType: 'AlertPhaseChanged', _phase: string, actorName?: string) {
    const ctx = actor.getSnapshot().context;
    store.save({
      phase: ctx.phase,
      lastTransitionTs: ctx.lastTransitionTs,
      acknowledgedBy: ctx.acknowledgedBy,
    });
    broadcast(
      createEventEnvelope(eventType, {
        phase: ctx.phase,
        acknowledgedBy: ctx.acknowledgedBy,
        actor: actorName ?? null,
      })
    );
  }

  adapter.subscribe((nodeEvent) => {
    if (nodeEvent.type === 'attribute_updated') {
      conflictTracker.recordExternalUpdate('google');
      broadcastConflictIfNeeded();
    }
    broadcast(createEventEnvelope('StationUpdated', nodeEvent));
  });

  app.get('/api/v1/stations', async (_request, reply) => {
    const stations = await adapter.getStations();
    for (const s of stations) {
      store.upsertStation(s.stationId, s.nodeId, s.authority);
    }
    return reply.send({ stations });
  });

  app.get('/api/v1/alerts', async (_request, reply) => {
    const ctx = actor.getSnapshot().context;
    return reply.send({
      phase: ctx.phase,
      lastTransitionTs: ctx.lastTransitionTs,
      acknowledgedBy: ctx.acknowledgedBy,
    });
  });

  app.get('/api/v1/system/conflict', async (_request, reply) => {
    return reply.send(conflictTracker.getState());
  });

  app.post(
    '/api/v1/system/conflict/reconcile',
    { preHandler: requireClearance('Captain') },
    async (request, reply) => {
      conflictTracker.clear();
      store.audit('conflict.reconcile', request.clearance, 'cleared');
      return reply.send(createOutcome('Acknowledged', 'Conflict reconciled'));
    }
  );

  app.post(
    '/api/v1/commands/setpoint',
    { preHandler: requireClearance('Crew') },
    async (request, reply) => {
      const conflict = conflictTracker.getState();
      if (conflict.active) {
        return reply.status(409).send(
          createOutcome('Denied', 'Commands blocked during CONFLICT', {
            cause: 'conflict_active',
            remediation: 'Complete ConflictReconcile before commanding',
          })
        );
      }
      const body = (request.body ?? {}) as {
        stationId?: string;
        path?: string;
        value?: unknown;
      };
      const stationId = body.stationId ?? NEST_PRIMARY_STATION_ID;
      const path = body.path ?? THERMOSTAT_LOCAL_TEMP;
      const receipt = await adapter.writeAttribute(stationId, path, body.value);
      if (receipt.outcomeType === 'Acknowledged' || receipt.outcomeType === 'Pending') {
        conflictTracker.recordWrite('enterprise');
        broadcast(
          createEventEnvelope('SetpointCommanded', {
            stationId,
            path,
            value: body.value,
            receiptId: receipt.receiptId,
            actor: request.clearance,
          })
        );
        store.audit('command.setpoint', request.clearance, `${stationId} ${path}=${String(body.value)}`);
      }
      const outcomeType = receipt.outcomeType ?? 'Pending';
      return reply.send(
        createOutcome(outcomeType, `Setpoint ${outcomeType.toLowerCase()}`, {
          receiptId: receipt.receiptId,
        })
      );
    }
  );

  if (process.env.ALLOW_TEST_HOOKS === '1') {
    app.post('/api/v1/test/simulate-conflict', async (_request, reply) => {
      conflictTracker.simulateConflict();
      broadcastConflictIfNeeded();
      return reply.send(conflictTracker.getState());
    });
  }

  app.post(
    '/api/v1/alerts/escalate',
    { preHandler: requireClearance('Crew') },
    async (request, reply) => {
      actor.send({ type: 'ESCALATE' });
      persistAndBroadcast('AlertPhaseChanged', getPhaseFromState(actor.getSnapshot().value));
      store.audit('alert.escalate', request.clearance, 'Normal→Yellow');
      return reply.send(createOutcome('Acknowledged', 'Alert escalated to Yellow'));
    }
  );

  app.post(
    '/api/v1/alerts/battle-stations',
    { preHandler: requireClearance('Captain') },
    async (request, reply) => {
      if (!isBattleStationsGateEnabled()) {
        return reply.status(500).send(
          createOutcome('UnableToComply', 'Battle stations gate misconfigured', {
            cause: 'gate_disabled',
            remediation: 'Gate must remain enabled per W-CT-03',
          })
        );
      }
      const body = (request.body ?? {}) as { confirm?: boolean; actor?: string };
      if (body.confirm !== true) {
        return reply.status(400).send(
          createOutcome('Denied', 'Battle stations requires explicit confirmation', {
            cause: 'confirm_not_true',
            remediation: 'Set confirm=true after operator review',
          })
        );
      }
      const actorName = body.actor ?? 'Captain';
      actor.send({ type: 'BATTLE_STATIONS_CONFIRM', actor: actorName });
      persistAndBroadcast('AlertPhaseChanged', getPhaseFromState(actor.getSnapshot().value), actorName);
      store.audit('alert.battle_stations', actorName, 'Yellow→Red');
      return reply.send(createOutcome('Verified', 'Battle stations confirmed — Red alert'));
    }
  );

  app.post(
    '/api/v1/alerts/stand-down',
    { preHandler: requireClearance('Captain') },
    async (request, reply) => {
      actor.send({ type: 'STAND_DOWN' });
      persistAndBroadcast('AlertPhaseChanged', getPhaseFromState(actor.getSnapshot().value));
      store.audit('alert.stand_down', request.clearance, '→Normal');
      return reply.send(createOutcome('Acknowledged', 'Standing down to Normal'));
    }
  );

  app.get('/health', async (_request, reply) => {
    return reply.send({
      status: 'ok',
      adapter: process.env.MATTER_ADAPTER ?? 'mock',
      staleThresholdMs: STALE_MS,
    });
  });
}
