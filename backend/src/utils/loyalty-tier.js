const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 500,
  GOLD: 1500,
  PLATINUM: 5000,
};

const TIER_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

export function calculateTier(lifetimePoints) {
  if (lifetimePoints >= TIER_THRESHOLDS.PLATINUM) return 'PLATINUM';
  if (lifetimePoints >= TIER_THRESHOLDS.GOLD) return 'GOLD';
  if (lifetimePoints >= TIER_THRESHOLDS.SILVER) return 'SILVER';
  return 'BRONZE';
}

export function getPointsToNextTier(lifetimePoints) {
  const currentTier = calculateTier(lifetimePoints);
  if (currentTier === 'PLATINUM') return 0;
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  const nextTier = TIER_ORDER[currentIndex + 1];
  const nextThreshold = TIER_THRESHOLDS[nextTier];
  return nextThreshold - lifetimePoints;
}

export function getTierThresholds() {
  return TIER_THRESHOLDS;
}
