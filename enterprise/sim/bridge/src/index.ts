import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import {
  SpatialEngine,
  VisualAidStore,
  defaultLayoutPath,
  type VisualAidCapture,
} from './spatial-engine.js';

const PORT = Number(process.env.SIM_BRIDGE_PORT ?? 3002);
const CAPTURES_DIR = process.env.SIM_CAPTURES_DIR ?? new URL('../../captures', import.meta.url).pathname;

export async function buildSimBridge() {
  const engine = new SpatialEngine();
  const visualAid = new VisualAidStore(CAPTURES_DIR, Number(process.env.SIM_CAPTURE_RETENTION ?? 50));

  const layoutPath = defaultLayoutPath();
  engine.loadLayout(layoutPath);
  engine.startTick(Number(process.env.SIM_TICK_MS ?? 2000));

  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  await app.register(websocket);

  app.get('/health', async () => ({
    status: 'ok',
    layout: engine.getLayout()?.metadata.name ?? 'unknown',
    stations: engine.getStations().length,
  }));

  app.get('/sim/spatial-state', async () => ({
    hash: engine.stateHash(),
    stations: engine.getStations(),
    layout: engine.getLayout(),
  }));

  app.get('/sim/layout', async () => engine.getLayout());

  app.get('/sim/devices', async () => ({
    devices: engine.getDevices(),
    coverageGoals: engine.getLayout()?.coverageGoals ?? null,
  }));

  app.get('/sim/coverage/report', async () => engine.computeCoverageReport());

  app.post<{ Body: { stationId: string; targetC: number } }>(
    '/sim/command/setpoint',
    async (request, reply) => {
      const { stationId, targetC } = request.body ?? {};
      if (!stationId || !Number.isFinite(targetC)) {
        return reply.status(400).send({ error: 'stationId and targetC required' });
      }
      const ok = engine.writeSetpoint(stationId, targetC, 'enterprise');
      if (!ok) return reply.status(404).send({ error: 'station not found' });
      return { ok: true, station: engine.getStation(stationId) };
    }
  );

  app.post<{ Body: { stationId: string; targetC: number } }>(
    '/sim/simulate/google-setpoint',
    async (request, reply) => {
      const { stationId, targetC } = request.body ?? {};
      engine.simulateGoogleSetpoint(stationId, targetC);
      return reply.send({ ok: true });
    }
  );

  app.get('/sim/visual-aid/latest', async () => {
    const latest = visualAid.getLatest();
    return {
      capture: latest,
      spatial: { hash: engine.stateHash(), stations: engine.getStations() },
    };
  });

  app.get<{ Querystring: { limit?: string } }>('/sim/visual-aid/history', async (request) => {
    const limit = Number(request.query.limit ?? 10);
    return { captures: visualAid.history(limit) };
  });

  app.post<{ Body: VisualAidCapture }>('/sim/visual-aid', async (request, reply) => {
    const body = request.body;
    if (!body?.captureId) {
      return reply.status(400).send({ error: 'captureId required' });
    }
    body.spatialStateHash = engine.stateHash();
    visualAid.save(body);
    return reply.send({ ok: true, captureId: body.captureId });
  });

  app.get('/sim/events/stream', { websocket: true }, (socket) => {
    const unsub = engine.subscribe((event) => {
      socket.send(JSON.stringify({ ...event, timestamp: Date.now() }));
    });
    socket.on('close', unsub);
    socket.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));
  });

  return { app, engine, visualAid };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildSimBridge()
    .then(({ app }) => app.listen({ port: PORT, host: '0.0.0.0' }))
    .then(() => console.log(`Sim Bridge listening on :${PORT}`))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
