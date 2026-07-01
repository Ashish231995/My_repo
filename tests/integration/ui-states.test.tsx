import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import * as runEvaluationModule from '../../src/domain/evaluation/runEvaluation';
import { renderApp } from '../helpers/render-app';

describe('explicit UI states (FR-029)', () => {
  it('covers initial, checklist, measured/partial/unmeasured, insufficient composite, invalid, error, and reset confirmation', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByTestId('persona-option-intermediate')).toBeChecked();
    expect(screen.getByTestId('project-select-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('evaluate-button')).toBeDisabled();

    await user.click(screen.getByTestId('project-option-sample-c'));
    expect(screen.getByTestId('integration-checklist')).toBeInTheDocument();
    expect(screen.getByTestId('evaluate-button')).toBeEnabled();

    await user.click(screen.getByTestId('evaluate-button'));
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /measurement status: unmeasured/i })).toBeInTheDocument();
    expect(within(screen.getByTestId('composite-health')).getByText('86')).toBeInTheDocument();

    await user.click(screen.getByTestId('project-option-sample-b'));
    const deliveryRow = screen.getByTestId('checklist-group-grp-delivery');
    await user.click(within(deliveryRow).getByRole('checkbox'));
    expect(screen.getByTestId('checklist-incomplete-warning')).toBeInTheDocument();

    for (const groupId of ['grp-team', 'grp-risk', 'grp-schedule']) {
      const row = screen.getByTestId(`checklist-group-${groupId}`);
      const checkbox = within(row).getByRole('checkbox');
      if (checkbox.checked) {
        await user.click(checkbox);
      }
    }
    await user.click(screen.getByTestId('evaluate-button'));
    expect(
      within(screen.getByTestId('composite-health')).getByText(/insufficient composite coverage/i),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId('load-invalid-fixture'));
    expect(screen.getByTestId('invalid-sample-data-panel')).toBeInTheDocument();

    await user.click(screen.getByTestId('invalid-recovery-reset-session'));
    await user.click(screen.getByTestId('project-option-sample-a'));
    await user.click(screen.getByTestId('evaluate-button'));
    expect(within(screen.getByTestId('composite-health')).getByText('94')).toBeInTheDocument();
    expect(screen.getByTestId('recommendations-empty')).toBeInTheDocument();

    const errorSpy = vi.spyOn(runEvaluationModule, 'runEvaluation').mockReturnValueOnce({
      ok: false,
      error: { message: 'Evaluation failed for UI state coverage.' },
    });
    await user.click(screen.getByTestId('evaluate-button'));
    expect(screen.getByTestId('error-panel')).toBeInTheDocument();
    errorSpy.mockRestore();

    await user.click(screen.getByTestId('error-reset-button'));
    await user.click(screen.getByTestId('project-option-sample-a'));
    await user.click(screen.getByTestId('evaluate-button'));
    await user.click(screen.getByTestId('reset-button'));
    expect(screen.getByTestId('reset-confirm-dialog')).toBeInTheDocument();
  });
});
