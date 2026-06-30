import { describe, expect, it } from 'vitest';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { projectForPersona } from '../../src/domain/persona/projectForPersona';
import { buildEvaluationInput } from '../helpers/evaluation-input';

describe('persona projection (AS-055, AS-056, FR-039)', () => {
  const evaluation = (() => {
    const output = runEvaluation(buildEvaluationInput('sample-b'));
    if (!output.ok) {
      throw new Error('expected sample-b evaluation');
    }
    return output.result;
  })();

  it('Novice includes expanded coaching elements and glossary', () => {
    const presentation = projectForPersona(evaluation, 'novice');
    const delivery = presentation.dimensions.find((dimension) => dimension.dimensionId === 'delivery');
    const recommendation = presentation.recommendations.find((item) => item.recommendationId === 'REC-001');

    expect(delivery?.conditionDefinition.length).toBeGreaterThan(40);
    expect(delivery?.whyThisMatters).toMatch(/leaders use/i);
    expect(delivery?.stepByStepGuidance).toMatch(/1\./);
    expect(delivery?.evidenceWalkthrough.length).toBeGreaterThan(20);
    expect(delivery?.glossary?.length).toBeGreaterThan(0);
    expect(delivery?.glossary?.some((entry) => entry.term === 'Canonical signal type')).toBe(true);
    expect(delivery?.sections.conditionDefinition.collapsedByDefault).toBe(false);
    expect(delivery?.sections.glossary?.collapsedByDefault).toBe(false);

    expect(recommendation?.whyThisMatters).toMatch(/this recommendation matters/i);
    expect(recommendation?.stepByStepActions).toMatch(/1\./);
    expect(recommendation?.glossary?.length).toBeGreaterThan(0);
    expect(recommendation?.whyThisMatters).toMatch(/does not add new urgency/i);
  });

  it('Intermediate includes concise rationale, evidence summary, and next steps', () => {
    const presentation = projectForPersona(evaluation, 'intermediate');
    const delivery = presentation.dimensions.find((dimension) => dimension.dimensionId === 'delivery');
    const recommendation = presentation.recommendations.find((item) => item.recommendationId === 'REC-002');

    expect(delivery?.whyThisMatters.length).toBeLessThan(
      projectForPersona(evaluation, 'novice').dimensions.find((dimension) => dimension.dimensionId === 'delivery')!
        .whyThisMatters.length,
    );
    expect(delivery?.evidenceSummary).toMatch(/•/);
    expect(delivery?.nextSteps).toMatch(/confirm ownership/i);
    expect(delivery?.stepByStepGuidance).toBeNull();
    expect(delivery?.glossary).toBeNull();

    expect(recommendation?.coachingRationale).toBeNull();
    expect(recommendation?.whyThisMatters).toBeNull();
    expect(recommendation?.evidenceSummary).toBeTruthy();
    expect(recommendation?.nextSteps).toMatch(/next step/i);
    expect(recommendation?.stepByStepActions).toBeNull();
  });

  it('Expert uses compact presentation with collapsed sections by default', () => {
    const presentation = projectForPersona(evaluation, 'expert');
    const delivery = presentation.dimensions.find((dimension) => dimension.dimensionId === 'delivery');
    const recommendation = presentation.recommendations.find((item) => item.recommendationId === 'REC-001');

    expect(delivery?.conditionDefinition.length).toBeLessThan(80);
    expect(delivery?.evidenceReferences).toBeTruthy();
    expect(delivery?.stepByStepGuidance).toBeNull();
    expect(delivery?.glossary).toBeNull();
    expect(delivery?.sections.whyThisMatters.collapsedByDefault).toBe(true);
    expect(delivery?.sections.evidenceWalkthrough.collapsedByDefault).toBe(true);

    expect(recommendation?.title).toBeTruthy();
    expect(recommendation?.findingsBullets?.length).toBeGreaterThan(0);
    expect(recommendation?.coachingRationale.length).toBeLessThanOrEqual(
      evaluation.recommendations.find((item) => item.id === 'REC-001')!.reason.length,
    );
    expect(recommendation?.sections.coachingRationale.collapsedByDefault).toBe(true);
    expect(recommendation?.sections.findingsBullets?.collapsedByDefault).toBe(true);
  });
});
