import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createContext,
  useContext,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { WorkbookAcquisitionPort } from '../import/acquisition/types';
import { createBrowserWorkbookAcquisition } from '../import/acquisition/workbookAcquisition';
import { createImportController, type ImportController } from '../import/controller/importController';
import { loadImportedProject } from '../import/orchestration/loadImportedProject';
import { createBrowserReadExcelFileParser } from '../import/parsing/createBrowserReadExcelFileParser';
import type { WorkbookParserPort } from '../import/parsing/WorkbookParserPort';
import { validateImportedProject } from '../import/validation/validateImportedProject';
import type { SessionAction, SessionState } from '../domain/model/session';
import { createSessionReducer } from './createSessionReducer';
import { init } from './sessionActions';
import { createInitialSession } from './initialSession';

interface SessionContextValue {
  state: SessionState;
  dispatch: Dispatch<SessionAction>;
  importController: ImportController;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export interface SessionProviderProps {
  children: ReactNode;
  /** Test-only injection for import acquisition/parser fakes */
  importDeps?: {
    acquisition: WorkbookAcquisitionPort;
    parser: WorkbookParserPort;
  };
}

export function SessionProvider({ children, importDeps }: SessionProviderProps) {
  const reducer = useMemo(
    () => createSessionReducer({ importedProjectValidator: validateImportedProject }),
    [],
  );
  const stateRef = useRef<SessionState>(createInitialSession());
  const [state, setState] = useState<SessionState>(() => stateRef.current);

  const dispatch = useCallback(
    (action: SessionAction) => {
      const nextState = reducer(stateRef.current, action);
      stateRef.current = nextState;
      setState(nextState);
    },
    [reducer],
  );

  const acquisition = importDeps?.acquisition ?? createBrowserWorkbookAcquisition();
  const parser = importDeps?.parser ?? createBrowserReadExcelFileParser();

  const importController = useMemo(
    () =>
      createImportController({
        dispatch,
        getState: () => stateRef.current,
        acquisition,
        parser,
        load: loadImportedProject,
      }),
    [dispatch, acquisition, parser],
  );

  useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  return (
    <SessionContext.Provider value={{ state, dispatch, importController }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
