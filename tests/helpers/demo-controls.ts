import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

export async function openDemoControlsDisclosure(user: UserEvent) {
  const summary = screen.getByTestId('demo-controls-summary');
  const details = screen.getByTestId('adverse-condition-path');
  if (!details.hasAttribute('open')) {
    await user.click(summary);
  }
  expect(details).toHaveAttribute('open');
}
