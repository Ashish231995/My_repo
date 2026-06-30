import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DimensionResult } from '../../src/domain/model/evaluation';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { projectForPersona } from '../../src/domain/persona/projectForPersona';
import { CompositeHealthCard } from '../../src/features/health-dashboard/CompositeHealthCard';
import { DimensionCard } from '../../src/features/health-dashboard/DimensionCard';
import { HealthDashboard } from '../../src/features/health-dashboard/HealthDashboard';
import { SAMPLE_PROJECTS } from '../../src/data/fixtures';
import { buildEvaluationInput } from '../helpers/evaluation-input';
import { renderWithProviders } from '../helpers/render-app';

function partialScheduleDimension(): DimensionResult {
  return {
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
    explanation: 'Schedule dimension evaluated from 1 of 2 required canonical types',
  };
}

describe('health dashboard measurement states (AS-008–AS-012)', () => {
  it('shows Unmeasured dimension without a numeric score when delivery group is disabled', () => {
    const input = buildEvaluationInput('sample-b');
    const deliveryGroup = SAMPLE_PROJECTS['sample-b'].signalGroups.find((group) =>
      group.dimensionAffinity.includes('delivery'),
    )!;
    const output = runEvaluation({
      ...input,
      enabledSignalGroupIds: new Set(
        [...input.enabledSignalGroupIds].filter((groupId) => groupId !== deliveryGroup.id),
      ),
    });

    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    renderWithProviders(
      <HealthDashboard
        evaluation={output.result}
        presentation={projectForPersona(output.result, 'intermediate')}
        expandedDimensionIds={new Set()}
        expandedCoachSections={new Set()}
        onToggleDimensionExplain={() => undefined}
        onToggleCoachSection={() => undefined}
      />,
    );

    const deliveryCard = screen.getByTestId('dimension-card-delivery');
    expect(
      within(deliveryCard).getByRole('status', { name: /measurement status: unmeasured/i }),
    ).toBeInTheDocument();
    expect(within(deliveryCard).getByText(/no numeric score/i)).toBeInTheDocument();
    expect(within(deliveryCard).queryByLabelText(/dimension score/i)).toBeNull();
    expect(within(deliveryCard).queryByText(/^0$/)).toBeNull();
  });

  it('shows Partial dimension provisional score, coverage, missing evidence, and excluded-from-composite label', () => {
    const dimension = partialScheduleDimension();
    const presentation = projectForPersona(
      {
        projectId: 'sample-b',
        snapshot: { asOfDate: '2026-06-01', label: 'test' },
        evaluatedAtSnapshotDate: '2026-06-01',
        dimensions: [dimension],
        composite: {
          eligible: true,
          rawComposite: 65,
          displayComposite: 65,
          classification: 'at-risk',
          contributingDimensionIds: [],
          coverageStatement: 'test',
          insufficientCoverage: null,
        },
        findings: [],
        recommendations: [],
        evidenceIndex: new Map(),
      },
      'intermediate',
    ).dimensions[0]!;

    render(
      <DimensionCard
        dimension={dimension}
        presentation={presentation}
        findings={[]}
        explainOpen={false}
        expandedCoachSections={new Set()}
        onToggleExplain={() => undefined}
        onToggleCoachSection={() => undefined}
      />,
    );

    const card = screen.getByTestId('dimension-card-schedule');
    expect(within(card).getByText(/provisional score — partial evidence/i)).toBeInTheDocument();
    expect(within(card).getByText('65')).toBeInTheDocument();
    expect(within(card).getByText(/50% evidence coverage/)).toBeInTheDocument();
    expect(within(card).getByText(/schedule\.baseline-health/)).toBeInTheDocument();
    expect(within(card).getByText(/excluded from composite/i)).toBeInTheDocument();
    expect(within(card).getByText(/provisional — at risk/i)).toBeInTheDocument();
  });

  it('uses only Measured dimensions in composite and reports based-on coverage', () => {
    const input = buildEvaluationInput('sample-b');
    const deliveryGroup = SAMPLE_PROJECTS['sample-b'].signalGroups.find((group) =>
      group.dimensionAffinity.includes('delivery'),
    )!;
    const output = runEvaluation({
      ...input,
      enabledSignalGroupIds: new Set(
        [...input.enabledSignalGroupIds].filter((groupId) => groupId !== deliveryGroup.id),
      ),
    });

    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    renderWithProviders(<CompositeHealthCard composite={output.result.composite} />);

    expect(screen.getByText(/based on 3 of 4 measured dimensions/i)).toBeInTheDocument();
    expect(output.result.composite.contributingDimensionIds).not.toContain('delivery');
    expect(output.result.composite.displayComposite).not.toBeNull();
  });

  it('shows insufficient composite coverage when fewer than two Measured dimensions remain', () => {
    const input = buildEvaluationInput('sample-b');
    const enabled = new Set(['grp-schedule']);
    const output = runEvaluation({ ...input, enabledSignalGroupIds: enabled });

    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    renderWithProviders(<CompositeHealthCard composite={output.result.composite} />);

    expect(screen.getByText(/insufficient composite coverage/i)).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: /healthy|at risk|critical/i })).toBeNull();
    expect(output.result.composite.displayComposite).toBeNull();
    expect(output.result.composite.classification).toBeNull();
  });
});
