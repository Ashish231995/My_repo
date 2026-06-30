import { describe, expect, it } from 'vitest';
import { calculateDimension } from '../../src/domain/scoring/calculateDimension';
import { DIMENSION_RULE_CATALOG } from '../../src/domain/scoring/ruleCatalogs';
import { makeScoringEvidence } from '../helpers/test-evidence';
import { REQUIRED_TYPES_BY_DIMENSION } from '../helpers/rule-catalog';

describe('dimension scoring — HD-01 equal mean', () => {
  it('computes Sample A schedule raw 95 and display 95', () => {
    const evidence = [
      makeScoringEvidence('slip', 'schedule.milestone-slip', 100),
      makeScoringEvidence('baseline', 'schedule.baseline-health', 90),
    ];

    const result = calculateDimension(
      'schedule',
      evidence,
      { dimensionId: 'schedule', requiredTypes: [...REQUIRED_TYPES_BY_DIMENSION.schedule] },
      DIMENSION_RULE_CATALOG,
    );

    expect(result.rawScore).toBeCloseTo(95, 10);
    expect(result.displayScore).toBe(95);
    expect(result.classification).toBe('healthy');
  });

  it('computes Sample A delivery raw 93.33… and display 93', () => {
    const evidence = [
      makeScoringEvidence('blocker', 'delivery.blocker-open', 100),
      makeScoringEvidence('scope', 'delivery.scope-stability', 95),
      makeScoringEvidence('velocity', 'delivery.velocity-trend', 85),
    ];

    const result = calculateDimension(
      'delivery',
      evidence,
      { dimensionId: 'delivery', requiredTypes: [...REQUIRED_TYPES_BY_DIMENSION.delivery] },
      DIMENSION_RULE_CATALOG,
    );

    expect(result.rawScore).toBeCloseTo(93.3333333333, 8);
    expect(result.displayScore).toBe(93);
  });

  it('computes Sample B delivery raw 31.67… and display 32 (Critical)', () => {
    const evidence = [
      makeScoringEvidence('blocker', 'delivery.blocker-open', 20),
      makeScoringEvidence('scope', 'delivery.scope-stability', 35),
      makeScoringEvidence('velocity', 'delivery.velocity-trend', 40),
    ];

    const result = calculateDimension(
      'delivery',
      evidence,
      { dimensionId: 'delivery', requiredTypes: [...REQUIRED_TYPES_BY_DIMENSION.delivery] },
      DIMENSION_RULE_CATALOG,
    );

    expect(result.rawScore).toBeCloseTo(31.6666666667, 8);
    expect(result.displayScore).toBe(32);
    expect(result.classification).toBe('critical');
  });

  it('stores full-precision canonicalTypeHealth per HD-07', () => {
    const evidence = [
      makeScoringEvidence('slip', 'schedule.milestone-slip', 100),
      makeScoringEvidence('baseline', 'schedule.baseline-health', 90),
    ];

    const result = calculateDimension(
      'schedule',
      evidence,
      { dimensionId: 'schedule', requiredTypes: [...REQUIRED_TYPES_BY_DIMENSION.schedule] },
      DIMENSION_RULE_CATALOG,
    );

    expect(result.canonicalTypeHealth['schedule.milestone-slip']).toBe(100);
    expect(result.canonicalTypeHealth['schedule.baseline-health']).toBe(90);
  });
});
