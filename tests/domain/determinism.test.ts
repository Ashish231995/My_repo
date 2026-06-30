import { describe, expect, it } from 'vitest';
import { buildEvaluationInput } from '../helpers/evaluation-input';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';

describe('runEvaluation determinism — SC-002, AS-021', () => {
  function evaluateSampleB() {
    return runEvaluation(buildEvaluationInput('sample-b'));
  }

  it('returns deep-equal results for identical inputs', () => {
    const first = evaluateSampleB();
    const second = evaluateSampleB();

    expect(first).toEqual(second);
  });

  it('uses bundled snapshot.asOfDate — never runtime clock', () => {
    const result = evaluateSampleB();
    if (result.ok) {
      expect(result.result.snapshot.asOfDate).toBe('2026-06-01');
      expect(result.result.evaluatedAtSnapshotDate).toBe('2026-06-01');
    }
  });
});
