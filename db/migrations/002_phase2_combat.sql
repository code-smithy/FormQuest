CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zone_id INTEGER NOT NULL CHECK (zone_id >= 1),
  result TEXT CHECK (result IN ('win', 'loss')),
  meta_stamina_spent INTEGER NOT NULL CHECK (meta_stamina_spent >= 0),
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  damage_taken INTEGER NOT NULL DEFAULT 0,
  gold_reward INTEGER NOT NULL DEFAULT 0,
  seed BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_battles_user_created_at ON battles(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battles_user_resolved ON battles(user_id, resolved_at);

CREATE TABLE IF NOT EXISTS debuffs (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('fatigue', 'injury', 'sluggish')),
  value_pct NUMERIC NOT NULL,
  stacks INTEGER NOT NULL DEFAULT 1 CHECK (stacks >= 1 AND stacks <= 3),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debuffs_user_type_active ON debuffs(user_id, type, expires_at DESC);
