import type { CanonicalSignalType, DimensionId } from '../../src/domain/model/enums';

/** Required canonical types per dimension — Demonstration Rule Catalog v1.0 (HD-01) */
export const REQUIRED_TYPES_BY_DIMENSION: Record<DimensionId, readonly CanonicalSignalType[]> = {
  schedule: ['schedule.milestone-slip', 'schedule.baseline-health'],
  delivery: [
    'delivery.blocker-open',
    'delivery.scope-stability',
    'delivery.velocity-trend',
  ],
  team: ['team.engagement-score', 'team.communication-cadence'],
  risk: ['risk.issue-escalation', 'risk.governance-gap'],
};

export const ALL_REQUIRED_TYPES: readonly CanonicalSignalType[] = [
  ...REQUIRED_TYPES_BY_DIMENSION.schedule,
  ...REQUIRED_TYPES_BY_DIMENSION.delivery,
  ...REQUIRED_TYPES_BY_DIMENSION.team,
  ...REQUIRED_TYPES_BY_DIMENSION.risk,
];
