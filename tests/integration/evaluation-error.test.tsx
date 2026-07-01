import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import * as runEvaluationModule from '../../src/domain/evaluation/runEvaluation';
import { buildEvaluationInput } from '../helpers/evaluation-input';
import { renderApp } from '../helpers/render-app';

describe('evaluation error recovery (AS-029)', () => {
  it('shows ErrorPanel with retry and safe reset when evaluation fails', async () => {
    const user = userEvent.setup();
    const successOutput = runEvaluation(buildEvaluationInput('sample-a'));
    const spy = vi
      .spyOn(runEvaluationModule, 'runEvaluation')
      .mockReturnValueOnce({
        ok: false,
        error: { message: 'Health evaluation could not complete for this session.' },
      })
      .mockReturnValueOnce(successOutput);

    renderApp();

    await user.click(screen.getByTestId('project-option-sample-a'));
    await user.click(screen.getByTestId('evaluate-button'));

    const panel = screen.getByTestId('error-panel');
    expect(panel).toBeInTheDocument();
    expect(screen.getByText(/could not complete/i)).toBeInTheDocument();
    expect(screen.queryByTestId('health-dashboard')).toBeNull();
    expect(screen.queryByTestId('composite-health')).toBeNull();

    await user.click(screen.getByTestId('error-retry-button'));
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();

    spy.mockRestore();
  });

  it('returns to safe session via reset from ErrorPanel', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(runEvaluationModule, 'runEvaluation').mockReturnValue({
      ok: false,
      error: { message: 'Unexpected evaluation failure.' },
    });

    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));
    expect(screen.getByTestId('error-panel')).toBeInTheDocument();

    await user.click(screen.getByTestId('error-reset-button'));
    expect(screen.queryByTestId('error-panel')).toBeNull();
    expect(screen.getByTestId('project-select-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('persona-option-intermediate')).toBeChecked();

    spy.mockRestore();
  });
});
