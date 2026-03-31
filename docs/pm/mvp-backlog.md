# MVP Backlog — Prioritized

Priority labels:
- P0 = must-have for MVP ship.
- P1 = high-value, post-core but still MVP candidate.
- P2 = defer if schedule risk emerges.

## P0 — Core Gameplay & Platform

- [ ] **P0-001** Activity ingestion endpoint with event validation and dedup.
  - Owner: Backend
  - Acceptance criteria:
    - Accepts batch events.
    - Rejects invalid schema values.
    - Idempotent on duplicate source event IDs.

- [ ] **P0-002** XP engine implementation with clamping/caps.
  - Owner: Backend
  - Acceptance criteria:
    - Formula matches design spec.
    - Duration clamp and XP caps applied.
    - Unit tests for edge cases pass.

- [ ] **P0-003** Meta-stamina accounting.
  - Owner: Backend
  - Acceptance criteria:
    - `floor(XP * 0.25)` gain behavior implemented.
    - Upper cap enforced.
    - Stored transactionally with XP update.

- [ ] **P0-004** Character progression service.
  - Owner: Backend
  - Acceptance criteria:
    - Level computed from cumulative XP.
    - Multi-level-up supported.
    - Stat allocation policy applied.

- [x] **P0-005** Battle start + deterministic resolution.
  - Owner: Backend
  - Acceptance criteria:
    - Enforces one active battle per user.
    - Consumes battle cost before resolution.
    - Result reproducible with stored seed.

- [x] **P0-006** Loss/debuff pipeline.
  - Owner: Backend
  - Acceptance criteria:
    - Loss applies one debuff from pool.
    - Stacking and expiration rules enforced.

- [ ] **P0-007** Mobile daily loop UI.
  - Owner: Mobile
  - Acceptance criteria:
    - User can sync activity, start battle, view result.
    - Character summary and streak visible.

- [ ] **P0-008** Core DB schema + migrations.
  - Owner: Data/Backend
  - Acceptance criteria:
    - User/activity/battle/debuff/inventory tables created.
    - Required indexes and constraints added.

## P1 — Quality, Safety, and Operations

- [ ] **P1-001** Anti-cheat quarantine path.
  - Owner: Backend
  - Acceptance criteria:
    - Suspicious events marked quarantined.
    - Quarantined events excluded from XP totals.

- [ ] **P1-002** Inventory API + potion effects.
  - Owner: Backend + Mobile
  - Acceptance criteria:
    - Can consume potion from client.
    - State updates reflected in next battle.

- [ ] **P1-003** Telemetry instrumentation.
  - Owner: Mobile + Backend
  - Acceptance criteria:
    - Ingest success/failure events tracked.
    - Battle latency and outcome tracked.

- [ ] **P1-004** E2E smoke coverage.
  - Owner: QA
  - Acceptance criteria:
    - End-to-end path tested on staging.
    - No critical blockers.

## P2 — If Capacity Allows

- [ ] **P2-001** Grace-day option prototype for streaks.
- [ ] **P2-002** Additional enemy/loot variety.
- [ ] **P2-003** Expanded progress visualizations.
