import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../helpers/render-app';

function dialogForExplainControl(explainButton: HTMLElement): HTMLElement {
  const controlsId = explainButton.getAttribute('aria-controls');
  expect(controlsId).toBeTruthy();
  const dialogElement = document.getElementById(controlsId!);
  expect(dialogElement).not.toBeNull();
  return dialogElement as HTMLElement;
}

describe('evidence drilldown (AS-016, AS-059, AS-063)', () => {
  it('opens dimension explanation with findings and evidence provenance', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));

    const explainButton = screen.getByTestId('explain-dimension-delivery');
    expect(explainButton).toHaveAttribute('aria-expanded', 'false');
    expect(explainButton).toHaveAttribute('aria-controls', 'dimension-detail-delivery');

    await user.click(explainButton);

    expect(explainButton).toHaveAttribute('aria-expanded', 'true');

    const dialogElement = dialogForExplainControl(explainButton);
    expect(dialogElement).toHaveAttribute('role', 'dialog');
    expect(dialogElement.id).toBe('dimension-detail-delivery');
    expect(document.querySelectorAll('#dimension-detail-delivery')).toHaveLength(1);

    const detail = within(dialogElement).getByTestId('dimension-detail-content-delivery');
    expect(within(detail).getByRole('status', { name: /measurement status: measured/i })).toBeInTheDocument();
    expect(within(detail).getByText(/100% evidence coverage/i)).toBeInTheDocument();
    expect(within(detail).getByText(/delivery dimension evaluated/i)).toBeInTheDocument();

    const findings = within(detail).getByTestId('dimension-findings');
    expect(within(findings).getByText(/FND-001/i)).toBeInTheDocument();

    const drilldown = within(detail).getByTestId('evidence-drilldown');
    const blockerRow = within(drilldown).getByTestId('evidence-row-evidence-sig-b-delivery-blocker');
    expect(within(blockerRow).getByText(/Representative work-tracker \(demo\)/i)).toBeInTheDocument();
    expect(within(blockerRow).getByText(/Open blocker state/i)).toBeInTheDocument();
    expect(within(blockerRow).getByText(/delivery\.blocker-open/i)).toBeInTheDocument();
    expect(within(blockerRow).getByText(/mapped/i)).toBeInTheDocument();
    expect(within(blockerRow).getByText(/included in scoring/i)).toBeInTheDocument();
    expect(within(blockerRow).getByText(/2026-06-01/i)).toBeInTheDocument();

    const failedRow = within(drilldown).getByTestId(
      'evidence-row-evidence-sig-b-delivery-blocker-failed',
    );
    expect(failedRow.textContent).toMatch(/Mapping status:\s*failed/i);
    expect(within(failedRow).getByText(/excluded from scoring/i)).toBeInTheDocument();
    expect(within(failedRow).getByText(/Mapping forced to fail/i)).toBeInTheDocument();

    expect(within(detail).queryByTestId('dimension-trend')).not.toBeInTheDocument();
    expect(screen.queryByText(/live connection/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/connected to/i)).not.toBeInTheDocument();

    const explainControlIds = screen
      .getAllByRole('button', { name: /^explain$/i })
      .map((button) => button.getAttribute('aria-controls'))
      .filter((value): value is string => Boolean(value));
    expect(new Set(explainControlIds).size).toBe(explainControlIds.length);
  });

  it('supports keyboard close and restores focus to the explain control', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));

    const explainButton = screen.getByTestId('explain-dimension-delivery');
    expect(explainButton).toHaveAttribute('aria-expanded', 'false');

    explainButton.focus();
    await user.keyboard('{Enter}');

    expect(explainButton).toHaveAttribute('aria-expanded', 'true');
    expect(dialogForExplainControl(explainButton)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(document.getElementById('dimension-detail-delivery')).toBeNull();
    expect(explainButton).toHaveFocus();
    expect(explainButton).toHaveAttribute('aria-expanded', 'false');
  });
});
