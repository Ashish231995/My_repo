/** Approved planning-contract values from contracts/golden-scenarios.md */
export const GOLDEN_A = {
  compositeDisplay: 94,
  classification: 'healthy' as const,
  recommendationCount: 0,
};

export const GOLDEN_B = {
  snapshotAsOfDate: '2026-06-01',
  milestoneDueDate: '2026-06-11',
  slipDays: 8,
  compositeDisplay: 51,
  classification: 'at-risk' as const,
  recommendationIds: ['REC-002', 'REC-001'] as const,
};

export const GOLDEN_C = {
  compositeDisplay: 86,
  classification: 'healthy' as const,
  measuredDimensions: 3,
  teamStatus: 'unmeasured' as const,
  requiredRecommendationId: 'REC-004-team',
};
