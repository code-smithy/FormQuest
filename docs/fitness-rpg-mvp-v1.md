# Fitness RPG — MVP v1 Product + Technical Design

## 1) Product Overview

Fitness RPG is a cross-platform mobile game that converts real-world movement into RPG progression.

Players perform activities, earn XP + Meta-Stamina, start asynchronous battles, and gain rewards.

### Product Goals
- Reinforce daily consistency over peak performance.
- Keep gameplay low-friction and async.
- Support incomplete/messy health data with safe fallbacks.
- Avoid hard punishments that discourage long-term fitness habits.

### Non-Goals (MVP)
- No PvP/co-op.
- No live multiplayer combat.
- No deep crafting system.
- No complex skill tree UI.

---

## 2) Core Loop (MVP)

`Activity → Ingest → XP + Meta-Stamina → Battle Start → Auto Resolve → Rewards → Progression`

### Loop Steps
1. User generates activity via walking/running/cycling/workouts.
2. Health data is synced from Apple Health / Google Fit.
3. Backend validates and normalizes activity.
4. XP and Meta-Stamina are computed and persisted.
5. User taps **Start Battle**.
6. Server consumes Meta-Stamina and resolves battle deterministically.
7. Client displays outcome and rewards.
8. Character progression updates (level/stats/zone eligibility).

### Session Cadence Targets
- Typical user interaction: 1–3 minutes/session.
- Battle count target: 2–8/day depending on activity.
- Daily value even for low-activity users.

---

## 3) Activity, XP, and Meta-Stamina

## 3.1 Activity Categories

| Category | Inputs | Affects |
|---|---|---|
| Endurance | Steps, walking, running, cycling | Endurance, HP, stamina pool |
| Strength | Workout sessions / strength minutes | Strength, damage |
| Intensity | Heart rate zone or pace | Crit chance, skill efficiency |

## 3.2 XP Formula

`XP = BaseXP(activityType) × IntensityMultiplier × DurationFactor + (Calories × 0.05)`

### Constants (MVP defaults)

**BaseXP per minute**
- Walking: `1.0`
- Running: `2.5`
- Cycling: `2.0`
- Strength: `3.5`

**IntensityMultiplier**
- If HR available: derive from zone (e.g. 0.9 to 1.5).
- If HR unavailable: `1.0` fallback.

**DurationFactor**
- `min(1.5, ln(durationMinutes + 1))`
- Clamp `durationMinutes` to `[1, 240]` for anti-exploit protection.

### XP Safety Rules
- Reject negative values.
- Round final XP to nearest integer.
- Enforce per-activity XP cap (`max 1500`) to prevent outliers.

## 3.3 Meta-Stamina

`MetaStaminaGain = floor(XP × 0.25)`

- Used only to initiate battles.
- Regenerated only via activity ingestion.
- Hard cap for MVP: `meta_stamina <= 5000`.

---

## 4) Character Model and Progression

## 4.1 Core Stats

| Stat | Primary Source | Gameplay Effect |
|---|---|---|
| Strength | Strength workouts | Base damage |
| Endurance | Steps/cardio volume | Max HP |
| Agility | Pace/speed trends | Dodge + turn speed |
| Focus | Streak consistency | Crit + skill efficiency |

## 4.2 Level Curve

`LevelXP(n) = floor(100 × n^1.5)` where `n` is target level.

- `xp_total` accumulates lifetime XP.
- `level` is derived from `xp_total`.
- Support multi-level jumps after large ingestion events.

## 4.3 Stat Allocation (Automatic)

On level up, allocate points by rolling 7-day activity composition:
- Endurance-heavy week → more Endurance.
- Strength-heavy week → more Strength.
- High pace/intensity consistency → Agility/Focus bias.

### Baseline Allocation Rule (MVP)
Each level grants `+5` total stat points:
- `+2` to dominant category.
- `+2` split across remaining active categories.
- `+1` to Focus (always, to reward consistency).

---

## 5) Combat Design (Async Deterministic)

## 5.1 Constraints
- Manual start only.
- One active battle at a time per user.
- Server-authoritative resolution.

