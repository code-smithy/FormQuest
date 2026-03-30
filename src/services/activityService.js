import { validateSchema, detectQuarantineReason } from "../domain/antiCheat.js";
import { calculateXp, metaStaminaGain, MAX_META_STAMINA } from "../domain/xp.js";
import { applyProgression } from "../domain/progression.js";

export class ActivityService {
  constructor(repo) {
    this.repo = repo;
  }

  async ingest(userId, events) {
    const user = await this.repo.ensureUser(userId);
    let accepted = 0;
    let duplicates = 0;
    let quarantined = 0;
    let awarded_xp = 0;
    let awarded_meta_stamina = 0;
    let mutableUser = { ...user };

    for (const event of events) {
      const schema = validateSchema(event);
      if (!schema.valid) {
        throw new Error(`validation_error:${schema.reason}`);
      }

      if (await this.repo.isDuplicate(event.source_event_id)) {
        duplicates += 1;
        await this.repo.saveEvent({ ...event, user_id: userId, status: "duplicate", credited_xp: 0, credited_meta_stamina: 0, quarantine_reason: null });
        continue;
      }

      if (this.repo.markSourceEventId) {
        this.repo.markSourceEventId(event.source_event_id);
      }

      const quarantineReason = detectQuarantineReason(event);
      if (quarantineReason) {
        quarantined += 1;
        await this.repo.saveEvent({ ...event, user_id: userId, status: "quarantined", credited_xp: 0, credited_meta_stamina: 0, quarantine_reason: quarantineReason });
        continue;
      }

      const xp = calculateXp(event);
      const meta = metaStaminaGain(xp);

      mutableUser = applyProgression(mutableUser, xp);
      mutableUser.meta_stamina = Math.min(MAX_META_STAMINA, mutableUser.meta_stamina + meta);

      accepted += 1;
      awarded_xp += xp;
      awarded_meta_stamina += meta;

      await this.repo.saveEvent({ ...event, user_id: userId, status: "accepted", credited_xp: xp, credited_meta_stamina: meta, quarantine_reason: null });
    }

    mutableUser = await this.repo.saveUser(mutableUser);

    return {
      accepted,
      duplicates,
      quarantined,
      awarded_xp,
      awarded_meta_stamina,
      user: {
        xp_total: mutableUser.xp_total,
        level: mutableUser.level,
        meta_stamina: mutableUser.meta_stamina,
      },
    };
  }

  async history(userId, { cursor = null, limit = 30 } = {}) {
    return this.repo.getHistory(userId, limit, cursor ?? 0);
  }
}
