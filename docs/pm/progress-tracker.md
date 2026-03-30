# Progress Tracker — Fitness RPG MVP

## Current Status Snapshot
- Overall status: 🟡 In Progress
- Current milestone: M1 (Core Ingestion + Progression)
- Health: 🟡
- Last updated: 2026-03-30
- Phase 1 done?: **No** (core logic/test scaffold complete; persistence + HTTP + CI still open)

## KPI Dashboard (weekly update)
| Metric | Target | Current | Trend | Owner |
|---|---:|---:|---|---|
| Ingest success rate | >= 98% | TBD | ↔ | Backend |
| Battle p95 latency | <= 400ms | TBD | ↔ | Backend |
| Crash-free sessions | >= 99.5% | TBD | ↔ | Mobile |
| D7 retention | >= 20% | TBD | ↔ | Product |

## Milestone Burnup
| Milestone | Scope Items | Done | Remaining | ETA |
|---|---:|---:|---:|---|
| M0 | 8 | 8 | 0 | 2026-03-29 |
| M1 | 20 | 8 | 12 | 2026-04-26 |
| M2 | 15 | 0 | 15 | 2026-05-17 |
| M3 | 12 | 0 | 12 | 2026-05-31 |
| M4 | 10 | 0 | 10 | 2026-06-21 |

## Phase 1 Step Board
| Step | Description | Status |
|---|---|---|
| S1 | API contract + payload schema draft | ✅ Done |
| S2 | Ingest validation + anti-cheat + idempotency flow | ✅ Done |
| S3 | XP/meta-stamina/progression engine wiring | ✅ Done |
| S4 | Unit/integration automated tests | ✅ Done |
| S5 | Postgres persistence + migrations | ⏳ Open |
| S6 | HTTP routes/server wiring | ⏳ Open |
| S7 | CI checks for tests + OpenAPI validation | ⏳ Open |

## Weekly Updates

### Week of 2026-03-30
#### Wins
- M1 phase plan drafted and mapped to backlog dependencies.
- Initial OpenAPI contract committed for ingest/history.
- Core Phase 1 domain/services implemented in code scaffold with automated tests.

#### In Progress
- Translating in-memory repository flow to transactional DB persistence.
- Preparing HTTP route layer to match OpenAPI contract exactly.

#### Blockers
- No DB migration framework selected in repo yet.

#### Decisions Needed
- Confirm backend runtime preference for MVP scaffold (NestJS vs lightweight Node service).
- Confirm CI stack choice (GitHub Actions + preferred OpenAPI linter).

#### Next Week Plan
- Add persistence layer and migration scripts.
- Add HTTP routes with request validation and response shaping.
- Add CI pipeline executing test suite and API contract checks.

---

## Change Log
- 2026-03-30: Added Phase 1 step board and coded scaffold status; Phase 1 still open.
- 2026-03-30: Updated tracker for M1 kickoff and first weekly execution update.
- YYYY-MM-DD: Initialized tracker.
