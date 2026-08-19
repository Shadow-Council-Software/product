import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../src/index.js';

describe('W-CT-01 Guest denial path', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  before(async () => {
    process.env.MATTER_ADAPTER = 'mock';
    app = await buildServer();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('denies Guest on alert escalate (Crew required)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/alerts/escalate',
      headers: { 'x-clearance': 'Guest' },
    });
    assert.equal(res.statusCode, 403);
    const body = res.json();
    assert.equal(body.outcomeType, 'Denied');
  });

  it('denies Guest on battle-stations (Captain required)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/alerts/battle-stations',
      headers: { 'x-clearance': 'Guest', 'content-type': 'application/json' },
      payload: { confirm: true },
    });
    assert.equal(res.statusCode, 403);
    assert.equal(res.json().outcomeType, 'Denied');
  });
});
