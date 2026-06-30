import type { MappingRegistry } from '../../data/fixtures/mapping-registry';
import type { CanonicalSignal, MappingResult, SourceSignal } from '../model/evaluation';

export function normalizeSignal(
  source: SourceSignal,
  mappingRegistry: MappingRegistry,
): MappingResult & { canonical: CanonicalSignal | null } {
  const provenanceBase = {
    originalSourceTerm: source.sourceTerm,
    mappingStatus: 'pending',
  };

  if (source.forceMappingFailure) {
    return {
      status: 'failed',
      canonicalType: null,
      reason: 'Mapping forced to fail for adverse testing',
      provenance: {
        representativeSourceLabel: 'Unknown',
        canonicalSignalType: 'unknown',
        ...provenanceBase,
        mappingStatus: 'failed',
      },
      canonical: null,
    };
  }

  const entry = mappingRegistry[source.mappingKey];
  if (!entry) {
    return {
      status: 'failed',
      canonicalType: null,
      reason: `Unrecognized mapping key: ${source.mappingKey}`,
      provenance: {
        representativeSourceLabel: 'Unknown',
        canonicalSignalType: 'unknown',
        ...provenanceBase,
        mappingStatus: 'failed',
      },
      canonical: null,
    };
  }

  const mapping: MappingResult = {
    status: 'mapped',
    canonicalType: entry.canonicalType,
    reason: null,
    provenance: {
      representativeSourceLabel: entry.representativeSourceLabel,
      canonicalSignalType: entry.canonicalType,
      originalSourceTerm: source.sourceTerm,
      mappingStatus: 'mapped',
    },
  };

  return {
    ...mapping,
    canonical: {
      id: source.id,
      canonicalType: entry.canonicalType,
      dimensionId: entry.dimensionId,
      healthValue: null,
      sourcePayload: source.payload,
    },
  };
}
