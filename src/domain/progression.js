export function levelXpRequirement(levelTarget) {
  return Math.floor(100 * Math.pow(levelTarget, 1.5));
}

export function deriveLevelFromXp(totalXp) {
  let level = 1;
  while (totalXp >= levelXpRequirement(level + 1)) {
    level += 1;
  }
  return level;
}

export function allocateStats(levelsGained, dominantCategory, currentStats) {
  const stats = { ...currentStats };
  const categories = ["strength", "endurance", "agility"];

  for (let i = 0; i < levelsGained; i += 1) {
    stats.focus += 1;
    if (categories.includes(dominantCategory)) {
      stats[dominantCategory] += 2;
      const others = categories.filter((c) => c !== dominantCategory);
      stats[others[0]] += 1;
      stats[others[1]] += 1;
    } else {
      stats.endurance += 2;
      stats.strength += 1;
      stats.agility += 1;
    }
  }

  return stats;
}

export function applyProgression(user, xpGain, dominantCategory = "endurance") {
  const beforeLevel = user.level;
  const nextTotal = user.xp_total + xpGain;
  const afterLevel = deriveLevelFromXp(nextTotal);
  const levelsGained = afterLevel - beforeLevel;

  return {
    ...user,
    xp_total: nextTotal,
    level: afterLevel,
    stats_json: allocateStats(levelsGained, dominantCategory, user.stats_json),
  };
}
