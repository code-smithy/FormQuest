# FormQuest (Fitness RPG) — Phase 1 Scaffold

FormQuest is a fitness-powered RPG concept where real-world activity is converted into in-game progression.

This repository currently contains the **Phase 1 (M1) implementation scaffold** for:
- Activity ingestion
- XP and meta-stamina calculation
- Character progression updates
- Anti-cheat quarantine baseline
- Activity history retrieval

> Current state: backend/domain scaffold with tests, OpenAPI contract, CI, and a Postgres migration foundation.

## What is implemented

### Core logic
- XP engine with duration clamps, HR-based intensity multiplier, and per-activity XP cap.
- Meta-stamina gain based on `floor(XP * 0.25)` with max cap handling.
- Level derivation from cumulative XP and auto stat allocation.
- Schema validation and anti-cheat quarantine checks.

### Service and API
- `ActivityService` implementing ingest flow (idempotency, quarantine, progression updates).
- HTTP endpoints:
  - `POST /activity/ingest`
  - `GET /activity/history`
- OpenAPI contract at `docs/api/activity-api-openapi.yaml`.

### Persistence
- In-memory repository for local/dev tests.
- Postgres repository implementation and SQL migration for `users` and `activities`.

### Quality
- Unit + integration tests (domain, service, and HTTP behavior).
- CI workflow for install, OpenAPI validation, and test execution.

---

## Local install and setup

## 1) Prerequisites
- Node.js 22+ (recommended to match CI)
- npm 10+
- (Optional) PostgreSQL 14+ if you want DB-backed persistence

## 2) Clone and install
```bash
git clone <your-repo-url>
cd FormQuest
npm ci
```

## 3) Validate contract and run tests
```bash
npm run lint:openapi
npm test
```

## 4) Start the local server (current scaffold)
```bash
npm start
```
By default, the entrypoint currently starts with the in-memory repository for portability.

Server default:
- URL: `http://localhost:3000`

---

## Using the API locally

All requests require an `x-user-id` header.

### Ingest example
```bash
curl -X POST http://localhost:3000/activity/ingest \
  -H "content-type: application/json" \
  -H "x-user-id: user-1" \
  -d '{
    "events": [{
      "source_event_id": "evt-1",
      "type": "walking",
      "duration_minutes": 30,
      "calories": 120,
      "steps": 3000,
      "heart_rate_avg": 120,
      "occurred_at": "2026-03-30T11:00:00Z",
      "source": "apple_health"
    }]
  }'
```

### History example
```bash
curl "http://localhost:3000/activity/history?limit=30" \
  -H "x-user-id: user-1"
```

---

## Postgres setup (implemented foundation)

A migration exists at:
- `db/migrations/001_phase1_core.sql`

To apply manually in a local Postgres instance:
```bash
psql "$DATABASE_URL" -f db/migrations/001_phase1_core.sql
```

A Postgres repository is implemented in:
- `src/repositories/postgresRepo.js`

> Note: the default runtime entrypoint currently wires the in-memory repository. Switching runtime bootstrap to Postgres is straightforward and can be done in the next iteration by instantiating `PostgresRepo` in `src/index.js`.

---

## Project structure

```text
src/
  domain/            # XP, progression, anti-cheat rules
  repositories/      # in-memory + postgres repository implementations
  services/          # activity ingest/history service orchestration
  http/              # HTTP routes/server
  index.js           # local runtime entrypoint

docs/
  api/               # OpenAPI contract
  pm/                # phase planning and progress tracking

tests/               # node:test unit/integration/http tests

db/migrations/       # SQL migration scripts
scripts/             # local tooling (OpenAPI validator)
```

---

## Current phase status

Phase 1 is marked complete in scaffold terms (core logic + API + migration + tests + CI).

Planned next focus:
- Production hardening
- Environment provisioning and secrets
- Phase 2 combat/rewards implementation
