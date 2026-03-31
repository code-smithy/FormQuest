import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/http/server.js';
import { InMemoryRepo } from '../src/repositories/inMemoryRepo.js';
import { ActivityService } from '../src/services/activityService.js';
import { BattleService } from '../src/services/battleService.js';

async function makeApp() {
  const repo = new InMemoryRepo();
  const activityService = new ActivityService(repo);
  const battleService = new BattleService(repo);
  const server = createServer({ activityService, battleService });
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  return { server, base };
}

test('POST /activity/ingest works end-to-end', async () => {
  const { server, base } = await makeApp();
  try {
    const res = await fetch(`${base}/activity/ingest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-id': 'u-http-1' },
      body: JSON.stringify({
        events: [
          {
            source_event_id: 'evt-http-1',
            type: 'walking',
            duration_minutes: 30,
            calories: 100,
            steps: 3000,
            heart_rate_avg: 120,
            occurred_at: '2026-03-30T11:00:00Z',
            source: 'apple_health',
          },
        ],
      }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.accepted, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /activity/history returns records', async () => {
  const { server, base } = await makeApp();
  try {
    await fetch(`${base}/activity/ingest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-id': 'u-http-2' },
      body: JSON.stringify({
        events: [
          {
            source_event_id: 'evt-http-2',
            type: 'walking',
            duration_minutes: 20,
            calories: 80,
            steps: 2200,
            heart_rate_avg: 115,
            occurred_at: '2026-03-30T11:10:00Z',
            source: 'apple_health',
          },
        ],
      }),
    });

    const res = await fetch(`${base}/activity/history?limit=10`, {
      headers: { 'x-user-id': 'u-http-2' },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(Array.isArray(json.events), true);
    assert.equal(json.events.length, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('battle endpoints start and fetch battle result', async () => {
  const { server, base } = await makeApp();
  try {
    await fetch(`${base}/activity/ingest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-id': 'u-http-3' },
      body: JSON.stringify({
        events: [
          {
            source_event_id: 'evt-http-3a',
            type: 'strength',
            duration_minutes: 240,
            calories: 7200,
            heart_rate_avg: 185,
            occurred_at: '2026-03-30T11:20:00Z',
            source: 'apple_health',
          },
          {
            source_event_id: 'evt-http-3b',
            type: 'strength',
            duration_minutes: 240,
            calories: 7000,
            heart_rate_avg: 180,
            occurred_at: '2026-03-30T12:20:00Z',
            source: 'apple_health',
          },
        ],
      }),
    });

    const startRes = await fetch(`${base}/battle/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-id': 'u-http-3' },
      body: JSON.stringify({ zone_id: 1 }),
    });

    assert.equal(startRes.status, 200);
    const started = await startRes.json();
    assert.equal(typeof started.battle_id, 'string');

    const resultRes = await fetch(`${base}/battle/result/${started.battle_id}`, {
      headers: { 'x-user-id': 'u-http-3' },
    });
    assert.equal(resultRes.status, 200);

    const battle = await resultRes.json();
    assert.equal(battle.id, started.battle_id);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});


test('GET /battle/result/:id returns 404 for unknown battle', async () => {
  const { server, base } = await makeApp();
  try {
    const res = await fetch(`${base}/battle/result/00000000-0000-0000-0000-000000000000`, {
      headers: { 'x-user-id': 'u-http-404' },
    });

    assert.equal(res.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
