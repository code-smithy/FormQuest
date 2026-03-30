import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryRepo } from '../src/repositories/inMemoryRepo.js';
import { ActivityService } from '../src/services/activityService.js';

function makeEvent(overrides = {}) {
  return {
    source_event_id: 'evt-1',
    type: 'walking',
    duration_minutes: 30,
    calories: 120,
    steps: 3200,
    heart_rate_avg: 120,
    occurred_at: '2026-03-30T10:00:00Z',
    source: 'apple_health',
    ...overrides,
  };
}

test('ingest accepts valid event and updates user progression', () => {
  const repo = new InMemoryRepo();
  const service = new ActivityService(repo);

  const result = service.ingest('u1', [makeEvent()]);
  assert.equal(result.accepted, 1);
  assert.equal(result.duplicates, 0);
  assert.equal(result.quarantined, 0);
  assert.equal(result.awarded_xp > 0, true);
  assert.equal(result.user.xp_total > 0, true);
});

test('duplicate events are idempotent', () => {
  const repo = new InMemoryRepo();
  const service = new ActivityService(repo);

  service.ingest('u1', [makeEvent()]);
  const second = service.ingest('u1', [makeEvent()]);

  assert.equal(second.accepted, 0);
  assert.equal(second.duplicates, 1);
  assert.equal(second.awarded_xp, 0);
});

test('suspicious events are quarantined and uncredited', () => {
  const repo = new InMemoryRepo();
  const service = new ActivityService(repo);

  const suspicious = makeEvent({ source_event_id: 'evt-2', steps: 20000, duration_minutes: 30 });
  const result = service.ingest('u1', [suspicious]);

  assert.equal(result.accepted, 0);
  assert.equal(result.quarantined, 1);
  assert.equal(result.awarded_xp, 0);

  const history = service.history('u1', { limit: 10 });
  assert.equal(history.events[0].status, 'quarantined');
});

test('history endpoint returns paginated events', () => {
  const repo = new InMemoryRepo();
  const service = new ActivityService(repo);

  service.ingest('u1', [makeEvent({ source_event_id: 'evt-1' })]);
  service.ingest('u1', [makeEvent({ source_event_id: 'evt-2' })]);
  service.ingest('u1', [makeEvent({ source_event_id: 'evt-3' })]);

  const page1 = service.history('u1', { limit: 2 });
  const page2 = service.history('u1', { limit: 2, cursor: page1.next_cursor });

  assert.equal(page1.events.length, 2);
  assert.equal(page2.events.length, 1);
});
