import type { CanonicalSignalType } from '../model/enums';
import type { EvidenceItem } from '../model/evaluation';

function getHealthValue(item: EvidenceItem): number | null {
  if (item.healthValue === null || item.healthValue === undefined) {
    return null;
  }
  return item.healthValue;
}

/** HD-07: mean valid per-signal health values within each required canonical type. */
export function aggregateCanonicalTypeHealth(
  evidence: EvidenceItem[],
  requiredTypes: readonly CanonicalSignalType[],
): Map<CanonicalSignalType, number> {
  const requiredSet = new Set(requiredTypes);
  const valuesByType = new Map<CanonicalSignalType, number[]>();

  for (const item of evidence) {
    if (item.validity !== 'valid' || !item.includedInScoring) {
      continue;
    }
    const canonicalType = item.mapping.canonicalType;
    if (!canonicalType || !requiredSet.has(canonicalType)) {
      continue;
    }
    const healthValue = getHealthValue(item);
    if (healthValue === null) {
      continue;
    }
    const bucket = valuesByType.get(canonicalType) ?? [];
    bucket.push(healthValue);
    valuesByType.set(canonicalType, bucket);
  }

  const result = new Map<CanonicalSignalType, number>();
  for (const [type, values] of valuesByType) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    result.set(type, mean);
  }

  return result;
}
