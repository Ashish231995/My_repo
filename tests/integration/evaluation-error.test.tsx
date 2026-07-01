import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildEvaluationInput } from '../helpers/evaluation-input';
import { renderApp } from '../helpers/render-app';

vi.mock('../../src/domain/evaluation/runEvaluation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/domain/evaluation/runEvaluation')>();
  return {
    ...actual,
    runEvaluation: vi.fn(actual.runEvaluation),
  };
});

import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';

const mockedRunEvaluation = vi.mocked(runEvaluation);

describe('evaluation error recovery (AS-029)', () => {
  beforeEach(async () => {
    const { runEvaluation: realRun } = await vi.importActual<
      typeof import('../../src/domain/evaluation/runEvaluation')
    >('../../src/domain/evaluation/runEvaluation');
    mockedRunEvaluation.mockImplementation(realRun);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows ErrorPanel with retry and safe reset when evaluation fails', async () => {
    const user = userEvent.setup();
    const { runEvaluation: realRun } = await vi.importActual<
      typeof import('../../src/domain/evaluation/runEvaluation')
    >('../../src/domain/evaluation/runEvaluation');
    const successOutput = realRun(buildEvaluationInput('sample-a'));
    mockedRunEvaluation
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
    expect(within(panel).getByText(/health evaluation could not complete/i)).toBeInTheDocument();
    expect(screen.queryByTestId('health-dashboard')).toBeNull();
    expect(screen.queryByTestId('composite-health')).toBeNull();

    await user.click(screen.getByTestId('error-retry-button'));
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
  });

  it('returns to safe session via reset from ErrorPanel', async () => {
    const user = userEvent.setup();
    mockedRunEvaluation.mockReturnValue({
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
  });
});
