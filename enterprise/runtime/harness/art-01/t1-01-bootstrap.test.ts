#!/usr/bin/env node
/**
 * ART-01 harness entry — T1-01 sidecar connectivity (mock path for CI).
 * Live Nest scenarios require MATTER_ADAPTER=ohf + sidecar profile.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../../engine/src/index.js';

describe('ART-01 T1-01 engine bootstrap', () => {
  it('engine boots with mock adapter and serves stations', async () => {
    process.env.MATTER_ADAPTER = 'mock';
    const app = await buildServer();
    await app.ready();
    const res = await app.inject({ method: 'GET', url: '/api/v1/stations' });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { stations: unknown[] };
    assert.ok(Array.isArray(body.stations));
    assert.ok(body.stations.length >= 1);
    await app.close();
  });
});
