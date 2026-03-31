export class InMemoryRepo {
  constructor() {
    this.users = new Map();
    this.events = [];
    this.sourceEventIds = new Set();
    this.battles = new Map();
    this.debuffs = [];
  }

  ensureUser(userId) {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        id: userId,
        level: 1,
        xp_total: 0,
        meta_stamina: 0,
        gold: 0,
        stats_json: { strength: 1, endurance: 1, agility: 1, focus: 1 },
      });
    }
    return this.users.get(userId);
  }

  isDuplicate(sourceEventId) {
    return this.sourceEventIds.has(sourceEventId);
  }

  markSourceEventId(sourceEventId) {
    this.sourceEventIds.add(sourceEventId);
  }

  saveEvent(event) {
    this.events.push(event);
  }

  getHistory(userId, limit = 30, cursor = 0) {
    const start = Number(cursor || 0);
    const filtered = this.events.filter((e) => e.user_id === userId);
    const slice = filtered.slice(start, start + limit);
    const nextCursor = start + limit < filtered.length ? String(start + limit) : null;
    return { events: slice, next_cursor: nextCursor };
  }

  saveUser(user) {
    this.users.set(user.id, user);
    return user;
  }

  getActiveBattle(userId) {
    for (const battle of this.battles.values()) {
      if (battle.user_id === userId && battle.resolved_at == null) {
        return battle;
      }
    }
    return null;
  }

  createBattleDraft(battle) {
    this.battles.set(battle.id, {
      ...battle,
      result: null,
      damage_dealt: 0,
      damage_taken: 0,
      gold_reward: 0,
      created_at: new Date().toISOString(),
      resolved_at: null,
    });
  }

  finalizeBattle({ id, result, damage_dealt, damage_taken, gold_reward }) {
    const existing = this.battles.get(id);
    this.battles.set(id, {
      ...existing,
      result,
      damage_dealt,
      damage_taken,
      gold_reward,
      resolved_at: new Date().toISOString(),
    });
  }

  decrementMetaStamina(userId, amount) {
    const user = this.ensureUser(userId);
    user.meta_stamina = Math.max(0, user.meta_stamina - amount);
    this.users.set(userId, user);
    return user;
  }

  incrementGold(userId, amount) {
    const user = this.ensureUser(userId);
    user.gold += amount;
    this.users.set(userId, user);
    return user;
  }

  saveOrStackDebuff(userId, debuff) {
    const now = Date.now();
    const active = this.debuffs.find((d) => d.user_id === userId && d.type === debuff.type && new Date(d.expires_at).getTime() > now);

    if (active) {
      active.stacks = Math.min(3, active.stacks + 1);
      active.expires_at = new Date(now + debuff.duration_hours * 60 * 60 * 1000).toISOString();
      return active;
    }

    const created = {
      id: `${userId}-${debuff.type}-${now}`,
      user_id: userId,
      type: debuff.type,
      value_pct: debuff.value_pct,
      stacks: 1,
      expires_at: new Date(now + debuff.duration_hours * 60 * 60 * 1000).toISOString(),
    };
    this.debuffs.push(created);
    return created;
  }

  getBattleById(userId, battleId) {
    const battle = this.battles.get(battleId);
    if (!battle || battle.user_id !== userId) {
      return null;
    }
    return battle;
  }
}
