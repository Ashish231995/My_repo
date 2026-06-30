import { describe, expect, it } from 'vitest';
import type { EvidenceItem } from '../../src/domain/model/evaluation';
import {
  calculateDimensionTrend,
  calculateTrendForCanonicalType,
} from '../../src/domain/scoring/trend';
import { makeScoringEvidence } from '../helpers/test-evidence';

function datedEvidence(
  id: string,
  canonicalType: 'schedule.milestone-slip' | 'schedule.baseline-health',
  healthValue: number,
  resolvedAsOfDate: string,
  overrides: Partial<EvidenceItem> = {},
): EvidenceItem {
  return {
    ...makeScoringEvidence(id, canonicalType, healthValue),
    resolvedAsOfDate,
    ...overrides,
  };
}

describe('Demonstration Trend Rule v1.0 (AS-017, AS-018)', () => {
  it('reports improving when latest health is greater than earliest', () => {
    const evidence = [
      datedEvidence('a', 'schedule.milestone-slip', 40, '2026-05-01'),
      datedEvidence('b', 'schedule.milestone-slip', 70, '2026-06-01'),
    ];
    expect(calculateTrendForCanonicalType(evidence, 'schedule.milestone-slip')).toEqual({
      direction: 'improving',
      label: 'Improving',
    });
  });

  it('reports declining when latest health is lower than earliest', () => {
    const evidence = [
      datedEvidence('a', 'schedule.milestone-slip', 80, '2026-05-01'),
      datedEvidence('b', 'schedule.milestone-slip', 50, '2026-06-01'),
    ];
    expect(calculateTrendForCanonicalType(evidence, 'schedule.milestone-slip')).toEqual({
      direction: 'declining',
      label: 'Declining',
    });
  });

  it('reports stable when earliest and latest health are equal', () => {
    const evidence = [
      datedEvidence('a', 'schedule.milestone-slip', 60, '2026-05-01'),
      datedEvidence('b', 'schedule.milestone-slip', 60, '2026-06-01'),
    ];
    expect(calculateTrendForCanonicalType(evidence, 'schedule.milestone-slip')).toEqual({
      direction: 'stable',
      label: 'Stable',
    });
  });

  it('returns null when fewer than two eligible dated points exist', () => {
    const evidence = [datedEvidence('a', 'schedule.milestone-slip', 60, '2026-06-01')];
    expect(calculateTrendForCanonicalType(evidence, 'schedule.milestone-slip')).toBeNull();
  });

  it('returns null when multiple evidence points share the same resolved date', () => {
    const evidence = [
      datedEvidence('a', 'schedule.milestone-slip', 40, '2026-06-01'),
      datedEvidence('b', 'schedule.milestone-slip', 70, '2026-06-01'),
    ];
    expect(calculateTrendForCanonicalType(evidence, 'schedule.milestone-slip')).toBeNull();
  });

  it('excludes invalid, disabled, and failed-mapping evidence from trend', () => {
    const evidence = [
      datedEvidence('a', 'schedule.milestone-slip', 40, '2026-05-01'),
      datedEvidence('b', 'schedule.milestone-slip', 90, '2026-06-01', {
        validity: 'invalid',
        includedInScoring: false,
        exclusionReason: 'Signal group disabled',
      }),
      datedEvidence('c', 'schedule.milestone-slip', 10, '2026-06-01', {
        mapping: {
          status: 'failed',
          canonicalType: null,
          reason: 'Unrecognized mapping key',
          provenance: {
            representativeSourceLabel: 'Unknown',
            originalSourceTerm: 'test',
            canonicalSignalType: 'unknown',
            mappingStatus: 'failed',
          },
        },
        includedInScoring: false,
      }),
    ];
    expect(calculateTrendForCanonicalType(evidence, 'schedule.milestone-slip')).toBeNull();
  });

  it('returns null when qualifying canonical types disagree at dimension level', () => {
    const evidence = [
      datedEvidence('slip-early', 'schedule.milestone-slip', 40, '2026-05-01'),
      datedEvidence('slip-late', 'schedule.milestone-slip', 70, '2026-06-01'),
      datedEvidence('base-early', 'schedule.baseline-health', 80, '2026-05-01'),
      datedEvidence('base-late', 'schedule.baseline-health', 50, '2026-06-01'),
    ];
    expect(
      calculateDimensionTrend(evidence, ['schedule.milestone-slip', 'schedule.baseline-health']),
    ).toBeNull();
  });
});
