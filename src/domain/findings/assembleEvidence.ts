import type {
  EvidenceItem,
  MappingResult,
  SignalValidationResult,
  SnapshotMetadata,
  SourceSignal,
} from '../model/evaluation';

export function assembleEvidence(
  source: SourceSignal,
  mapping: MappingResult,
  validation: SignalValidationResult,
  healthValue: number | null,
  snapshot: SnapshotMetadata,
): EvidenceItem {
  return {
    id: `evidence-${source.id}`,
    canonicalSignalId: mapping.canonicalType ? source.id : null,
    validity: validation.valid ? 'valid' : 'invalid',
    exclusionReason: validation.exclusionReason,
    mapping,
    snapshot,
    includedInScoring: validation.includedInScoring && validation.valid && healthValue !== null,
    healthValue,
    sourcePayload: source.payload,
  };
}
