import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBattle } from '../src/domain/battle.js';

const user = {
  level: 6,
  stats_json: { strength: 14, endurance: 12, agility: 8, focus: 7 },
};

test('resolveBattle is deterministic for same input seed', () => {
  const first = resolveBattle({ user, zoneId: 2, seed: 123456 });
  const second = resolveBattle({ user, zoneId: 2, seed: 123456 });

  assert.deepEqual(second, first);
});

test('resolveBattle can change outcome with different seeds', () => {
  const first = resolveBattle({ user, zoneId: 2, seed: 123456 });
  const second = resolveBattle({ user, zoneId: 2, seed: 123457 });

  assert.notDeepEqual(second, first);
});
