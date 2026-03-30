import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveLevelFromXp, levelXpRequirement, applyProgression } from '../src/domain/progression.js';

test('level requirements increase with level', () => {
  assert.equal(levelXpRequirement(3) > levelXpRequirement(2), true);
});

test('deriveLevelFromXp supports multi-level progression', () => {
  const lvl = deriveLevelFromXp(5000);
  assert.equal(lvl > 1, true);
});

test('applyProgression updates level and stats', () => {
  const user = {
    id: 'u1',
    level: 1,
    xp_total: 0,
    meta_stamina: 0,
    stats_json: { strength: 1, endurance: 1, agility: 1, focus: 1 },
  };

  const progressed = applyProgression(user, 10000, 'strength');
  assert.equal(progressed.level > user.level, true);
  assert.equal(progressed.stats_json.focus > user.stats_json.focus, true);
  assert.equal(progressed.stats_json.strength > user.stats_json.strength, true);
});
