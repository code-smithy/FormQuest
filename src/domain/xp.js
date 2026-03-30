const BASE_XP_PER_MINUTE = {
  walking: 1.0,
  running: 2.5,
  cycling: 2.0,
  strength: 3.5,
  other: 1.0,
};

export const MAX_ACTIVITY_XP = 1500;
export const MAX_META_STAMINA = 5000;

export function clampDuration(durationMinutes) {
  return Math.max(1, Math.min(240, durationMinutes));
}

export function intensityMultiplier(event) {
  if (!event.heart_rate_avg || event.heart_rate_avg <= 0) return 1.0;
  const hr = event.heart_rate_avg;
  if (hr < 110) return 0.9;
  if (hr < 130) return 1.0;
  if (hr < 150) return 1.2;
  if (hr < 170) return 1.35;
  return 1.5;
}

export function calculateXp(event) {
  const base = BASE_XP_PER_MINUTE[event.type] ?? BASE_XP_PER_MINUTE.other;
  const duration = clampDuration(event.duration_minutes);
  const durationFactor = Math.min(1.5, Math.log(duration + 1));
  const calories = Math.max(0, Number(event.calories ?? 0));
  const raw = base * intensityMultiplier(event) * durationFactor + calories * 0.05;
  const rounded = Math.round(raw);
  return Math.max(0, Math.min(MAX_ACTIVITY_XP, rounded));
}

export function metaStaminaGain(xp) {
  return Math.floor(Math.max(0, xp) * 0.25);
}
