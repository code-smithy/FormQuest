import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateXp, metaStaminaGain, clampDuration, MAX_ACTIVITY_XP } from '../src/domain/xp.js';

test('clampDuration clamps below and above bounds', () => {
  assert.equal(clampDuration(0), 1);
  assert.equal(clampDuration(999), 240);
});

test('calculateXp returns rounded non-negative value', () => {
  const xp = calculateXp({ type: 'walking', duration_minutes: 30, calories: 200, heart_rate_avg: 120 });
  assert.equal(Number.isInteger(xp), true);
  assert.equal(xp > 0, true);
});

test('calculateXp enforces per-activity cap', () => {
  const xp = calculateXp({ type: 'strength', duration_minutes: 240, calories: 50000, heart_rate_avg: 190 });
  assert.equal(xp, MAX_ACTIVITY_XP);
});

test('meta stamina gain follows floor(xp*0.25)', () => {
  assert.equal(metaStaminaGain(99), 24);
  assert.equal(metaStaminaGain(100), 25);
});
