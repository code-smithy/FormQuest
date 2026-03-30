CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  level INTEGER NOT NULL DEFAULT 1,
  xp_total INTEGER NOT NULL DEFAULT 0,
  meta_stamina INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 0,
  stats_json JSONB NOT NULL DEFAULT '{"strength":1,"endurance":1,"agility":1,"focus":1}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_event_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('walking','running','cycling','strength','other')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
  calories NUMERIC NOT NULL CHECK (calories >= 0),
  steps INTEGER,
  heart_rate_avg INTEGER,
  occurred_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('apple_health','google_fit','manual_import')),
  status TEXT NOT NULL CHECK (status IN ('accepted','duplicate','quarantined')),
  credited_xp INTEGER NOT NULL DEFAULT 0,
  credited_meta_stamina INTEGER NOT NULL DEFAULT 0,
  quarantine_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_event_id)
);

CREATE INDEX IF NOT EXISTS idx_activities_user_occurred_at ON activities(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
