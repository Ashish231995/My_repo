import type { EvidenceItem } from '../../src/domain/model/evaluation';
import type { CanonicalSignalType } from '../../src/domain/model/enums';

/** Test helper — healthValue is consumed by aggregateCanonicalTypeHealth (T059). */
export interface ScoringEvidence extends EvidenceItem {
  healthValue: number;
}

export function makeScoringEvidence(
  id: string,
  canonicalType: CanonicalSignalType,
  healthValue: number,
  includedInScoring = true,
): ScoringEvidence {
  return {
    id,
    canonicalSignalId: id,
    validity: 'valid',
    exclusionReason: null,
    mapping: {
      status: 'mapped',
      canonicalType,
      reason: null,
      provenance: {
        representativeSourceLabel: 'Representative work-tracker (demo)',
        originalSourceTerm: 'test-signal',
        canonicalSignalType: canonicalType,
        mappingStatus: 'mapped',
      },
    },
    snapshot: { asOfDate: '2026-06-01', label: 'test snapshot' },
    includedInScoring,
    resolvedAsOfDate: '2026-06-01',
    sourceTerm: 'test-signal',
    healthValue,
  };
}
