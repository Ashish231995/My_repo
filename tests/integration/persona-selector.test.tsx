import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../helpers/render-app';

describe('PersonaSelector (AS-044, AS-045)', () => {
  it('shows Intermediate as the active persona on initial session', () => {
    renderApp();
    expect(screen.getByRole('radio', { name: 'Intermediate' })).toBeChecked();
    expect(screen.getByTestId('persona-active-label')).toHaveTextContent('Active');
    expect(screen.getByTestId('persona-active-label')).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes exact Novice, Intermediate, and Expert radio accessible names', () => {
    renderApp();

    expect(screen.getByRole('radio', { name: 'Novice' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Intermediate' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Expert' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /active/i })).not.toBeInTheDocument();
  });

  it('allows Novice, Intermediate, and Expert selection before evaluation', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('persona-option-novice'));
    expect(screen.getByTestId('persona-option-novice')).toBeChecked();

    await user.click(screen.getByTestId('persona-option-expert'));
    expect(screen.getByTestId('persona-option-expert')).toBeChecked();

    await user.click(screen.getByTestId('persona-option-intermediate'));
    expect(screen.getByTestId('persona-option-intermediate')).toBeChecked();
    expect(screen.getByTestId('evaluate-button')).toBeDisabled();
  });

  it('allows persona changes after evaluation without blocking the journey', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();

    await user.click(screen.getByTestId('persona-option-novice'));
    expect(screen.getByTestId('persona-option-novice')).toBeChecked();
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('composite-health')).toBeInTheDocument();
  });

  it('supports keyboard selection in the persona radio group', async () => {
    const user = userEvent.setup();
    renderApp();

    const novice = screen.getByTestId('persona-option-novice');
    novice.focus();
    await user.keyboard(' ');
    expect(novice).toBeChecked();
  });
});
