import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DimensionResult } from '../../src/domain/model/evaluation';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { projectForPersona } from '../../src/domain/persona/projectForPersona';
import { DimensionCard } from '../../src/features/health-dashboard/DimensionCard';
import { StatusLabel } from '../../src/ui/StatusLabel/StatusLabel';
import { buildEvaluationInput } from '../helpers/evaluation-input';

describe('health labels — non-colour communication (AS-019)', () => {
  it('StatusLabel exposes text label and icon for each classification', () => {
    const classifications = ['healthy', 'at-risk', 'critical'] as const;

    for (const classification of classifications) {
      const { unmount } = render(<StatusLabel classification={classification} />);
      const label = screen.getByRole('status');
      expect(label).toHaveAccessibleName(
        classification === 'healthy'
          ? 'Healthy'
          : classification === 'at-risk'
            ? 'At Risk'
            : 'Critical',
      );
      expect(label.textContent).toMatch(/Healthy|At Risk|Critical/);
      unmount();
    }
  });

  it('DimensionCard surfaces measurement and classification text beyond colour alone', () => {
    const output = runEvaluation(buildEvaluationInput('sample-b'));
    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    const schedule = output.result.dimensions.find((dimension) => dimension.dimensionId === 'schedule');
    expect(schedule).toBeDefined();

    const partialDimension: DimensionResult = {
      ...schedule!,
      measurementStatus: 'partial',
      classification: 'at-risk',
      displayScore: 55,
      coveragePercent: 50,
      missingRequiredCanonicalTypes: ['schedule.baseline-health'],
      explanation: 'Partial schedule evidence',
    };

    render(
      <DimensionCard
        dimension={partialDimension}
        presentation={
          projectForPersona(output.result, 'intermediate').dimensions.find(
            (dimension) => dimension.dimensionId === 'schedule',
          )!
        }
        findings={[]}
        explainOpen={false}
        expandedCoachSections={new Set()}
        onToggleExplain={() => undefined}
        onToggleCoachSection={() => undefined}
      />,
    );

    expect(screen.getByRole('status', { name: /measurement status: partial/i })).toBeInTheDocument();
    expect(screen.getByText(/provisional — at risk/i)).toBeInTheDocument();
    expect(screen.getByText(/excluded from composite/i)).toBeInTheDocument();
  });
});
