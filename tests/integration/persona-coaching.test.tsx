import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../helpers/render-app';

describe('persona coaching (AS-056, AS-057)', () => {
  it('changes auxiliary coaching while preserving analytical outputs', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByTestId('persona-option-intermediate')).toBeChecked();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));

    const composite = screen.getByTestId('composite-health');
    expect(within(composite).getByText('51')).toBeInTheDocument();

    const recommendations = screen.getAllByTestId(/^recommendation-REC-/);
    expect(recommendations[0]).toHaveAttribute('data-testid', 'recommendation-REC-002');
    expect(recommendations[1]).toHaveAttribute('data-testid', 'recommendation-REC-001');

    const intermediateCoaching = screen.getByTestId('recommendation-coaching-REC-001').textContent;
    const intermediateAction = screen.getByTestId('recommendation-action-REC-001').textContent;

    await user.click(screen.getByTestId('persona-option-novice'));
    const noviceCoaching = screen.getByTestId('recommendation-coaching-REC-001').textContent;
    expect(noviceCoaching).not.toBe(intermediateCoaching);
    expect(screen.getByTestId('coach-glossary-REC-001')).toBeInTheDocument();
    expect(screen.getByTestId('coach-steps-REC-001')).toBeInTheDocument();
    expect(screen.getByTestId('recommendation-action-REC-001').textContent).toBe(intermediateAction);
    expect(within(composite).getByText('51')).toBeInTheDocument();

    await user.click(screen.getByTestId('persona-option-expert'));
    expect(screen.getByTestId(`coach-toggle-coach-recommendation-REC-001-rationale`)).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByTestId('coach-evidence-refs-REC-001')).toBeInTheDocument();
    expect(screen.getByTestId('recommendation-action-REC-001').textContent).toBe(intermediateAction);

    await user.click(screen.getByTestId('persona-option-intermediate'));
    expect(screen.getByTestId('recommendation-coaching-REC-001').textContent).toBe(intermediateCoaching);
    expect(within(composite).getByText('51')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^recommendation-REC-/)[0]).toHaveAttribute(
      'data-testid',
      'recommendation-REC-002',
    );
  });

  it('keeps full evidence drilldown reachable in Expert persona', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));
    await user.click(screen.getByTestId('persona-option-expert'));

    const rationaleToggle = screen.getByTestId('coach-toggle-coach-recommendation-REC-001-rationale');
    expect(rationaleToggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(rationaleToggle);
    expect(rationaleToggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByTestId('explain-dimension-delivery'));
    expect(screen.getByTestId('dimension-detail-content-delivery')).toBeInTheDocument();
    expect(screen.getByTestId('evidence-drilldown')).toBeInTheDocument();
  });
});
