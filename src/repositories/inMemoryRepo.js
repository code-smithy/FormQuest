export class InMemoryRepo {
  constructor() {
    this.users = new Map();
    this.events = [];
    this.sourceEventIds = new Set();
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
}
