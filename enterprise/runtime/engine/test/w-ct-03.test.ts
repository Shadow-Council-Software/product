import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../src/index.js';
import {
  BATTLE_STATIONS_GATE_ENABLED,
  isBattleStationsGateEnabled,
} from '../src/config/security.js';

describe('W-CT-03 BattleStationsConfirm non-skippable', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  before(async () => {
    process.env.MATTER_ADAPTER = 'mock';
    process.env.BATTLE_STATIONS_BYPASS = 'true';
    process.env.DISABLE_BATTLE_STATIONS = '1';
    app = await buildServer();
    await app.ready();
    await app.inject({
      method: 'POST',
      url: '/api/v1/alerts/escalate',
      headers: { 'x-clearance': 'Crew' },
    });
  });

  after(async () => {
    delete process.env.BATTLE_STATIONS_BYPASS;
    delete process.env.DISABLE_BATTLE_STATIONS;
    await app.close();
  });

  it('gate constant is always enabled', () => {
    assert.equal(BATTLE_STATIONS_GATE_ENABLED, true);
    assert.equal(isBattleStationsGateEnabled(), true);
  });

  it('denies battle-stations without confirm=true', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/alerts/battle-stations',
      headers: { 'x-clearance': 'Captain', 'content-type': 'application/json' },
      payload: {},
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().outcomeType, 'Denied');
  });

  it('denies battle-stations with confirm=false', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/alerts/battle-stations',
      headers: { 'x-clearance': 'Captain', 'content-type': 'application/json' },
      payload: { confirm: false },
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().outcomeType, 'Denied');
  });

  it('accepts battle-stations with confirm=true', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/alerts/battle-stations',
      headers: { 'x-clearance': 'Captain', 'content-type': 'application/json' },
      payload: { confirm: true, actor: 'Captain' },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().outcomeType, 'Verified');
  });
});
