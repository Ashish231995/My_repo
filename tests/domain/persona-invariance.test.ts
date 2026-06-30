import { describe, expect, it } from 'vitest';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { projectForPersona } from '../../src/domain/persona/projectForPersona';
import { buildEvaluationInput } from '../helpers/evaluation-input';

describe('persona analytical invariance (AS-020, AS-058, SC-003)', () => {
  const output = runEvaluation(buildEvaluationInput('sample-b'));
  if (!output.ok) {
    throw new Error('expected sample-b evaluation');
  }
  const evaluation = output.result;
  const evaluationBefore = structuredClone({
    composite: evaluation.composite,
    dimensions: evaluation.dimensions,
    findings: evaluation.findings,
    recommendations: evaluation.recommendations,
    evidenceIds: [...evaluation.evidenceIndex.keys()],
  });

  const personas = ['novice', 'intermediate', 'expert'] as const;
  const presentations = personas.map((persona) => projectForPersona(evaluation, persona));

  it('does not mutate EvaluationResult', () => {
    expect(evaluation.composite).toEqual(evaluationBefore.composite);
    expect(evaluation.dimensions).toEqual(evaluationBefore.dimensions);
    expect(evaluation.findings).toEqual(evaluationBefore.findings);
    expect(evaluation.recommendations).toEqual(evaluationBefore.recommendations);
    expect([...evaluation.evidenceIndex.keys()]).toEqual(evaluationBefore.evidenceIds);
  });

  it('keeps scores, classifications, coverage, findings and evidence IDs identical across personas', () => {
    expect(presentations).toHaveLength(3);
    expect(evaluation.composite.displayComposite).toBe(51);
    expect(evaluation.composite.classification).toBe('at-risk');

    for (const dimension of evaluation.dimensions) {
      for (const persona of personas) {
        void projectForPersona(evaluation, persona);
        const unchanged = evaluation.dimensions.find((item) => item.dimensionId === dimension.dimensionId)!;
        expect(unchanged.displayScore).toBe(dimension.displayScore);
        expect(unchanged.classification).toBe(dimension.classification);
        expect(unchanged.coveragePercent).toBe(dimension.coveragePercent);
      }
    }

    expect(evaluation.findings.map((finding) => finding.id)).toEqual(
      evaluationBefore.findings.map((finding) => finding.id),
    );
    expect([...evaluation.evidenceIndex.keys()].sort()).toEqual(
      evaluationBefore.evidenceIds.sort(),
    );
  });

  it('keeps recommendation IDs, content, priority and ordering identical across personas', () => {
    const recommendationViews = personas.map(() =>
      evaluation.recommendations.map((recommendation) => ({
        id: recommendation.id,
        action: recommendation.action,
        reason: recommendation.reason,
        priority: recommendation.priority,
        evidenceIds: recommendation.evidenceIds,
      })),
    );

    expect(recommendationViews[0]).toEqual(recommendationViews[1]);
    expect(recommendationViews[1]).toEqual(recommendationViews[2]);
    expect(evaluation.recommendations[0]?.id).toBe('REC-002');
    expect(evaluation.recommendations[1]?.id).toBe('REC-001');
  });

  it('changes presentation subtrees only', () => {
    const novice = projectForPersona(evaluation, 'novice');
    const expert = projectForPersona(evaluation, 'expert');

    expect(novice.dimensions[0]?.whyThisMatters).not.toBe(expert.dimensions[0]?.whyThisMatters);
    expect(novice.recommendations[0]?.coachingRationale).not.toBe(
      expert.recommendations[0]?.coachingRationale,
    );
  });
});
