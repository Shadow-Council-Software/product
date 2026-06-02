import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../src/index.js';

describe('Setpoint command API', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  before(async () => {
    process.env.MATTER_ADAPTER = 'mock';
    process.env.ALLOW_TEST_HOOKS = '1';
    app = await buildServer();
    await app.ready();
  });

  after(async () => {
    delete process.env.ALLOW_TEST_HOOKS;
    await app.close();
  });

  it('denies Guest on setpoint (Crew required)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/commands/setpoint',
      headers: { 'x-clearance': 'Guest', 'content-type': 'application/json' },
      payload: { value: 22 },
    });
    assert.equal(res.statusCode, 403);
    assert.equal(res.json().outcomeType, 'Denied');
  });

  it('accepts Crew setpoint on mock adapter', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/commands/setpoint',
      headers: { 'x-clearance': 'Crew', 'content-type': 'application/json' },
      payload: { value: 22.5 },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.outcomeType, 'Acknowledged');
    assert.ok(body.receiptId);
  });
});
