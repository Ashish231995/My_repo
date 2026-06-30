import { describe, expect, it } from 'vitest';
import { SAMPLE_PROJECTS } from '../../src/data/fixtures';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { GOLDEN_C } from '../helpers/golden-contract';
import { buildEvaluationInput } from '../helpers/evaluation-input';

describe('golden Sample C — Incomplete Team (composite 86, REC-004-team)', () => {
  const project = SAMPLE_PROJECTS['sample-c'];

  it('has zero team signals (0% Team coverage)', () => {
    const teamGroupId = project.signalGroups.find((g) => g.dimensionAffinity.includes('team'))?.id;
    const teamSignals = project.sourceSignals.filter((s) => s.signalGroupId === teamGroupId);
    expect(teamSignals).toHaveLength(0);
  });

  it('evaluates to 3/4 Measured, composite 86 Healthy, REC-004-team', () => {
    const output = runEvaluation(buildEvaluationInput('sample-c'));

    expect(output.ok).toBe(true);
    if (output.ok) {
      const measured = output.result.dimensions.filter(
        (d) => d.measurementStatus === 'measured',
      );
      expect(measured).toHaveLength(GOLDEN_C.measuredDimensions);

      const team = output.result.dimensions.find((d) => d.dimensionId === 'team');
      expect(team?.measurementStatus).toBe(GOLDEN_C.teamStatus);

      expect(output.result.composite.displayComposite).toBe(GOLDEN_C.compositeDisplay);
      expect(output.result.composite.classification).toBe(GOLDEN_C.classification);
      expect(output.result.composite.coverageStatement).toMatch(/3 of 4/i);

      expect(output.result.recommendations.some((r) => r.id === GOLDEN_C.requiredRecommendationId)).toBe(
        true,
      );
    }
  });
});
