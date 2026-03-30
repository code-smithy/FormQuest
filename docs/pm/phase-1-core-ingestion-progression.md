# Phase 1 Execution Plan — M1 Core Ingestion + Progression

## Scope Boundary
This phase implements Milestone M1 from the planning docs:
- Activity ingestion APIs (`POST /activity/ingest`, `GET /activity/history`)
- XP + meta-stamina calculation pipeline
- Character progression updates from ingested activity
- Anti-cheat baseline checks at ingest time

Out of scope for this phase:
- Battle flow, rewards, and debuffs (M2)
- Inventory and potion usage (M3)
- Full launch hardening and SLO sign-off (M4)

## Backlog Mapping (M1)

| Milestone Exit Criteria | Backlog Items | Deliverables |
|---|---|---|
| Ingest + history endpoints functional | P0-001 | API routes, validation, idempotency |
| XP/meta-stamina calculations with tests | P0-002, P0-003 | Domain engine + unit tests |
| Character level progression updates | P0-004 | Progression service + stat allocation |
| Anti-cheat baseline checks enforced | P1-001 (pulled forward) | Quarantine rules + event flagging |

## Implementation Order
1. **Data contracts + persistence model**
   - Define activity ingest payload contract.
   - Define normalized activity schema and ingest transaction boundary.
   - Add idempotency key strategy using source event IDs.
2. **Ingestion service + validation**
   - Reject invalid values and impossible metrics.
   - Normalize units and clamp duration.
   - Quarantine suspicious records instead of crediting XP.
3. **XP and meta-stamina engine**
   - Apply formula, multipliers, clamps, per-activity cap.
   - Apply `floor(XP * 0.25)` and global meta-stamina cap.
4. **Progression updater**
   - Update cumulative XP and derived level.
   - Support multi-level-up behavior.
   - Apply baseline auto-stat allocation per level gained.
5. **History query endpoint**
   - Return normalized and audit-safe activity history.
6. **Test coverage + milestone readiness checks**
   - Unit tests for formulas and edge cases.
   - Integration tests for idempotent ingest and transactional consistency.

## API Contract Starter (Draft v0)

### `POST /activity/ingest`
Request body (batch):
```json
{
  "events": [
    {
      "source_event_id": "apple-12345",
      "type": "walking",
      "duration_minutes": 45,
      "calories": 220,
      "steps": 5200,
      "heart_rate_avg": 131,
      "occurred_at": "2026-03-29T14:12:00Z",
      "source": "apple_health"
    }
  ]
}
```

Response body:
```json
{
  "accepted": 1,
  "duplicates": 0,
  "quarantined": 0,
  "awarded_xp": 96,
  "awarded_meta_stamina": 24,
  "user": {
    "xp_total": 2480,
    "level": 8,
    "meta_stamina": 612
  }
}
```

Validation + anti-cheat baseline rules:
- Reject negative numeric values.
- Clamp `duration_minutes` to `[1, 240]` before XP calculation.
- Quarantine events with impossible values (example thresholds):
  - walking/running pace equivalent below 2:30 min/km sustained
  - calories per minute above configured percentile cap
  - duplicate source event IDs across providers
- Duplicates should be ignored without applying rewards.

### `GET /activity/history`
Query params:
- `cursor` (optional)
- `limit` (default 30, max 100)

Response fields:
- normalized event list
- quarantine status per event
- derived XP/meta-stamina credited per event

## Definition of Done for Phase 1
- M1 exit criteria pass with evidence linked from tracker.
- Backlog items P0-001 to P0-004 are marked done.
- P1-001 anti-cheat baseline is implemented at least in v1 rule set.
- Formula tests include edge cases from design document constants.
- Integration tests cover duplicate ingest and transactional updates.

## Immediate Next 5 Tasks
1. Create OpenAPI stubs for ingest/history payloads.
2. Create domain test vectors for XP and level curve.
3. Draft DB migration plan for user/activity fields and idempotency index.
4. Define quarantine reason codes for anti-cheat triage.
5. Add M1 execution board links in progress tracker.
