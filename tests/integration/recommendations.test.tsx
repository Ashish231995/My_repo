import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { RecommendationsList } from '../../src/features/recommendations/RecommendationsList';
import { buildEvaluationInput } from '../helpers/evaluation-input';

describe('recommendations UI integration (AS-022, AS-023)', () => {
  it('renders Sample B recommendations with REC-002 before REC-001 and evidence refs', () => {
    const output = runEvaluation(buildEvaluationInput('sample-b'));
    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    render(<RecommendationsList recommendations={output.result.recommendations} />);

    const cards = screen.getAllByTestId(/^recommendation-/);
    expect(cards.length).toBeGreaterThanOrEqual(2);
    expect(cards[0]).toHaveAttribute('data-testid', 'recommendation-REC-002');
    expect(cards[1]).toHaveAttribute('data-testid', 'recommendation-REC-001');

    const rec002 = screen.getByTestId('recommendation-REC-002');
    expect(within(rec002).getByText(/urgent/i)).toBeInTheDocument();
    expect(within(rec002).getByText(/Evidence:/i)).toBeInTheDocument();
  });

  it('shows explicit no-recommendations state for Sample A (AS-023)', () => {
    const output = runEvaluation(buildEvaluationInput('sample-a'));
    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    render(<RecommendationsList recommendations={output.result.recommendations} />);

    expect(screen.getByTestId('recommendations-empty')).toHaveTextContent(
      /no recommendations/i,
    );
    expect(screen.queryByTestId(/^recommendation-/)).toBeNull();
  });
});
