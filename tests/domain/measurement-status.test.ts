import { describe, expect, it } from 'vitest';
import type { DimensionResult } from '../../src/domain/model/evaluation';
import { calculateComposite } from '../../src/domain/scoring/calculateComposite';
import { calculateDimension } from '../../src/domain/scoring/calculateDimension';
import { DIMENSION_RULE_CATALOG } from '../../src/domain/scoring/ruleCatalogs';
import { makeScoringEvidence } from '../helpers/test-evidence';
import { REQUIRED_TYPES_BY_DIMENSION } from '../helpers/rule-catalog';

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

describe('measurement status — HD-02', () => {
  it('marks Measured when 100% required canonical types are present', () => {
    const evidence = REQUIRED_TYPES_BY_DIMENSION.schedule.map((type, index) =>
      makeScoringEvidence(`sig-${index}`, type, 90),
    );

    const result = calculateDimension(
      'schedule',
      evidence,
      { dimensionId: 'schedule', requiredTypes: [...REQUIRED_TYPES_BY_DIMENSION.schedule] },
      DIMENSION_RULE_CATALOG,
    );

    expect(result.measurementStatus).toBe('measured');
    expect(result.coveragePercent).toBe(100);
    expect(result.rawScore).not.toBeNull();
  });

  it('marks Partial with health-band classification (Provisional is presentation-only)', () => {
    // Single schedule.milestone-slip at health 65 → display 65 → At Risk band
    const evidence = [makeScoringEvidence('slip', 'schedule.milestone-slip', 65)];

    const result = calculateDimension(
      'schedule',
      evidence,
      { dimensionId: 'schedule', requiredTypes: [...REQUIRED_TYPES_BY_DIMENSION.schedule] },
      DIMENSION_RULE_CATALOG,
    );

    expect(result.measurementStatus).toBe('partial');
    expect(result.coveragePercent).toBe(50);
    expect(result.rawScore).toBe(65);
    expect(result.displayScore).toBe(65);
    expect(result.classification).toBe('at-risk');
    expect(result.classification).not.toMatch(/provisional/i);
  });

  it('excludes Partial dimensions from composite', () => {
    const partialSchedule: DimensionResult = {
      dimensionId: 'schedule',
      measurementStatus: 'partial',
      rawScore: 65,
      displayScore: 65,
      canonicalTypeHealth: { 'schedule.milestone-slip': 65 },
      classification: 'at-risk',
      coveragePercent: 50,
      missingRequiredCanonicalTypes: ['schedule.baseline-health'],
      missingSignalGroupIds: [],
      trend: null,
      findings: [],
      evidence: [],
      explanation: '',
    };

    const composite = calculateComposite([
      partialSchedule,
      measuredDimension('delivery', 90, 90),
      measuredDimension('team', 90, 90),
      measuredDimension('risk', 88, 88),
    ]);

    expect(composite.contributingDimensionIds).not.toContain('schedule');
    expect(composite.contributingDimensionIds).toEqual(['delivery', 'team', 'risk']);
  });

  it('marks Unmeasured when 0% required canonical types are present', () => {
    const result = calculateDimension(
      'team',
      [],
      { dimensionId: 'team', requiredTypes: [...REQUIRED_TYPES_BY_DIMENSION.team] },
      DIMENSION_RULE_CATALOG,
    );

    expect(result.measurementStatus).toBe('unmeasured');
    expect(result.coveragePercent).toBe(0);
    expect(result.rawScore).toBeNull();
    expect(result.displayScore).toBeNull();
  });

  it('Sample C team dimension is Unmeasured with no team signals', () => {
    const result = calculateDimension(
      'team',
      [],
      { dimensionId: 'team', requiredTypes: [...REQUIRED_TYPES_BY_DIMENSION.team] },
      DIMENSION_RULE_CATALOG,
    );

    expect(result.measurementStatus).toBe('unmeasured');
    expect(result.missingRequiredCanonicalTypes).toEqual([
      'team.engagement-score',
      'team.communication-cadence',
    ]);
  });
});
