import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../helpers/render-app';
import { tabToTestId } from '../helpers/tab-to-test-id';

describe('keyboard navigation — primary flows (AS-030)', () => {
  it('completes P1 journey using keyboard only', async () => {
    const user = userEvent.setup();
    renderApp();

    await tabToTestId(user, 'project-option-sample-a');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('project-option-sample-b')).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByTestId('evaluate-button')).toBeEnabled();

    await tabToTestId(user, 'evaluate-button');
    await user.keyboard('{Enter}');

    const composite = screen.getByTestId('composite-health');
    expect(within(composite).getByText('51')).toBeInTheDocument();

    const explainSchedule = await tabToTestId(user, 'explain-dimension-schedule');
    await user.keyboard('{Enter}');
    expect(document.getElementById('dimension-detail-schedule')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(document.getElementById('dimension-detail-schedule')).toBeNull();
    expect(explainSchedule).toHaveFocus();

    await tabToTestId(user, 'reset-button', { shift: true });
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('reset-confirm-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('reset-cancel-button')).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(screen.queryByTestId('reset-confirm-dialog')).toBeNull();
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
  });

  it('moves across persona and project radios via Tab and Arrow keys only', async () => {
    const user = userEvent.setup();
    renderApp();

    await tabToTestId(user, 'persona-option-intermediate');
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('persona-option-novice')).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByTestId('persona-option-novice')).toBeChecked();

    await tabToTestId(user, 'project-option-sample-a');
    expect(screen.getByTestId('project-option-sample-a')).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('project-option-sample-b')).toHaveFocus();
  });
});
