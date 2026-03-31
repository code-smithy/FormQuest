import { randomUUID } from 'node:crypto';
import { BATTLE_META_STAMINA_COST, resolveBattle } from '../domain/battle.js';

export class BattleService {
  constructor(repo) {
    this.repo = repo;
  }

  async start(userId, { zone_id = 1 } = {}) {
    const zoneId = Number(zone_id);
    if (!Number.isInteger(zoneId) || zoneId < 1) {
      throw new Error('validation_error:invalid_zone');
    }

    const run = async (tx) => {
      const user = await tx.ensureUser(userId);
      if (user.meta_stamina < BATTLE_META_STAMINA_COST) {
        throw new Error('insufficient_meta_stamina');
      }

      const activeBattle = await tx.getActiveBattle(userId);
      if (activeBattle) {
        throw new Error('battle_already_active');
      }

      const seed = Date.now();
      const battleId = randomUUID();

      await tx.createBattleDraft({
        id: battleId,
        user_id: userId,
        zone_id: zoneId,
        seed,
        meta_stamina_spent: BATTLE_META_STAMINA_COST,
      });

      const resolution = resolveBattle({ user, zoneId, seed });
      await tx.decrementMetaStamina(userId, BATTLE_META_STAMINA_COST);

      if (resolution.gold_reward > 0) {
        await tx.incrementGold(userId, resolution.gold_reward);
      }

      if (resolution.debuff) {
        await tx.saveOrStackDebuff(userId, resolution.debuff);
      }

      await tx.finalizeBattle({
        id: battleId,
        result: resolution.result,
        damage_dealt: resolution.damage_dealt,
        damage_taken: resolution.damage_taken,
        gold_reward: resolution.gold_reward,
      });

      const updatedUser = await tx.ensureUser(userId);
      return {
        battle_id: battleId,
        ...resolution,
        user: {
          meta_stamina: updatedUser.meta_stamina,
          gold: updatedUser.gold,
        },
      };
    };

    if (this.repo.withTransaction) {
      return this.repo.withTransaction(run);
    }
    return run(this.repo);
  }

  async result(userId, battleId) {
    const battle = await this.repo.getBattleById(userId, battleId);
    if (!battle) {
      throw new Error('battle_not_found');
    }
    return battle;
  }
}