## 5.2 Flow
`POST /battle/start` → validate resources/state → consume Meta-Stamina → resolve with server seed → persist battle record → return summary.

## 5.3 Resolution Equations (MVP)

- `Damage = AttackStat × SkillMultiplier × RandomFactor`
- `HitChance = clamp(0.65 + AgilityDelta × 0.01, 0.35, 0.95)`
- `CritChance = clamp(Focus × 0.01, 0.01, 0.40)`

Where:
- `RandomFactor` sampled from deterministic seeded RNG in `[0.9, 1.1]`.
- `AgilityDelta = playerAgility - enemyAgility`.

## 5.4 Enemy Scaling

`EnemyPower = ZoneBase × (1 + PlayerLevel × 0.1)`

- ZoneBase defaults:
  - Zone 1: 100
  - Zone 2: 180
  - Zone 3: 280

## 5.5 Battle Cost and Rewards
- Battle start cost: `100 Meta-Stamina`.
- Win: gold + optional loot roll.
- Loss: no rewards + debuff applied.

---

## 6) Losses, Debuffs, and Retry

## 6.1 Loss Outcome
- No gold/loot.
- Apply one random debuff.
- Immediate retry is allowed if user has sufficient Meta-Stamina.

## 6.2 Debuff Pool (MVP)

| Debuff | Effect | Duration |
|---|---|---|
| Fatigue | `-10% stamina effectiveness` | 12h |
| Injury | `-15% strength` | 24h |
| Sluggish | `-10% agility` | 12h |

Rules:
- Debuffs are stackable by type up to 3 stacks.
- Expiration is time-based (`expires_at` UTC).

---

## 7) World Structure

## 7.1 Zone Model
Hybrid progression:
- Linear zone order for narrative progression.
- Procedural enemy rolls within each zone.

## 7.2 Initial Zones

| Zone | Theme | Difficulty |
|---|---|---|
| 1 | Forest | Low |
| 2 | Desert | Medium |
| 3 | Mountain | High |

## 7.3 Unlock Logic
- No hard lock walls.
- Users can enter higher zones, but scaling naturally increases fail risk.

---

## 8) Economy (MVP)

## 8.1 Currency
- Primary: `gold`
- Reserved (future): materials/components

## 8.2 Spend Sinks
Potions (single-use):
- HP restore
- Stamina restore
- Meta-stamina restore

### Suggested Starter Prices
- Minor HP potion: 50 gold
- Minor stamina potion: 60 gold
- Meta potion: 120 gold

---

## 9) Tracking and UX Metrics

## 9.1 Player-Facing Fitness Metrics
- Steps today
- Weekly active minutes
- Current streak (strict)

## 9.2 Player-Facing RPG Metrics
- Level and XP progress
- Current stats
- Equipped gear + inventory summary

## 9.3 Streak Rules
- Strict mode in MVP: a missed local calendar day resets streak.
- Potential phase-2 extension: one grace day per 14 days.

---

## 10) Data Model (Core Entities)

## 10.1 User
- `id` (uuid)
- `level` (int)
- `xp_total` (int)
- `meta_stamina` (int)
- `gold` (int)
- `stats_json` (`{str,end,agi,focus}`)
- `current_streak` (int)
- `created_at`, `updated_at`

## 10.2 Activity
- `id` (uuid)
- `user_id` (fk)
- `type` (`walking|running|cycling|strength|other`)
- `duration_minutes` (int)
- `calories` (numeric)
- `steps` (int, nullable)
- `heart_rate_avg` (int, nullable)
- `occurred_at` (timestamp)
- `source` (`apple_health|google_fit|manual_import`)

## 10.3 Battle
- `id` (uuid)
- `user_id` (fk)
- `zone_id` (int)
- `enemy_id` (text)
- `result` (`win|loss`)
- `meta_stamina_spent` (int)
- `damage_dealt` (int)
- `damage_taken` (int)
- `seed` (bigint)
- `created_at` (timestamp)

