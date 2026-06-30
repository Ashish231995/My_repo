import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DIMENSION_DISPLAY_NAMES } from '../../src/features/health-dashboard/dimensionDisplayNames';
import { renderApp } from '../helpers/render-app';

describe('dimension display names (presentation)', () => {
  it('renders approved dimension headings after Sample B evaluation', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));

    const dimensionGrid = screen.getByTestId('dimension-grid');

    for (const label of Object.values(DIMENSION_DISPLAY_NAMES)) {
      expect(within(dimensionGrid).getByRole('heading', { name: label })).toBeInTheDocument();
    }

    expect(within(dimensionGrid).queryByRole('heading', { name: /^schedule$/i })).toBeNull();
    expect(within(dimensionGrid).queryByRole('heading', { name: /^delivery$/i })).toBeNull();
  });
});
