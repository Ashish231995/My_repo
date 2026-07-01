import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../helpers/render-app';

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

describe('responsive layout (AS-031)', () => {
  it('keeps primary journey content reachable at narrow and wide viewports', async () => {
    const user = userEvent.setup();
    setViewportWidth(320);
    renderApp();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('persona-selector')).toBeInTheDocument();
    expect(screen.getByTestId('project-option-sample-b')).toBeInTheDocument();
    expect(screen.getByTestId('evaluate-button')).toBeInTheDocument();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));

    expect(screen.getByTestId('composite-health')).toBeInTheDocument();
    expect(screen.getByTestId('dimension-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^recommendation-REC-/).length).toBeGreaterThanOrEqual(2);

    setViewportWidth(1280);
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('dimension-card-schedule')).toBeVisible();
    expect(screen.getByTestId('reset-button')).toBeVisible();
  });
});
