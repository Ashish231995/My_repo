import { MAPPING_REGISTRY } from '../../data/fixtures/mapping-registry.js';
import type { SessionAction, SessionState } from '../../domain/model/session.js';
import type { SampleProjectFixture } from '../../domain/model/evaluation.js';
import type { ImportedWorkbookReference, WorkbookAcquisitionPort } from '../acquisition/types.js';
import type { ImportLoadResult } from '../orchestration/loadImportedProject.js';
import type { WorkbookParserPort } from '../parsing/WorkbookParserPort.js';

export interface ImportController {
  requestImport(): Promise<void>;
  requestRefresh(): Promise<void>;
  requestReselect(): Promise<void>;
}

interface ContextToken {
  importRequestId: number;
  projectMode: SessionState['projectMode'];
}

function matchesPrePickerContext(state: SessionState, token: ContextToken): boolean {
  return (
    state.importRequestId === token.importRequestId && state.projectMode === token.projectMode
  );
}

function matchesRequestId(state: SessionState, requestId: number): boolean {
  return state.importRequestId === requestId;
}

type LoadImportedProject = (
  bytes: ArrayBuffer,
  meta: ImportedWorkbookReference,
  deps: { parser: WorkbookParserPort; registry: typeof MAPPING_REGISTRY },
) => Promise<ImportLoadResult>;

export function createImportController(deps: {
  dispatch: (action: SessionAction) => void;
  getState: () => SessionState;
  acquisition: WorkbookAcquisitionPort;
  parser: WorkbookParserPort;
  load: LoadImportedProject;
}): ImportController {
  const { dispatch, getState, acquisition, parser, load } = deps;

  async function requestImport(): Promise<void> {
    const contextToken: ContextToken = {
      importRequestId: getState().importRequestId,
      projectMode: getState().projectMode,
    };

    const acquired = await acquisition.selectWorkbook();
    if (acquired === null) {
      return;
    }

    if (!matchesPrePickerContext(getState(), contextToken)) {
      return;
    }

    const requestId = getState().importRequestId + 1;
    dispatch({ type: 'IMPORT_LOAD_STARTED', requestId });

    const result = await load(acquired.bytes, acquired.reference, {
      parser,
      registry: MAPPING_REGISTRY,
    });

    if (!matchesRequestId(getState(), requestId)) {
      return;
    }

    if (result.ok) {
      dispatch({
        type: 'IMPORT_LOAD_SUCCEEDED',
        requestId,
        workbookRef: acquired.reference,
        normalizedProject: result.project as SampleProjectFixture,
      });
      return;
    }

    dispatch({
      type: 'IMPORT_LOAD_FAILED',
      requestId,
      validation: result.validation,
    });
  }

  async function requestRefresh(): Promise<void> {
    const state = getState();
    if (state.projectMode !== 'imported' || !state.importContext?.workbookRef) {
      return;
    }

    // Allocate a new, strictly increasing requestId; REFRESH_STARTED adopts it in the reducer.
    const requestId = state.importRequestId + 1;
    const workbookRef = state.importContext.workbookRef;

    dispatch({ type: 'REFRESH_STARTED', requestId });

    const refreshResult = await acquisition.refresh({
      bytes: new ArrayBuffer(0),
      reference: workbookRef,
    });

    if (!matchesRequestId(getState(), requestId)) {
      return;
    }

    if (refreshResult.status === 'needs-reselect') {
      dispatch({
        type: 'RESELECT_REQUIRED',
        requestId,
        reason: refreshResult.reason,
      });
      return;
    }

    const result = await load(refreshResult.acquired.bytes, refreshResult.acquired.reference, {
      parser,
      registry: MAPPING_REGISTRY,
    });

    if (!matchesRequestId(getState(), requestId)) {
      return;
    }

    if (result.ok) {
      dispatch({
        type: 'REFRESH_SUCCEEDED',
        requestId,
        workbookRef: refreshResult.acquired.reference,
        normalizedProject: result.project as SampleProjectFixture,
      });
      return;
    }

    dispatch({
      type: 'REFRESH_FAILED',
      requestId,
      validation: result.validation,
    });
  }

  async function requestReselect(): Promise<void> {
    await requestImport();
  }

  return {
    requestImport,
    requestRefresh,
    requestReselect,
  };
}
