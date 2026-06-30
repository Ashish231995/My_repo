import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { render, unmount } from '@testing-library/react';
import { renderApp } from '../helpers/render-app';
import App from '../../src/app/App';
import { AppProviders } from '../../src/app/AppProviders';

describe('reset flow (AS-026, AS-027, AS-048, AS-049)', () => {
  it('resets immediately without confirmation when no evaluation exists', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('persona-option-expert'));
    expect(screen.getByTestId('persona-option-expert')).toBeChecked();

    await user.click(screen.getByTestId('reset-button'));
    expect(screen.queryByTestId('reset-confirm-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('persona-option-intermediate')).toBeChecked();
    expect(screen.getByTestId('results-placeholder')).toHaveTextContent(/select a sample project/i);
  });

  it('clears evaluated session and returns Intermediate default after confirm', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();

    await user.click(screen.getByTestId('persona-option-novice'));
    await user.click(screen.getByTestId('reset-button'));
    await user.click(screen.getByTestId('reset-confirm-button'));

    expect(screen.queryByTestId('reset-confirm-dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('health-dashboard')).not.toBeInTheDocument();
    expect(screen.getByTestId('persona-option-intermediate')).toBeChecked();
    expect(screen.getByTestId('results-placeholder')).toHaveTextContent(/select a sample project/i);
  });

  it('preserves complete session when reset is cancelled after evaluation', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));
    await user.click(screen.getByTestId('persona-option-expert'));

    const composite = screen.getByTestId('composite-health');
    expect(within(composite).getByText('51')).toBeInTheDocument();

    await user.click(screen.getByTestId('reset-button'));
    await user.click(screen.getByTestId('reset-cancel-button'));

    expect(screen.queryByTestId('reset-confirm-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('persona-option-expert')).toBeChecked();
    expect(within(composite).getByText('51')).toBeInTheDocument();
  });

  it('starts a fresh Intermediate session when the application remounts', () => {
    const view = render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    expect(screen.getByTestId('persona-option-intermediate')).toBeChecked();
    view.unmount();

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    expect(screen.getByTestId('persona-option-intermediate')).toBeChecked();
    expect(screen.getByTestId('results-placeholder')).toHaveTextContent(/select a sample project/i);
  });
});
