import pg from 'pg';

const { Pool } = pg;

export class PostgresRepo {
  constructor(connectionString = process.env.DATABASE_URL) {
    if (!connectionString) {
      throw new Error('DATABASE_URL is required for PostgresRepo');
    }
    this.pool = new Pool({ connectionString });
  }

  async ensureUser(userId, client = this.pool) {
    const existing = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (existing.rows[0]) return existing.rows[0];

    const created = await client.query(
      `INSERT INTO users (id, level, xp_total, meta_stamina, gold, stats_json)
       VALUES ($1, 1, 0, 0, 0, '{"strength":1,"endurance":1,"agility":1,"focus":1}'::jsonb)
       RETURNING *`,
      [userId],
    );

    return created.rows[0];
  }

  async withTransaction(fn) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const txRepo = this._txRepo(client);
      const result = await fn(txRepo);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  _txRepo(client) {
    return {
      ensureUser: (userId) => this.ensureUser(userId, client),
      isDuplicate: (sourceEventId) => this.isDuplicate(sourceEventId, client),
      saveEvent: (event) => this.saveEvent(event, client),
      saveUser: (user) => this.saveUser(user, client),
      getActiveBattle: (userId) => this.getActiveBattle(userId, client),
      createBattleDraft: (battle) => this.createBattleDraft(battle, client),
      finalizeBattle: (battle) => this.finalizeBattle(battle, client),
      decrementMetaStamina: (userId, amount) => this.decrementMetaStamina(userId, amount, client),
      incrementGold: (userId, amount) => this.incrementGold(userId, amount, client),
      saveOrStackDebuff: (userId, debuff) => this.saveOrStackDebuff(userId, debuff, client),
    };
  }

  async isDuplicate(sourceEventId, client = this.pool) {
    const result = await client.query('SELECT 1 FROM activities WHERE source_event_id = $1 LIMIT 1', [sourceEventId]);
    return Boolean(result.rows[0]);
  }

  async saveEvent(event, client = this.pool) {
    await client.query(
      `INSERT INTO activities
      (id, user_id, source_event_id, type, duration_minutes, calories, steps, heart_rate_avg, occurred_at, source,
       status, credited_xp, credited_meta_stamina, quarantine_reason)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        event.user_id,
        event.source_event_id,
        event.type,
        event.duration_minutes,
        event.calories,
        event.steps ?? null,
        event.heart_rate_avg ?? null,
        event.occurred_at,
        event.source,
        event.status,
        event.credited_xp,
        event.credited_meta_stamina,
        event.quarantine_reason,
      ],
    );
  }

  async getHistory(userId, limit = 30, cursor = 0) {
    const offset = Number(cursor || 0);
    const rows = await this.pool.query(
      `SELECT user_id, source_event_id, type, duration_minutes, calories, steps, heart_rate_avg, occurred_at, source,
              status, credited_xp, credited_meta_stamina, quarantine_reason
       FROM activities
       WHERE user_id = $1
       ORDER BY occurred_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const total = await this.pool.query('SELECT count(1)::int AS count FROM activities WHERE user_id = $1', [userId]);
    const nextCursor = offset + limit < total.rows[0].count ? String(offset + limit) : null;

    return { events: rows.rows, next_cursor: nextCursor };
  }

  async saveUser(user, client = this.pool) {
    const updated = await client.query(
      `UPDATE users
       SET level = $2, xp_total = $3, meta_stamina = $4, stats_json = $5::jsonb, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [user.id, user.level, user.xp_total, user.meta_stamina, JSON.stringify(user.stats_json)],
    );
    return updated.rows[0];
  }

  async getActiveBattle(userId, client = this.pool) {
    const result = await client.query(
      `SELECT * FROM battles WHERE user_id = $1 AND resolved_at IS NULL LIMIT 1`,
      [userId],
    );
    return result.rows[0] ?? null;
  }

  async createBattleDraft(battle, client = this.pool) {
    try {
      await client.query(
        `INSERT INTO battles (id, user_id, zone_id, seed, meta_stamina_spent)
         VALUES ($1, $2, $3, $4, $5)`,
        [battle.id, battle.user_id, battle.zone_id, battle.seed, battle.meta_stamina_spent],
      );
    } catch (err) {
      if (err.code === '23505' && String(err.constraint).includes('idx_battles_one_active_per_user')) {
        throw new Error('battle_already_active');
      }
      throw err;
    }
  }

  async finalizeBattle(battle, client = this.pool) {
    await client.query(
      `UPDATE battles
       SET result = $2,
           damage_dealt = $3,
           damage_taken = $4,
           gold_reward = $5,
           resolved_at = now()
       WHERE id = $1`,
      [battle.id, battle.result, battle.damage_dealt, battle.damage_taken, battle.gold_reward],
    );
  }

  async decrementMetaStamina(userId, amount, client = this.pool) {
    await client.query(
      `UPDATE users
       SET meta_stamina = GREATEST(0, meta_stamina - $2), updated_at = now()
       WHERE id = $1`,
      [userId, amount],
    );
  }

  async incrementGold(userId, amount, client = this.pool) {
    await client.query(
      `UPDATE users
       SET gold = gold + $2, updated_at = now()
       WHERE id = $1`,
      [userId, amount],
    );
  }

  async saveOrStackDebuff(userId, debuff, client = this.pool) {
    const current = await client.query(
      `SELECT * FROM debuffs
       WHERE user_id = $1 AND type = $2 AND expires_at > now()
       ORDER BY expires_at DESC
       LIMIT 1`,
      [userId, debuff.type],
    );

    if (current.rows[0]) {
      await client.query(
        `UPDATE debuffs
         SET stacks = LEAST(3, stacks + 1),
             expires_at = now() + ($2 || ' hours')::interval
         WHERE id = $1`,
        [current.rows[0].id, debuff.duration_hours],
      );
      return;
    }

    await client.query(
      `INSERT INTO debuffs (id, user_id, type, value_pct, stacks, expires_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 1, now() + ($4 || ' hours')::interval)`,
      [userId, debuff.type, debuff.value_pct, debuff.duration_hours],
    );
  }

  async getBattleById(userId, battleId) {
    const result = await this.pool.query(
      `SELECT * FROM battles WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [battleId, userId],
    );
    return result.rows[0] ?? null;
  }
}
