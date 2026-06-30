import type {
  DimensionRuleCatalog,
  RecommendationRuleCatalog,
} from '../model/evaluation';
import type { CanonicalSignalType, DimensionId } from '../model/enums';

const SCHEDULE_TYPES: CanonicalSignalType[] = [
  'schedule.milestone-slip',
  'schedule.baseline-health',
];

const DELIVERY_TYPES: CanonicalSignalType[] = [
  'delivery.blocker-open',
  'delivery.scope-stability',
  'delivery.velocity-trend',
];

const TEAM_TYPES: CanonicalSignalType[] = [
  'team.engagement-score',
  'team.communication-cadence',
];

const RISK_TYPES: CanonicalSignalType[] = ['risk.issue-escalation', 'risk.governance-gap'];

function dimensionDef(
  dimensionId: DimensionId,
  requiredTypes: CanonicalSignalType[],
): DimensionRuleCatalog['dimensions'][DimensionId] {
  return { dimensionId, requiredTypes };
}

/** Approved dimension rule catalog — HD-01 / HD-02 per scoring-rules.md */
export const DIMENSION_RULE_CATALOG: DimensionRuleCatalog = {
  dimensions: {
    schedule: dimensionDef('schedule', SCHEDULE_TYPES),
    delivery: dimensionDef('delivery', DELIVERY_TYPES),
    team: dimensionDef('team', TEAM_TYPES),
    risk: dimensionDef('risk', RISK_TYPES),
  },
};

/** Approved recommendation rule catalog marker — rules in recommendation-rules.md */
export const RECOMMENDATION_RULE_CATALOG: RecommendationRuleCatalog = {
  version: '1.0',
};

export const RULE_CATALOGS = {
  dimension: DIMENSION_RULE_CATALOG,
  recommendation: RECOMMENDATION_RULE_CATALOG,
} as const;
