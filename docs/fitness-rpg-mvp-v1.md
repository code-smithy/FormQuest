# Fitness RPG — Design Document (MVP v1)

## 1. Product Overview

A cross-platform fitness RPG that converts real-world activity into in-game progression. Users perform physical activities, generate energy, initiate battles, and progress through a structured world.

### Core Principles
- Reward consistency over absolute performance.
- Minimize friction in data ingestion.
- Keep gameplay async and low-interaction.
- Avoid punitive mechanics that discourage fitness.

## 2. Core Gameplay Loop

**Activity → XP + Energy → Start Battle → Auto Resolve → Rewards → Progression → Repeat**

### Loop Breakdown
1. User performs activity (walking, running, etc.).
2. System ingests data from health APIs.
3. Activity converts into:
   - XP (progression)
   - Meta-Stamina (battle currency)
4. User initiates battle.
5. Combat resolves automatically.
6. Rewards granted:
   - Gold
   - Loot
7. Progression updates:
   - Level up
   - Stat increases
   - Zone unlocks

## 3. Activity & XP System

### 3.1 Activity Categories

| Category | Source Data | Stats Affected |
|---|---|---|
| Endurance | Steps, walking, running | HP, Stamina |
| Strength | Workouts | Strength |
| Intensity | Heart rate / pace | Crit, Skill regen |

### 3.2 XP Calculation

`XP = BaseXP(activity) × Intensity × DurationFactor + (Calories × 0.05)`

**BaseXP (per minute):**
- Walking: 1
- Running: 2.5
- Cycling: 2
- Strength: 3.5

**Intensity:**
- HR zone-based, or fallback `1.0`

**DurationFactor:**
- `min(1.5, log(duration + 1))`

### 3.3 Meta-Stamina (Battle Currency)

`MetaStamina = XP × 0.25`

- Required to initiate battles.
- Regenerated only via activity.

## 4. Character System

### 4.1 Core Stats

| Stat | Source | Effect |
|---|---|---|
| Strength | Strength training | Damage |
| Endurance | Steps/cardio | HP |
| Agility | Running pace | Dodge/Speed |
| Focus | Streaks | Skill efficiency |

### 4.2 Leveling

`LevelXP(n) = 100 × n^1.5`

On level-up:
- Stat points are distributed automatically based on activity mix.

## 5. Combat System

### 5.1 Model
- Async and deterministic.
- Initiated manually.
- One battle at a time.

### 5.2 Combat Flow

`StartBattle → Consume MetaStamina → Resolve → Outcome`

### 5.3 Resolution Formula (simplified)
- `Damage = Strength × SkillMultiplier × RandomFactor`
- `HitChance = Base + AgilityDifference`
- `CritChance = Focus × 0.01`

### 5.4 Enemy Scaling

`EnemyPower = ZoneBase × (1 + PlayerLevel × 0.1)`

## 6. Failure System

On loss:
- No rewards.
- Apply debuff.

### 6.1 Debuff System
- Selected randomly from a debuff pool.
- Stackable.
- Duration-based.

Examples:
- Fatigue: `-10% stamina`
- Injury: `-15% strength`
- Sluggish: `-10% agility`

### 6.2 Retry Logic
- Immediate retry allowed.
- Debuffs persist, creating compounding difficulty.

## 7. World Design

### 7.1 Structure
- Hybrid model:
  - Linear zones
  - Procedural encounters

### 7.2 Zones

| Zone | Theme | Difficulty |
|---|---|---|
| 1 | Forest | Low |
| 2 | Desert | Medium |
| 3 | Mountain | High |

### 7.3 Progression
- No hard locks.
- Difficulty naturally filters progression.

## 8. Economy

### 8.1 Currency

Primary:
- Gold

Future-ready:
- Materials
- Crafting components

### 8.2 Uses
Potions:
- HP restore
- Stamina restore
- Meta-stamina restore

## 9. Progression Tracking

### 9.1 Fitness Metrics (visible)
- Steps/day
- Activity streaks (strict)
- Weekly totals

### 9.2 RPG Metrics
- Level
- Stats
- Gear

### 9.3 Streak System
- Strict:
  - Missed day resets streak.
- Optional later:
  - Grace system

## 10. Data Architecture

### 10.1 Core Entities

**User**
- `id`
- `level`
- `xp`
- `meta_stamina`
- `stats {str, end, agi, focus}`
- `streak`

**Activity**
- `id`
- `user_id`
- `type`
- `duration`
- `calories`
- `steps`
- `heart_rate_avg`
- `timestamp`

**Battle**
- `id`
- `user_id`
- `enemy_id`
- `result`
- `damage_dealt`
- `damage_taken`
- `timestamp`

**Debuff**
- `id`
- `user_id`
- `type`
- `value`
- `duration`
- `expires_at`

**Inventory**
- `user_id`
- `item_id`
- `quantity`

## 11. API Design (MVP)

### Activity
- `POST /activity/ingest`
- `GET /activity/history`

### Character
- `GET /character`
- `POST /character/level-up`

### Battle
- `POST /battle/start`
- `GET /battle/result`

### Inventory
- `GET /inventory`
- `POST /inventory/use`

## 12. Architecture

### Frontend
- React Native (Expo)

### Backend
- Node.js (NestJS)

### Database
- PostgreSQL

### Sync Sources
- Apple Health
- Google Fit

### High-Level Flow
`Device → Health API → Backend → XP Engine → DB → Client UI`

## 13. Anti-Cheat (Medium)
- Reject impossible values (e.g., `50k steps/hour`).
- Reject heart rate outside human bounds.
- Detect spikes vs user baseline.

## 14. Automated Testing Strategy (TDD)

### 14.1 Unit Tests

**XP Engine**
- Input variations by activity type
- Edge cases (0 duration, missing HR)

**Combat Engine**
- Deterministic outcomes with seed
- Stat scaling validation

**Progression**
- Level curve correctness
- Stat allocation

### 14.2 Integration Tests
- Activity ingestion → XP update
- Battle → reward pipeline

### 14.3 Example (pseudo)

```ts
test("xp increases with intensity", () => {
  const low = calcXP({ duration: 30, intensity: 1 })
  const high = calcXP({ duration: 30, intensity: 1.5 })
  expect(high).toBeGreaterThan(low)
})
```

## 15. Implementation Plan

### Phase 1 (MVP Core)
- Activity ingestion
- XP system
- Character model
- Basic combat
- UI skeleton

### Phase 2
- Debuffs
- Inventory + potions
- Zones

### Phase 3
- Balancing
- Anti-cheat improvements
- Visual polish

## 16. Open Extensions (Future)
- PvP / co-op
- Guilds
- Crafting system
- Advanced skill trees
- Dynamic quests

## Final Note

This design is intentionally:
- Simple in mechanics
- Extensible in architecture
- Balanced for real-world variability
