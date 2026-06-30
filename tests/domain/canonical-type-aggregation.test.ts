import { describe, expect, it } from 'vitest';
import { aggregateCanonicalTypeHealth } from '../../src/domain/scoring/aggregateCanonicalTypeHealth';
import { makeScoringEvidence } from '../helpers/test-evidence';
import { REQUIRED_TYPES_BY_DIMENSION } from '../helpers/rule-catalog';

describe('aggregateCanonicalTypeHealth — HD-07', () => {
  it('means duplicate valid signals within the same canonical type (full precision)', () => {
    const evidence = [
      makeScoringEvidence('a1', 'schedule.baseline-health', 80),
      makeScoringEvidence('a2', 'schedule.baseline-health', 90),
    ];

    const result = aggregateCanonicalTypeHealth(
      evidence,
      REQUIRED_TYPES_BY_DIMENSION.schedule,
    );

    expect(result.get('schedule.baseline-health')).toBeCloseTo(85, 10);
  });

  it('contributes each canonical type exactly once to the dimension mean input', () => {
    const evidence = [
      makeScoringEvidence('s1', 'schedule.milestone-slip', 100),
      makeScoringEvidence('s2', 'schedule.milestone-slip', 100),
      makeScoringEvidence('b1', 'schedule.baseline-health', 90),
    ];

    const typeHealth = aggregateCanonicalTypeHealth(
      evidence,
      REQUIRED_TYPES_BY_DIMENSION.schedule,
    );

    expect(typeHealth.size).toBe(2);
    expect(typeHealth.get('schedule.milestone-slip')).toBe(100);
    expect(typeHealth.get('schedule.baseline-health')).toBe(90);

    const dimensionRaw =
      ((typeHealth.get('schedule.milestone-slip') ?? 0) +
        (typeHealth.get('schedule.baseline-health') ?? 0)) /
      2;
    expect(dimensionRaw).toBe(95);
  });

  it('excludes invalid or disabled evidence from aggregation', () => {
    const evidence = [
      makeScoringEvidence('valid', 'delivery.blocker-open', 100),
      makeScoringEvidence('invalid', 'delivery.blocker-open', 20, false),
    ];

    const result = aggregateCanonicalTypeHealth(
      evidence,
      REQUIRED_TYPES_BY_DIMENSION.delivery,
    );

    expect(result.get('delivery.blocker-open')).toBe(100);
  });

  it('omits missing required types from the result map', () => {
    const evidence = [makeScoringEvidence('only-slip', 'schedule.milestone-slip', 85)];

    const result = aggregateCanonicalTypeHealth(
      evidence,
      REQUIRED_TYPES_BY_DIMENSION.schedule,
    );

    expect(result.has('schedule.milestone-slip')).toBe(true);
    expect(result.has('schedule.baseline-health')).toBe(false);
  });
});
