import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../helpers/render-app';

async function tabToElement(user: ReturnType<typeof userEvent.setup>, testId: string) {
  const target = screen.getByTestId(testId);
  let attempts = 0;
  while (document.activeElement !== target && attempts < 40) {
    await user.tab();
    attempts += 1;
  }
  expect(document.activeElement).toBe(target);
  return target;
}

describe('keyboard navigation — primary flows (AS-030)', () => {
  it('completes P1 journey using keyboard only', async () => {
    const user = userEvent.setup();
    renderApp();

    await tabToElement(user, 'project-option-sample-b');
    await user.keyboard('{Space}');
    expect(screen.getByTestId('evaluate-button')).toBeEnabled();

    await tabToElement(user, 'evaluate-button');
    await user.keyboard('{Enter}');

    const composite = screen.getByTestId('composite-health');
    expect(within(composite).getByText('51')).toBeInTheDocument();

    const explainSchedule = screen.getByTestId('explain-dimension-schedule');
    explainSchedule.focus();
    await user.keyboard('{Enter}');
    expect(document.getElementById('dimension-detail-schedule')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(document.getElementById('dimension-detail-schedule')).toBeNull();

    await tabToElement(user, 'reset-button');
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('reset-confirm-dialog')).toBeInTheDocument();

    await tabToElement(user, 'reset-cancel-button');
    await user.keyboard('{Enter}');
    expect(screen.queryByTestId('reset-confirm-dialog')).toBeNull();
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
  });

  it('reaches persona and project controls via Tab without pointer input', async () => {
    const user = userEvent.setup();
    renderApp();

    await tabToElement(user, 'persona-option-novice');
    await user.keyboard('{Space}');
    expect(screen.getByTestId('persona-option-novice')).toBeChecked();

    await tabToElement(user, 'project-option-sample-a');
    expect(screen.getByTestId('project-option-sample-a')).toHaveFocus();
  });
});
