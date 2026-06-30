import type { CanonicalSignalType } from '../model/enums';
import type { EvidenceItem, TrendResult } from '../model/evaluation';
import { compareSnapshotDates } from '../utils/compareSnapshotDates';

function isTrendEligible(item: EvidenceItem): boolean {
  return (
    item.validity === 'valid' &&
    item.includedInScoring &&
    item.mapping.status === 'mapped' &&
    item.mapping.canonicalType !== null &&
    item.healthValue !== null &&
    item.healthValue !== undefined &&
    Boolean(item.resolvedAsOfDate?.trim())
  );
}

/** Demonstration Trend Rule v1.0 — per canonical signal type. */
export function calculateTrendForCanonicalType(
  evidence: EvidenceItem[],
  canonicalType: CanonicalSignalType,
): TrendResult | null {
  const points = evidence
    .filter(
      (item) => isTrendEligible(item) && item.mapping.canonicalType === canonicalType,
    )
    .map((item) => ({
      date: item.resolvedAsOfDate,
      health: item.healthValue as number,
    }));

  const healthByDate = new Map<string, number>();
  for (const point of points) {
    if (healthByDate.has(point.date)) {
      return null;
    }
    healthByDate.set(point.date, point.health);
  }

  if (healthByDate.size < 2) {
    return null;
  }

  const sorted = [...healthByDate.entries()].sort(
    (left, right) => compareSnapshotDates(right[0], left[0]),
  );
  const earliestHealth = sorted[0][1];
  const latestHealth = sorted[sorted.length - 1][1];

  if (latestHealth > earliestHealth) {
    return { direction: 'improving', label: 'Improving' };
  }
  if (latestHealth < earliestHealth) {
    return { direction: 'declining', label: 'Declining' };
  }
  return { direction: 'stable', label: 'Stable' };
}

/** Dimension trend when qualifying canonical types agree; null when conflicting or insufficient. */
export function calculateDimensionTrend(
  evidence: EvidenceItem[],
  requiredTypes: readonly CanonicalSignalType[],
): TrendResult | null {
  const trends: TrendResult[] = [];

  for (const canonicalType of requiredTypes) {
    const trend = calculateTrendForCanonicalType(evidence, canonicalType);
    if (trend) {
      trends.push(trend);
    }
  }

  if (trends.length === 0) {
    return null;
  }

  const directions = new Set(trends.map((trend) => trend.direction));
  if (directions.size > 1) {
    return null;
  }

  return trends[0];
}
