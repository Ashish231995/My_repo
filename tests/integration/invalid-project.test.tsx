import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../helpers/render-app';

describe('invalid project recovery (AS-028, AS-053, AS-054)', () => {
  it('shows Invalid sample data panel via adverse path with no fabricated health results', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('load-invalid-fixture'));

    const panel = screen.getByTestId('invalid-sample-data-panel');
    expect(panel).toBeInTheDocument();
    expect(within(panel).getByRole('heading', { name: /invalid sample data/i })).toBeInTheDocument();
    expect(within(panel).getByText(/missing identity/i)).toBeInTheDocument();
    expect(within(panel).getByText(/Sample Project Invalid/i)).toBeInTheDocument();
    expect(screen.getByTestId('evaluate-button')).toBeDisabled();
    expect(screen.queryByTestId('health-dashboard')).toBeNull();
    expect(screen.queryByTestId('composite-health')).toBeNull();
    expect(screen.queryByTestId(/^dimension-card-/)).toBeNull();
    expect(screen.queryByTestId(/^recommendation-REC-/)).toBeNull();
  });

  it('recovers via Select another sample project and evaluates Sample B (AS-053)', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('load-invalid-fixture'));
    expect(screen.getByTestId('invalid-sample-data-panel')).toBeInTheDocument();

    await user.click(screen.getByTestId('invalid-recovery-select-project'));
    await user.click(screen.getByTestId('project-option-sample-b'));
    expect(screen.queryByTestId('invalid-sample-data-panel')).toBeNull();

    await user.click(screen.getByTestId('evaluate-button'));
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
    expect(within(screen.getByTestId('composite-health')).getByText('51')).toBeInTheDocument();
  });

  it('recovers via Reset session to initial Intermediate state (AS-054)', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('load-invalid-fixture'));
    expect(screen.getByTestId('invalid-sample-data-panel')).toBeInTheDocument();

    await user.click(screen.getByTestId('invalid-recovery-reset-session'));
    expect(screen.queryByTestId('invalid-sample-data-panel')).toBeNull();
    expect(screen.getByTestId('project-select-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('persona-option-intermediate')).toBeChecked();
    expect(screen.getByTestId('evaluate-button')).toBeDisabled();
  });
});