## 10.4 Debuff
- `id` (uuid)
- `user_id` (fk)
- `type` (`fatigue|injury|sluggish`)
- `value_pct` (numeric)
- `stacks` (int)
- `expires_at` (timestamp)

## 10.5 Inventory
- `user_id` (fk)
- `item_id` (text)
- `quantity` (int)

---

## 11) API Surface (MVP)

## 11.1 Activity
- `POST /activity/ingest`
- `GET /activity/history`

### `POST /activity/ingest` request (example)
```json
{
  "source": "apple_health",
  "events": [
    {
      "type": "running",
      "duration_minutes": 32,
      "calories": 280,
      "steps": 4200,
      "heart_rate_avg": 152,
      "occurred_at": "2026-03-29T17:20:00Z"
    }
  ]
}
```

### `POST /activity/ingest` response (example)
```json
{
  "xp_gained": 164,
  "meta_stamina_gained": 41,
  "new_level": 7,
  "totals": {
    "xp_total": 2824,
    "meta_stamina": 390
  }
}
```

## 11.2 Character
- `GET /character`
- `POST /character/level-up` (optional admin/dev endpoint in MVP)

## 11.3 Battle
- `POST /battle/start`
- `GET /battle/result/:battleId`

## 11.4 Inventory
- `GET /inventory`
- `POST /inventory/use`

---

## 12) Architecture

- Frontend: React Native (Expo)
- Backend: Node.js + NestJS
- Database: PostgreSQL
- Integrations: Apple Health + Google Fit via device sync adapters

### Data Flow
`Device Health APIs → Mobile Client → Backend Ingest API → XP/Battle Engine → Postgres → Client`

---

## 13) Anti-Cheat (MVP Moderate)

Reject suspicious inputs before XP grant:
- Impossible pace/step rates (e.g., `> 50,000 steps/hour`).
- Heart rate outside plausible human bounds (e.g., `< 35` or `> 230`).
- Spikes beyond user baseline (z-score threshold).
- Duplicate events based on source event hash.

Flagged events:
- Stored with `status=quarantined`.
- Excluded from XP/meta-stamina until reviewed by automated rules.

---

## 14) Testing Strategy (TDD)

## 14.1 Unit Tests
- XP engine formulas and clamping.
- Intensity fallback when HR missing.
- Meta-stamina rounding and cap behavior.
- Combat deterministic output with fixed seed.
- Level progression threshold logic.
- Debuff stacking and expiration.

## 14.2 Integration Tests
- Activity ingest → XP update → level recalculation.
- Battle start → stamina consumption → persisted result.
- Loss → debuff insertion.
- Inventory use endpoint updates quantity atomically.

## 14.3 Example Pseudocode

```ts
test("xp increases with intensity", () => {
  const low = calcXP({ type: "running", duration: 30, intensity: 1.0, calories: 200 })
  const high = calcXP({ type: "running", duration: 30, intensity: 1.4, calories: 200 })
  expect(high).toBeGreaterThan(low)
})
```

---

## 15) Delivery Plan

## Phase 1 (MVP Core)
- Auth + user profile
- Activity ingestion + normalization
- XP + meta-stamina engine
- Character model + level progression
- Basic async battle loop
- Minimal UI skeleton

## Phase 2
- Debuffs and potion usage
- Zone progression tuning
- Anti-cheat hardening
- Better activity history UX

## Phase 3
- Balance pass using telemetry
- Content expansion (enemies/items)
- Visual polish and onboarding improvements

---

## 16) Success Criteria (MVP Exit)

Ship-readiness targets for first cohort:
- Ingest success rate ≥ 98%.
- Battle start p95 latency ≤ 400 ms.
- Crash-free sessions ≥ 99.5%.
- D7 retention baseline goal ≥ 20%.

---

## 17) Future Extensions
- PvP/co-op modes
- Guilds/social layers
- Crafting + materials economy
- Skill trees and class specialization
- Dynamic quests tied to fitness patterns

---

## Final Notes

This MVP is intentionally:
- Mechanically simple
- Operationally robust
- Extensible for live balance and feature expansion
