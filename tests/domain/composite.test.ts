import { describe, expect, it } from 'vitest';
import type { DimensionResult } from '../../src/domain/model/evaluation';
import { calculateComposite } from '../../src/domain/scoring/calculateComposite';

function measuredDimension(
  dimensionId: DimensionResult['dimensionId'],
  rawScore: number,
  displayScore: number,
): DimensionResult {
  return {
    dimensionId,
    measurementStatus: 'measured',
    rawScore,
    displayScore,
    canonicalTypeHealth: {},
    classification: 'healthy',
    coveragePercent: 100,
    missingRequiredCanonicalTypes: [],
    missingSignalGroupIds: [],
    trend: null,
    findings: [],
    evidence: [],
    explanation: '',
  };
}

function partialDimension(dimensionId: DimensionResult['dimensionId']): DimensionResult {
  return {
    dimensionId,
    measurementStatus: 'partial',
    rawScore: 70,
    displayScore: 70,
    canonicalTypeHealth: {},
    classification: 'at-risk',
    coveragePercent: 50,
    missingRequiredCanonicalTypes: [],
    missingSignalGroupIds: [],
    trend: null,
    findings: [],
    evidence: [],
    explanation: '',
  };
}

function unmeasuredDimension(dimensionId: DimensionResult['dimensionId']): DimensionResult {
  return {
    dimensionId,
    measurementStatus: 'unmeasured',
    rawScore: null,
    displayScore: null,
    canonicalTypeHealth: {},
    classification: null,
    coveragePercent: 0,
    missingRequiredCanonicalTypes: [],
    missingSignalGroupIds: [],
    trend: null,
    findings: [],
    evidence: [],
    explanation: '',
  };
}

describe('calculateComposite — Demonstration Policy v1.0', () => {
  it('computes Sample A composite display 94 from four Measured dimensions', () => {
    const dimensions = [
      measuredDimension('schedule', 95, 95),
      measuredDimension('delivery', 93.3333333333, 93),
      measuredDimension('team', 89, 89),
      measuredDimension('risk', 100, 100),
    ];

    const composite = calculateComposite(dimensions);

    expect(composite.eligible).toBe(true);
    expect(composite.rawComposite).toBeCloseTo(94.3333333333, 8);
    expect(composite.displayComposite).toBe(94);
    expect(composite.classification).toBe('healthy');
    expect(composite.contributingDimensionIds).toHaveLength(4);
  });

  it('computes Sample B composite display 51 At Risk', () => {
    const dimensions = [
      { ...measuredDimension('schedule', 55, 55), classification: 'at-risk' as const },
      { ...measuredDimension('delivery', 31.6666666667, 32), classification: 'critical' as const },
      { ...measuredDimension('team', 67.5, 68), classification: 'at-risk' as const },
      { ...measuredDimension('risk', 50, 50), classification: 'at-risk' as const },
    ];

    const composite = calculateComposite(dimensions);

    expect(composite.displayComposite).toBe(51);
    expect(composite.classification).toBe('at-risk');
  });

  it('computes Sample C composite 86 from three Measured dimensions (Team excluded)', () => {
    const dimensions = [
      measuredDimension('schedule', 82.5, 83),
      measuredDimension('delivery', 88.3333333333, 88),
      unmeasuredDimension('team'),
      measuredDimension('risk', 87.5, 88),
    ];

    const composite = calculateComposite(dimensions);

    expect(composite.eligible).toBe(true);
    expect(composite.rawComposite).toBeCloseTo(86.1111111111, 8);
    expect(composite.displayComposite).toBe(86);
    expect(composite.coverageStatement).toMatch(/3 of 4/i);
    expect(composite.contributingDimensionIds).not.toContain('team');
  });

  it('returns insufficient coverage when fewer than two Measured dimensions', () => {
    const composite = calculateComposite([
      measuredDimension('schedule', 82.5, 83),
      unmeasuredDimension('delivery'),
      unmeasuredDimension('team'),
      unmeasuredDimension('risk'),
    ]);

    expect(composite.eligible).toBe(false);
    expect(composite.displayComposite).toBeNull();
    expect(composite.insufficientCoverage).not.toBeNull();
  });

  it('excludes Partial dimensions from composite (re-normalized equal weights)', () => {
    const composite = calculateComposite([
      measuredDimension('schedule', 80, 80),
      partialDimension('delivery'),
      measuredDimension('team', 90, 90),
      measuredDimension('risk', 88, 88),
    ]);

    expect(composite.contributingDimensionIds).toEqual(['schedule', 'team', 'risk']);
    expect(composite.rawComposite).toBeCloseTo(86, 8);
  });
});
