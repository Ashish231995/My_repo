import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../helpers/render-app';

describe('project select guard (AS-002)', () => {
  it('disables evaluate until a valid bundled project is selected', async () => {
    const user = userEvent.setup();
    renderApp();

    const evaluateButton = screen.getByTestId('evaluate-button');
    expect(evaluateButton).toBeDisabled();
    expect(screen.getByTestId('project-select-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('results-placeholder')).toHaveTextContent(/select a sample project/i);
    expect(screen.queryByTestId('health-dashboard')).toBeNull();

    await user.click(screen.getByTestId('project-option-sample-a'));

    expect(evaluateButton).toBeEnabled();
    expect(screen.getByTestId('results-placeholder')).toHaveTextContent(/run evaluation/i);
    expect(screen.queryByTestId('health-dashboard')).toBeNull();
  });
});
