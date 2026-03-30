import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/http/server.js';
import { InMemoryRepo } from '../src/repositories/inMemoryRepo.js';
import { ActivityService } from '../src/services/activityService.js';

async function makeApp() {
  const service = new ActivityService(new InMemoryRepo());
  const server = createServer(service);
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
