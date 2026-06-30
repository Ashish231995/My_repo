import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import App from '../../src/app/App';
import { AppProviders } from '../../src/app/AppProviders';

export function renderApp(options?: Omit<RenderOptions, 'wrapper'>) {
  return render(
    <AppProviders>
      <App />
    </AppProviders>,
    options,
  );
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(<AppProviders>{ui}</AppProviders>, options);
}
