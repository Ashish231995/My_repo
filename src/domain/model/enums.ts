export type Persona = 'novice' | 'intermediate' | 'expert';

export type DimensionId = 'schedule' | 'delivery' | 'team' | 'risk';

export type MeasurementStatus = 'measured' | 'partial' | 'unmeasured';

export type HealthClassification = 'healthy' | 'at-risk' | 'critical';

export type RecommendationPriority = 'urgent' | 'important' | 'advisory';

export type CanonicalSignalType =
  | 'schedule.milestone-slip'
  | 'schedule.baseline-health'
  | 'delivery.blocker-open'
  | 'delivery.scope-stability'
  | 'delivery.velocity-trend'
  | 'team.engagement-score'
  | 'team.communication-cadence'
  | 'risk.issue-escalation'
  | 'risk.governance-gap';

export const CANONICAL_SIGNAL_TYPES: readonly CanonicalSignalType[] = [
  'schedule.milestone-slip',
  'schedule.baseline-health',
  'delivery.blocker-open',
  'delivery.scope-stability',
  'delivery.velocity-trend',
  'team.engagement-score',
  'team.communication-cadence',
  'risk.issue-escalation',
  'risk.governance-gap',
] as const;
