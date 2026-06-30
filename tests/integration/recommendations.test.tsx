import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { projectForPersona } from '../../src/domain/persona/projectForPersona';
import { RecommendationsList } from '../../src/features/recommendations/RecommendationsList';
import { buildEvaluationInput } from '../helpers/evaluation-input';

describe('recommendations UI integration (AS-022, AS-023)', () => {
  it('renders Sample B recommendations with REC-002 before REC-001 and evidence refs', () => {
    const output = runEvaluation(buildEvaluationInput('sample-b'));
    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    render(
      <RecommendationsList
        recommendations={output.result.recommendations}
        presentation={projectForPersona(output.result, 'intermediate')}
        expandedCoachSections={new Set()}
        onToggleCoachSection={() => undefined}
      />,
    );

    const cards = screen.getAllByTestId(/^recommendation-REC-/);
    expect(cards.length).toBeGreaterThanOrEqual(2);
    expect(cards[0]).toHaveAttribute('data-testid', 'recommendation-REC-002');
    expect(cards[1]).toHaveAttribute('data-testid', 'recommendation-REC-001');

    const rec002 = screen.getByTestId('recommendation-REC-002');
    expect(within(rec002).getByText(/urgent/i)).toBeInTheDocument();
    expect(within(rec002).getByText(/Evidence:/i)).toBeInTheDocument();
    expect(within(rec002).getAllByTestId('recommendation-action-REC-002')).toHaveLength(1);
  });

  it('shows Intermediate coaching without repeating the analytical rationale', () => {
    const output = runEvaluation(buildEvaluationInput('sample-b'));
    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    const rec001 = output.result.recommendations.find((recommendation) => recommendation.id === 'REC-001')!;

    render(
      <RecommendationsList
        recommendations={output.result.recommendations}
        presentation={projectForPersona(output.result, 'intermediate')}
        expandedCoachSections={new Set()}
        onToggleCoachSection={() => undefined}
      />,
    );

    const card = screen.getByTestId('recommendation-REC-001');
    expect(within(card).getByTestId('recommendation-reason-REC-001')).toHaveTextContent(rec001.reason);
    expect(within(card).queryByTestId('coach-rationale-REC-001')).not.toBeInTheDocument();
    expect(within(card).queryByTestId('coach-why-REC-001')).not.toBeInTheDocument();
    expect(within(card).getByTestId('coach-next-REC-001')).toBeInTheDocument();
    expect(within(card).getByTestId('coach-evidence-REC-001')).toBeInTheDocument();
    expect(within(card).getAllByText(rec001.reason)).toHaveLength(1);
  });

  it('shows explicit no-recommendations state for Sample A (AS-023)', () => {
    const output = runEvaluation(buildEvaluationInput('sample-a'));
    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    render(
      <RecommendationsList
        recommendations={output.result.recommendations}
        presentation={projectForPersona(output.result, 'intermediate')}
        expandedCoachSections={new Set()}
        onToggleCoachSection={() => undefined}
      />,
    );

    expect(screen.getByTestId('recommendations-empty')).toHaveTextContent(
      /no recommendations/i,
    );
    expect(screen.queryByTestId(/^recommendation-/)).toBeNull();
  });
});
