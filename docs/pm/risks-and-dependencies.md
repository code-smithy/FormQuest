# Risks and Dependencies — Fitness RPG MVP

## Active Risks

| ID | Risk | Impact | Likelihood | Owner | Mitigation | Status |
|---|---|---|---|---|---|---|
| R-01 | Health data inconsistency across providers | High | High | Mobile/Backend | Normalize units + source-specific adapters + fallbacks | Open |
| R-02 | Activity fraud / spoofing inflates progression | High | Medium | Backend | Anti-cheat rules + quarantine + caps/clamps | Open |
| R-03 | Combat balancing causes high churn | Medium | Medium | Product/Game Design | Telemetry-driven tuning pass each sprint | Open |
| R-04 | API latency under load impacts UX | Medium | Medium | Backend/Infra | Cache reads + query tuning + SLO monitoring | Open |
| R-05 | Scope creep from post-MVP requests | High | Medium | Product | Strict P0/P1 gate and change-control review | Open |

## External Dependencies

| ID | Dependency | Team/Provider | Needed By | Notes |
|---|---|---|---|---|
| D-01 | Apple Health integration path | Mobile | M1 | Confirm permission UX + mapping fields |
| D-02 | Google Fit integration path | Mobile | M1 | Validate Android API changes and edge cases |
| D-03 | Push notification provider | Mobile/Infra | M3 | Optional for retention nudges |
| D-04 | Error monitoring stack | Infra | M3 | Required for launch readiness |
| D-05 | Analytics warehouse/dashboard | Data | M4 | Needed for success criteria tracking |

## Decision Log (Project-Level)
- **DL-01**: Keep battle system async and server-authoritative for MVP.
- **DL-02**: No hard-lock zones in MVP; progression filtered by difficulty.
- **DL-03**: Strict streak resets for MVP, grace system deferred.
