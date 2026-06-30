import { describe, expect, it } from 'vitest';
import { SAMPLE_PROJECTS } from '../../src/data/fixtures';
import { compareSnapshotDates } from '../../src/domain/utils/compareSnapshotDates';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { orderRecommendations } from '../../src/domain/recommendations/orderRecommendations';
import { GOLDEN_B } from '../helpers/golden-contract';
import { buildEvaluationInput } from '../helpers/evaluation-input';

describe('golden Sample B — At Risk (composite 51, REC-002 before REC-001)', () => {
  const project = SAMPLE_PROJECTS['sample-b'];
  const slipSignal = project.sourceSignals.find((s) => s.id === 'sig-b-schedule-slip');

  it('bundles HD-08 snapshot and milestone dates', () => {
    expect(project.snapshot.asOfDate).toBe(GOLDEN_B.snapshotAsOfDate);
    expect(slipSignal?.payload.slipDays).toBe(GOLDEN_B.slipDays);
    expect(slipSignal?.payload.milestoneDueDate).toBe(GOLDEN_B.milestoneDueDate);
    expect(
      compareSnapshotDates(GOLDEN_B.snapshotAsOfDate, GOLDEN_B.milestoneDueDate),
    ).toBe(10);
  });

  it('includes urgent blocker for FND-001 / REC-001', () => {
    const blocker = project.sourceSignals.find((s) => s.id === 'sig-b-delivery-blocker');
    expect(blocker?.payload.blockerState).toBe('urgent');
  });

  it('evaluates to composite 51 At Risk with mandatory recommendations ordered HD-08', () => {
    const output = runEvaluation(buildEvaluationInput('sample-b'));

    expect(output.ok).toBe(true);
    if (output.ok) {
      expect(output.result.composite.displayComposite).toBe(GOLDEN_B.compositeDisplay);
      expect(output.result.composite.classification).toBe(GOLDEN_B.classification);

      const ordered = orderRecommendations(output.result.recommendations);
      expect(ordered.map((r) => r.id)).toEqual([...GOLDEN_B.recommendationIds]);
    }
  });
});
