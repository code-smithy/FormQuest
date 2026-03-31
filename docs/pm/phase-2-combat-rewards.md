# Phase 2 Execution Plan — M2 Combat + Rewards

## Scope Boundary
This phase implements Milestone M2 from the planning docs:
- Battle APIs (`POST /battle/start`, `GET /battle/result/:battleId`)
- Deterministic battle resolution using seeded RNG
- Battle reward logic (gold) and loss/debuff pipeline
- One-active-battle-per-user validation

Out of scope for this phase:
- Inventory and potion usage (M3)
- Mobile UI loop completion and launch hardening (M3/M4)

## Backlog Mapping (M2)

| Milestone Exit Criteria | Backlog Items | Deliverables |
|---|---|---|
| Battle start + result endpoints functional | P0-005 | HTTP routes and service orchestration |
| Deterministic resolution with seed | P0-005 | Domain battle resolver and persisted seed |
| Gold rewards + loss/debuff pipeline | P0-006 | Gold update + debuff stack/expiry storage |
| One-active-battle constraint | P0-005 | Active battle guard in service/repository |

## Phase 2 Initial Build Status
- [x] Added battle domain resolver with deterministic RNG.
- [x] Added battle service for start + result retrieval.
- [x] Added in-memory and Postgres repository methods for battles/debuffs.
- [x] Added HTTP endpoints for battle start/result.
- [x] Added migration for `battles` and `debuffs` tables.
- [x] Added unit + HTTP integration tests for battle flow.
