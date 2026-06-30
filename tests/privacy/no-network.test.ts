import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../helpers/render-app';

describe('no network during evaluation journey (AS-024, FR-025)', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('does not call fetch during project selection, persona change, and evaluation', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('persona-option-novice'));
    await user.click(screen.getByTestId('evaluate-button'));

    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
