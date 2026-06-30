import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SAMPLE_PROJECTS } from '../../src/data/fixtures';
import { renderApp } from '../helpers/render-app';

describe('integration checklist (AS-006, AS-007, AS-008)', () => {
  it('shows signal groups with representative labels and default-enabled selections', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));

    const checklist = screen.getByTestId('integration-checklist');
    const groups = SAMPLE_PROJECTS['sample-b'].signalGroups;

    for (const group of groups) {
      const row = within(checklist).getByTestId(`checklist-group-${group.id}`);
      expect(within(row).getByText(group.displayName)).toBeInTheDocument();
      expect(within(row).getByText(group.representativeSourceLabel)).toBeInTheDocument();
      expect(within(row).getByRole('checkbox')).toBeChecked();
    }
  });

  it('disabling a group clears evaluation, keeps project selected, returns to project-ready, and shows warning', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));

    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();

    const deliveryRow = screen.getByTestId('checklist-group-grp-delivery');
    await user.click(within(deliveryRow).getByRole('checkbox'));

    expect(screen.queryByTestId('health-dashboard')).toBeNull();
    expect(screen.getByTestId('project-option-sample-b')).toBeChecked();
    expect(screen.getByTestId('evaluate-button')).toBeEnabled();
    expect(screen.getByTestId('checklist-incomplete-warning')).toBeInTheDocument();
  });
});
