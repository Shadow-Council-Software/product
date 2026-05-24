import { createActor } from 'xstate';
import type { FastifyInstance } from 'fastify';
import { createEventEnvelope, type EventEnvelopeV1 } from '@enterprise/event-envelope';
import { createOutcome } from '@enterprise/tng-outcomes';
import type { MatterAdapterPort } from '@enterprise/matter-port';
import { alertMachine, getPhaseFromState } from '../domain/alert-fsm.js';
import { AlertStore } from '../persistence/db.js';
import { clearancePlugin, requireClearance } from '../middleware/clearance.js';
import { isBattleStationsGateEnabled } from '../config/security.js';

type Broadcast = (event: EventEnvelopeV1) => void;

export async function registerRoutes(
  app: FastifyInstance,
  adapter: MatterAdapterPort,
  store: AlertStore,
  broadcast: Broadcast
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

  function persistAndBroadcast(eventType: 'AlertPhaseChanged', phase: string, actorName?: string) {
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
    return reply.send({ status: 'ok', adapter: process.env.MATTER_ADAPTER ?? 'mock' });
  });
}
