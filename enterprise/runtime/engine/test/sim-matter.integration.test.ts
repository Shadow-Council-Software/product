import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

describe('SimMatterAdapter integration', { skip: process.env.RUN_SIM_INTEGRATION !== '1' ? 'Set RUN_SIM_INTEGRATION=1' : false }, () => {
  let bridgeProc: ReturnType<typeof spawn> | null = null;

  before(async () => {
    bridgeProc = spawn('npm', ['run', 'start'], {
      cwd: new URL('../../../../sim/bridge', import.meta.url).pathname,
      env: { ...process.env, SIM_BRIDGE_PORT: '3012' },
      stdio: 'ignore',
    });
    await sleep(2000);
    process.env.MATTER_ADAPTER = 'sim';
    process.env.SIM_BRIDGE_URL = 'http://127.0.0.1:3012';
  });

  after(async () => {
    process.env.MATTER_ADAPTER = 'mock';
    delete process.env.SIM_BRIDGE_URL;
    bridgeProc?.kill();
  });

  it('connects and returns stations from layout', async () => {
    const { buildServer } = await import('../src/index.js');
    const app = await buildServer();
    await app.ready();
    const res = await app.inject({ method: 'GET', url: '/api/v1/stations' });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { stations: Array<{ stationId: string }> };
    assert.ok(body.stations.some((s) => s.stationId === 'env.nest.primary'));
    await app.close();
  });
});
