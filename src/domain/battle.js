const BATTLE_META_STAMINA_COST = 100;

const ZONE_BASE_POWER = {
  1: 100,
  2: 180,
  3: 280,
};

const DEBUFF_POOL = [
  { type: 'fatigue', value_pct: -10, duration_hours: 12 },
  { type: 'injury', value_pct: -15, duration_hours: 24 },
  { type: 'sluggish', value_pct: -10, duration_hours: 12 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createSeededRandom(seed) {
  let state = BigInt(seed) || 1n;
  return () => {
    state = (1664525n * state + 1013904223n) % 4294967296n;
    return Number(state) / 4294967296;
  };
}

function randomFactor(rand) {
  return 0.9 + rand() * 0.2;
}

function zoneBase(zoneId) {
  return ZONE_BASE_POWER[zoneId] ?? ZONE_BASE_POWER[1];
}

export function resolveBattle({ user, zoneId = 1, seed }) {
  const rand = createSeededRandom(seed);
  const enemyPower = zoneBase(zoneId) * (1 + user.level * 0.1);

  const attackStat = user.stats_json.strength;
  const enemyAgility = Math.round(enemyPower / 30);
  const agilityDelta = user.stats_json.agility - enemyAgility;

  const hitChance = clamp(0.65 + agilityDelta * 0.01, 0.35, 0.95);
  const critChance = clamp(user.stats_json.focus * 0.01, 0.01, 0.4);

  const playerHit = rand() <= hitChance;
  const enemyHit = rand() <= clamp(0.65 - agilityDelta * 0.005, 0.35, 0.95);
  const playerCrit = rand() <= critChance;
  const enemyCrit = rand() <= 0.1;

  const playerDamage = playerHit
    ? Math.round(attackStat * 12 * randomFactor(rand) * (playerCrit ? 1.5 : 1))
    : 0;
  const enemyDamage = enemyHit
    ? Math.round(enemyPower * 0.1 * randomFactor(rand) * (enemyCrit ? 1.25 : 1))
    : 0;

  const playerScore = user.level * 12 + playerDamage + user.stats_json.endurance * 3;
  const enemyScore = enemyPower + enemyDamage;

  const result = playerScore >= enemyScore ? 'win' : 'loss';
  const goldReward = result === 'win' ? Math.round(enemyPower * 0.2 + rand() * 20) : 0;

  const debuff = result === 'loss'
    ? DEBUFF_POOL[Math.floor(rand() * DEBUFF_POOL.length)]
    : null;

  return {
    result,
    gold_reward: goldReward,
    damage_dealt: playerDamage,
    damage_taken: enemyDamage,
    enemy_power: Math.round(enemyPower),
    debuff,
    meta_stamina_spent: BATTLE_META_STAMINA_COST,
  };
}

export { BATTLE_META_STAMINA_COST };
