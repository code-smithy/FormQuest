import pg from 'pg';

const { Pool } = pg;

export class PostgresRepo {
  constructor(connectionString = process.env.DATABASE_URL) {
    if (!connectionString) {
      throw new Error('DATABASE_URL is required for PostgresRepo');
    }
    this.pool = new Pool({ connectionString });
  }

  async ensureUser(userId) {
    const existing = await this.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (existing.rows[0]) return existing.rows[0];

    const created = await this.pool.query(
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
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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
}
