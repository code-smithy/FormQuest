import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryRepo } from '../src/repositories/inMemoryRepo.js';
import { BattleService } from '../src/services/battleService.js';

test('battle start consumes meta stamina and returns result', async () => {
  const repo = new InMemoryRepo();
  const service = new BattleService(repo);

  const user = repo.ensureUser('u-battle-1');
  user.meta_stamina = 500;
  user.level = 5;
  user.stats_json = { strength: 15, endurance: 10, agility: 8, focus: 6 };
  repo.saveUser(user);

  const result = await service.start('u-battle-1', { zone_id: 1 });
  assert.equal(typeof result.battle_id, 'string');
  assert.equal(result.meta_stamina_spent, 100);
  assert.equal(result.user.meta_stamina, 400);
  assert.equal(['win', 'loss'].includes(result.result), true);
});

test('battle start fails when user lacks meta stamina', async () => {
  const repo = new InMemoryRepo();
  const service = new BattleService(repo);

  const user = repo.ensureUser('u-battle-2');
  user.meta_stamina = 80;
  repo.saveUser(user);

  await assert.rejects(() => service.start('u-battle-2', { zone_id: 1 }), /insufficient_meta_stamina/);
});

test('battle result fetch returns stored record', async () => {
  const repo = new InMemoryRepo();
  const service = new BattleService(repo);

  const user = repo.ensureUser('u-battle-3');
  user.meta_stamina = 300;
  user.level = 3;
  repo.saveUser(user);

  const started = await service.start('u-battle-3', { zone_id: 2 });
  const battle = await service.result('u-battle-3', started.battle_id);

  assert.equal(battle.id, started.battle_id);
  assert.equal(['win', 'loss'].includes(battle.result), true);
});


test('battle start fails when unresolved active battle exists', async () => {
  const repo = new InMemoryRepo();
  const service = new BattleService(repo);

  const user = repo.ensureUser('u-battle-4');
  user.meta_stamina = 500;
  repo.saveUser(user);

  repo.createBattleDraft({
    id: 'existing-active-battle',
    user_id: 'u-battle-4',
    zone_id: 1,
    seed: 111,
    meta_stamina_spent: 100,
  });

  await assert.rejects(() => service.start('u-battle-4', { zone_id: 1 }), /battle_already_active/);
});
