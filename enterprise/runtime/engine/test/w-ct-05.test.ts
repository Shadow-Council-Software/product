import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../src/index.js';

describe('W-CT-05 ConflictReconcile no Command during CONFLICT', () => {
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

  it('blocks setpoint when conflict active', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/test/simulate-conflict',
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/commands/setpoint',
      headers: { 'x-clearance': 'Crew', 'content-type': 'application/json' },
      payload: { value: 21 },
    });

    assert.equal(res.statusCode, 409);
    assert.equal(res.json().outcomeType, 'Denied');
    assert.match(res.json().cause, /conflict/i);
  });

  it('allows setpoint after reconcile', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/test/simulate-conflict',
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/system/conflict/reconcile',
      headers: { 'x-clearance': 'Captain' },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/commands/setpoint',
      headers: { 'x-clearance': 'Crew', 'content-type': 'application/json' },
      payload: { value: 21 },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.json().outcomeType, 'Acknowledged');
  });
});
