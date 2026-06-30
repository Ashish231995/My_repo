import { describe, expect, it } from 'vitest';
import { SAMPLE_PROJECTS } from '../../src/data/fixtures';
import { GOLDEN_A } from '../helpers/golden-contract';
import { buildEvaluationInput } from '../helpers/evaluation-input';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';

describe('golden Sample A — Healthy (composite 94)', () => {
  it('loads fixture from SAMPLE_PROJECTS', () => {
    expect(SAMPLE_PROJECTS['sample-a']).toBeDefined();
    expect(SAMPLE_PROJECTS['sample-a'].scenario).toBe('healthy');
  });

  it('evaluates to composite 94 Healthy with no recommendations', () => {
    const output = runEvaluation(buildEvaluationInput('sample-a'));

    expect(output.ok).toBe(true);
    if (output.ok) {
      expect(output.result.composite.displayComposite).toBe(GOLDEN_A.compositeDisplay);
      expect(output.result.composite.classification).toBe(GOLDEN_A.classification);
      expect(output.result.recommendations).toHaveLength(GOLDEN_A.recommendationCount);
    }
  });
});
