import type { DimensionId } from '../model/enums';
import type {
  DimensionDefinition,
  DimensionResult,
  DimensionRuleCatalog,
  EvidenceItem,
} from '../model/evaluation';
import { classifyHealth } from '../utils/classifyHealth';
import { roundHalfUp } from '../utils/roundHalfUp';
import { aggregateCanonicalTypeHealth } from './aggregateCanonicalTypeHealth';
import { calculateDimensionTrend } from './trend';

const DIMENSION_ORDER: DimensionId[] = ['schedule', 'delivery', 'team', 'risk'];

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateDimension(
  dimensionId: DimensionId,
  evidence: EvidenceItem[],
  dimensionDef: DimensionDefinition,
  ruleCatalog: DimensionRuleCatalog,
): DimensionResult {
  void ruleCatalog;
  const requiredTypes = dimensionDef.requiredTypes;
  const scoringEvidence = evidence.filter(
    (item) =>
      item.validity === 'valid' &&
      item.includedInScoring &&
      item.mapping.status === 'mapped' &&
      item.mapping.canonicalType,
  );
  const typeHealth = aggregateCanonicalTypeHealth(scoringEvidence, requiredTypes);

  const presentTypes = requiredTypes.filter((type) => typeHealth.has(type));
  const missingRequiredCanonicalTypes = requiredTypes.filter((type) => !typeHealth.has(type));
  const coveragePercent =
    requiredTypes.length === 0 ? 0 : (presentTypes.length / requiredTypes.length) * 100;

  const canonicalTypeHealth: Partial<Record<string, number>> = {};
  for (const [type, value] of typeHealth) {
    canonicalTypeHealth[type] = value;
  }

  let measurementStatus: DimensionResult['measurementStatus'];
  if (coveragePercent === 0) {
    measurementStatus = 'unmeasured';
  } else if (coveragePercent < 100) {
    measurementStatus = 'partial';
  } else {
    measurementStatus = 'measured';
  }

  let rawScore: number | null = null;
  let displayScore: number | null = null;
  let classification: DimensionResult['classification'] = null;

  if (measurementStatus !== 'unmeasured') {
    rawScore = mean(presentTypes.map((type) => typeHealth.get(type)!));
    displayScore = roundHalfUp(rawScore);
    classification = classifyHealth(displayScore);
  }

  const trend = calculateDimensionTrend(scoringEvidence, requiredTypes);

  return {
    dimensionId,
    measurementStatus,
    rawScore,
    displayScore,
    canonicalTypeHealth,
    classification,
    coveragePercent,
    missingRequiredCanonicalTypes,
    missingSignalGroupIds: [],
    trend,
    findings: [],
    evidence,
    explanation: `${dimensionId} dimension evaluated from ${presentTypes.length} of ${requiredTypes.length} required canonical types`,
  };
}

export function getDimensionOrder(): readonly DimensionId[] {
  return DIMENSION_ORDER;
}
