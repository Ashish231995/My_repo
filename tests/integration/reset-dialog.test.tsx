import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../helpers/render-app';

describe('reset confirmation dialog (AS-046, AS-047)', () => {
  it('opens an accessible dialog explaining what will be cleared', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));
    await user.click(screen.getByTestId('reset-button'));

    const dialog = screen.getByTestId('reset-confirm-dialog');
    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(within(dialog).getByText(/project selection/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/signal configuration/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/findings/i)).toBeInTheDocument();
    expect(within(dialog).getByTestId('reset-cancel-button')).toBeInTheDocument();
    expect(within(dialog).getByTestId('reset-confirm-button')).toHaveTextContent(/reset session/i);
  });

  it('focuses Cancel first and restores focus to the reset control on cancel', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));

    const resetButton = screen.getByTestId('reset-button');
    resetButton.focus();
    await user.click(resetButton);

    const cancelButton = screen.getByTestId('reset-cancel-button');
    expect(cancelButton).toHaveFocus();

    await user.click(cancelButton);
    expect(screen.queryByTestId('reset-confirm-dialog')).not.toBeInTheDocument();
    expect(resetButton).toHaveFocus();
  });

  it('closes on Escape without clearing the evaluated session', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));
    await user.click(screen.getByTestId('reset-button'));

    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('reset-confirm-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
  });
});
