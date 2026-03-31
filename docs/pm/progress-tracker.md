# Progress Tracker — Fitness RPG MVP

## Current Status Snapshot
- Overall status: 🟡 In Progress
- Current milestone: M2 (Combat + Rewards)
- Health: 🟡
- Last updated: 2026-03-31
- Phase 1 done?: **Yes** (scaffold complete: logic, persistence layer, HTTP routes, and CI checks added)

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
| M1 | 20 | 20 | 0 | 2026-03-30 |
| M2 | 15 | 8 | 7 | 2026-05-17 |
| M3 | 12 | 0 | 12 | 2026-05-31 |
| M4 | 10 | 0 | 10 | 2026-06-21 |

## Phase 1 Step Board
| Step | Description | Status |
|---|---|---|
| S1 | API contract + payload schema draft | ✅ Done |
| S2 | Ingest validation + anti-cheat + idempotency flow | ✅ Done |
| S3 | XP/meta-stamina/progression engine wiring | ✅ Done |
| S4 | Unit/integration automated tests | ✅ Done |
| S5 | Postgres persistence + migrations | ✅ Done |
| S6 | HTTP routes/server wiring | ✅ Done |
| S7 | CI checks for tests + OpenAPI validation | ✅ Done |


## Phase 2 Step Board
| Step | Description | Status |
|---|---|---|
| S1 | Battle domain equations + deterministic RNG | ✅ Done |
| S2 | Battle service orchestration + stamina cost | ✅ Done |
| S3 | Win rewards + loss/debuff pipeline | ✅ Done |
| S4 | Battle HTTP routes and error handling | ✅ Done |
| S5 | DB migration for battles/debuffs | ✅ Done |
| S6 | Unit/integration automated tests | ✅ Done |

## Phase 2 Open Items
- [ ] Staging-like validation for migration + battle lifecycle in Postgres environment
- [ ] Concurrency verification for one-active-battle constraint under parallel starts
- [ ] Performance evidence for battle p95 latency target
- [ ] Formal product/QA signoff against M2 exit criteria

## Weekly Updates

### Week of 2026-03-30
#### Wins
- M1 phase plan drafted and mapped to backlog dependencies.
- Initial OpenAPI contract committed for ingest/history.
- Core Phase 1 domain/services implemented in code scaffold with automated tests.

#### In Progress
- Execute staging-like verification for battle lifecycle and DB migration rollout.
- Define acceptance evidence for one-active-battle guard under concurrent requests.

#### Blockers
- Need environment-ready Postgres instance to run migration + integration checks for Phase 2.

#### Decisions Needed
- Confirm M2 signoff criteria owner and evidence format for performance/latency checks.

#### Next Week Plan
- Complete M2 signoff checklist and close remaining backlog tracking items for Phase 2.

---

## Change Log
- 2026-03-31: Reconciled M2 tracking, marked P0-005/P0-006 complete, and listed explicit Phase 2 open items.
- 2026-03-31: Added initial Phase 2 implementation status (S1-S6 complete in scaffold).
- 2026-03-30: Marked Phase 1 step board fully complete (S1-S7).
- 2026-03-30: Updated tracker for M1 kickoff and first weekly execution update.
- YYYY-MM-DD: Initialized tracker.
