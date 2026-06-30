import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SessionProvider, useSession } from '../../src/session/sessionContext';

function PersonaProbe() {
  const { state } = useSession();
  return <div data-testid="persona">{state.persona}</div>;
}

describe('session defaults', () => {
  it('provides Intermediate persona on init (AS-044)', () => {
    render(
      <SessionProvider>
        <PersonaProbe />
      </SessionProvider>,
    );
    expect(screen.getByTestId('persona')).toHaveTextContent('intermediate');
  });
});
