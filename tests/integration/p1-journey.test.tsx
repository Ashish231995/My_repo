import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../helpers/render-app';

describe('P1 leadership journey (AS-001, SC-001)', () => {
  it('selects Sample B, evaluates, and shows composite, four dimensions, and recommendations', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByTestId('evaluate-button')).toBeDisabled();
    expect(screen.getByText(/local session only/i)).toBeInTheDocument();

    await user.click(screen.getByTestId('project-option-sample-b'));
    expect(screen.getByTestId('evaluate-button')).toBeEnabled();

    await user.click(screen.getByTestId('evaluate-button'));

    const composite = screen.getByTestId('composite-health');
    expect(within(composite).getByText('51')).toBeInTheDocument();
    expect(within(composite).getByRole('status', { name: /at risk/i })).toBeInTheDocument();

    const dimensionGrid = screen.getByTestId('dimension-grid');
    expect(within(dimensionGrid).getByTestId('dimension-card-schedule')).toBeInTheDocument();
    expect(within(dimensionGrid).getByTestId('dimension-card-delivery')).toBeInTheDocument();
    expect(within(dimensionGrid).getByTestId('dimension-card-team')).toBeInTheDocument();
    expect(within(dimensionGrid).getByTestId('dimension-card-risk')).toBeInTheDocument();

    const recommendations = screen.getAllByTestId(/^recommendation-REC-/);
    expect(recommendations.length).toBeGreaterThanOrEqual(2);
    expect(recommendations[0]).toHaveAttribute('data-testid', 'recommendation-REC-002');
    expect(recommendations[1]).toHaveAttribute('data-testid', 'recommendation-REC-001');
  });
});
