import type { UserEvent } from '@testing-library/user-event';
import { screen } from '@testing-library/react';

export interface TabToTestIdOptions {
  shift?: boolean;
  maxAttempts?: number;
}

export async function tabToTestId(
  user: UserEvent,
  testId: string,
  options: TabToTestIdOptions = {},
) {
  const target = screen.getByTestId(testId);
  const maxAttempts = options.maxAttempts ?? 100;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (document.activeElement === target) {
      return target;
    }
    if (options.shift) {
      await user.tab({ shift: true });
    } else {
      await user.tab();
    }
  }

  throw new Error(`Could not reach [data-testid="${testId}"] via Tab within ${maxAttempts} attempts`);
}
