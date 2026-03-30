# Milestones — Fitness RPG MVP

> Dates are placeholders and should be updated during planning.

## M0 — Project Setup (Week 1)
### Exit Criteria
- Owners assigned for mobile, backend, data, QA.
- MVP scope and non-goals signed off.
- Repo standards, CI baseline, and environments ready.

## M1 — Core Ingestion + Progression (Weeks 2–4)
### Exit Criteria
- `POST /activity/ingest` and `GET /activity/history` functional.
- XP/meta-stamina calculations implemented with tests.
- Character level progression updates from ingestion.
- Anti-cheat baseline checks enforced for ingest.

## M2 — Combat + Rewards (Weeks 5–7)
### Exit Criteria
- `POST /battle/start` + `GET /battle/result/:battleId` functional.
- Deterministic battle resolution with seeded RNG.
- Gold reward logic and loss/debuff pipeline implemented.
- One-active-battle-per-user constraint validated.

## M3 — Inventory + UX Completion (Weeks 8–9)
### Exit Criteria
- Inventory retrieval and item use endpoints functional.
- Potion effects integrated with combat/progression states.
- Mobile UX supports daily loop end-to-end.
- Crash reporting + analytics events validated.

## M4 — Hardening + Launch Readiness (Weeks 10–12)
### Exit Criteria
- Performance/reliability thresholds met.
- Full regression and smoke test pass.
- Launch runbook + incident response playbook approved.
- MVP success criteria dashboard live.
