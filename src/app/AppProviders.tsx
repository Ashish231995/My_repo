import type { ReactNode } from 'react';
import { SessionProvider } from '../session/sessionContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
