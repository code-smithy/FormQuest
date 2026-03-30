# Work Breakdown Structure (WBS) — Fitness RPG MVP

## 1. Product & Design
### 1.1 Scope and Requirements
- Finalize MVP feature scope from design doc.
- Confirm non-goals and out-of-scope work.
- Define release quality bar.

### 1.2 UX Flows
- Onboarding and health permissions flow.
- Home dashboard flow (fitness + RPG summary).
- Battle flow and result screens.
- Inventory and potion usage flow.

### 1.3 Content Design
- Zone and enemy definitions (v1 set).
- Loot table v1.
- Debuff tuning constants.

## 2. Mobile App (React Native / Expo)
### 2.1 Foundations
- App shell/navigation.
- Auth/session persistence.
- API client and error handling.

### 2.2 Features
- Activity sync UI and ingestion trigger.
- Character profile screen.
- Battle start and result rendering.
- Inventory list and consume item action.
- Progress views (streak, weekly totals, level bar).

### 2.3 Quality
- Component test coverage for critical views.
- Analytics instrumentation.
- Crash/error reporting integration.

## 3. Backend (Node.js / NestJS)
### 3.1 Platform
- Service scaffolding and module boundaries.
- Auth middleware and user identity mapping.
- Config + environment management.

### 3.2 Domain Engines
- XP engine + validation pipeline.
- Meta-stamina calculation and cap logic.
- Level progression engine.
- Combat engine (deterministic seeded).
- Debuff application and expiry job.

### 3.3 APIs
- Activity ingest/history endpoints.
- Character endpoints.
- Battle start/result endpoints.
- Inventory get/use endpoints.

### 3.4 Reliability
- Idempotency for ingest events.
- Event dedup and anti-cheat quarantine.
- Structured logs and metrics.

## 4. Data & Infrastructure
### 4.1 Data Modeling
- Postgres schema and migrations for core entities.
- Constraints/indexes for performance and integrity.
- Audit fields and lifecycle policies.

### 4.2 DevOps
- CI pipeline (lint, unit, integration).
- Staging and production config baselines.
- Monitoring dashboards and alert setup.

## 5. QA and Release
### 5.1 Test Planning
- Unit and integration test matrix.
- End-to-end smoke plan.
- Regression checklist.

### 5.2 Release Readiness
- Milestone exit verification.
- Store build validation.
- Rollout and rollback plan.

## 6. Analytics & Operations
### 6.1 Metrics
- Ingest success rate tracking.
- Battle latency and reliability metrics.
- Retention and streak adherence metrics.

### 6.2 Live Operations
- Balance update process.
- Incident triage and ownership model.
