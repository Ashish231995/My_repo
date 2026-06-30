import { describe, expect, it } from 'vitest';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import type { EvidenceItem } from '../../src/domain/model/evaluation';
import { buildEvaluationInput } from '../helpers/evaluation-input';

function evidenceForSignal(
  evidenceIndex: Map<string, EvidenceItem>,
  signalId: string,
): EvidenceItem | undefined {
  return evidenceIndex.get(`evidence-${signalId}`);
}

describe('mapping equivalence (AS-060, HD-07)', () => {
  it('maps representative methodology terms to the same canonical type', () => {
    const output = runEvaluation(buildEvaluationInput('sample-a'));
    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    const agile = evidenceForSignal(output.result.evidenceIndex, 'sig-a-schedule-slip');
    const waterfall = evidenceForSignal(output.result.evidenceIndex, 'sig-a-schedule-slip-waterfall');

    expect(agile?.mapping.status).toBe('mapped');
    expect(waterfall?.mapping.status).toBe('mapped');
    expect(agile?.mapping.canonicalType).toBe('schedule.milestone-slip');
    expect(waterfall?.mapping.canonicalType).toBe('schedule.milestone-slip');
  });

  it('assigns identical health mapping to equivalent signals', () => {
    const output = runEvaluation(buildEvaluationInput('sample-a'));
    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    const agile = evidenceForSignal(output.result.evidenceIndex, 'sig-a-schedule-slip');
    const waterfall = evidenceForSignal(output.result.evidenceIndex, 'sig-a-schedule-slip-waterfall');

    expect(agile?.healthValue).toBe(waterfall?.healthValue);
    expect(agile?.healthValue).not.toBeNull();
  });

  it('HD-07: duplicate equivalent signals contribute once at canonical-type level', () => {
    const output = runEvaluation(buildEvaluationInput('sample-a'));
    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    const schedule = output.result.dimensions.find((dimension) => dimension.dimensionId === 'schedule');
    expect(schedule).toBeDefined();

    const slipEvidence = schedule!.evidence.filter(
      (item) =>
        item.mapping.canonicalType === 'schedule.milestone-slip' &&
        item.includedInScoring &&
        item.healthValue !== null &&
        item.healthValue !== undefined,
    );
    expect(slipEvidence.length).toBeGreaterThanOrEqual(2);

    const expectedMean =
      slipEvidence.reduce((sum, item) => sum + (item.healthValue as number), 0) / slipEvidence.length;
    expect(schedule!.canonicalTypeHealth['schedule.milestone-slip']).toBe(expectedMean);
    expect(output.result.composite.displayComposite).toBe(94);
  });
});
