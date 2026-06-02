import { pathToFileURL } from 'node:url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { createMatterAdapter } from './adapters/create-adapter.js';
import { AlertStore } from './persistence/db.js';
import { MemoryAlertStore } from './persistence/memory-alert-store.js';
import type { PersistenceStore } from './persistence/store-types.js';

export type { PersistenceStore } from './persistence/store-types.js';

function createAlertStore(dbPath: string): PersistenceStore {
  if (process.env.ALERT_STORE === 'memory') {
    return new MemoryAlertStore();
  }
  try {
    return new AlertStore(dbPath);
  } catch (err) {
    console.warn(
      'better-sqlite3 unavailable; using in-memory alert store (set ALERT_STORE=memory to silence)',
      err
    );
    return new MemoryAlertStore();
  }
}
import { registerRoutes } from './api/routes.js';
import { isEventEnvelopeV1, type EventEnvelopeV1 } from '@enterprise/event-envelope';

export async function buildServer() {
  const adapterKind = (process.env.MATTER_ADAPTER ?? 'mock') as 'mock' | 'ohf' | 'sim';
  const adapter = createMatterAdapter(adapterKind);
  await adapter.connect();

  const store = createAlertStore(process.env.ALERT_DB_PATH ?? ':memory:');
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(websocket);

  const clients = new Set<{ send: (data: string) => void }>();

  function broadcast(event: EventEnvelopeV1): void {
    const payload = JSON.stringify(event);
    for (const client of clients) {
      client.send(payload);
    }
  }

  await registerRoutes(app, adapter, store, broadcast, undefined, adapterKind);

  app.get('/api/v1/events/stream', { websocket: true }, (socket) => {
    clients.add(socket);
    socket.on('close', () => clients.delete(socket));
    socket.send(
      JSON.stringify({
        schemaVersion: 1,
        eventId: crypto.randomUUID(),
        type: 'StationUpdated',
        timestamp: Date.now(),
        payload: { type: 'stream_connected' },
      })
    );
  });

  app.addHook('onClose', async () => {
    await adapter.disconnect();
    store.close();
  });

  return app;
}

export async function startServer(port = Number(process.env.PORT ?? 3001)) {
  const app = await buildServer();
  await app.listen({ port, host: '0.0.0.0' });
  return app;
}

const isMain =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  startServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { isEventEnvelopeV1 };
