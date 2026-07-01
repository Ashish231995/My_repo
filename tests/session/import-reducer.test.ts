import { describe, expect, it } from 'vitest';
import type { MappingRegistry } from '../../src/data/fixtures/mapping-registry';
import type { ProjectLoadResult, SampleProjectFixture } from '../../src/domain/model/evaluation';
import type { SessionState } from '../../src/domain/model/session';
import { createInitialSession } from '../../src/session/initialSession';
import { createSessionReducer } from '../../src/session/createSessionReducer';
import { selectProject, toggleSignalGroup } from '../../src/session/sessionActions';

type ProjectValidator = (
  project: SampleProjectFixture,
  registry: MappingRegistry,
) => ProjectLoadResult;

const stubImportedProjectValidator: ProjectValidator = (project) => ({
  ok: true,
  project: project as never,
});

const workbookRef = {
  filename: 'complete-v1.xlsx',
  lastModifiedMs: 1,
  acquisitionMethod: 'file-input' as const,
  fileHandle: null,
  lastKnownFile: null,
};

function normalizedProject(asOfDate: string) {
  return {
    schemaVersion: '1.0',
    id: 'import:IMPORT-DEMO-001',
    displayName: 'Import Demo',
    scenario: 'imported',
    origin: 'imported',
    identity: { projectKey: 'IMPORT-DEMO-001' },
    snapshot: { asOfDate, label: `Snapshot ${asOfDate}` },
    signalGroups: [{ id: 'import-workbook', label: 'Import workbook', defaultEnabled: true }],
    sourceSignals: [],
    importMeta: {
      filename: 'complete-v1.xlsx',
      workbookAsOfDate: asOfDate,
      localLastModifiedMs: 1,
      trustLabel: 'Local snapshot',
    },
  } as never;
}

function importLoadSucceededState(requestId: number, asOfDate = '2026-06-15'): SessionState {
  const reducer = createSessionReducer({ importedProjectValidator: stubImportedProjectValidator });
  let state = createInitialSession();
  state = reducer(state, { type: 'IMPORT_LOAD_STARTED', requestId });
  return reducer(state, {
    type: 'IMPORT_LOAD_SUCCEEDED',
    requestId,
    workbookRef,
    normalizedProject: normalizedProject(asOfDate),
  });
}

describe('createSessionReducer import lifecycle (pure)', () => {
  const reducer = createSessionReducer({ importedProjectValidator: stubImportedProjectValidator });

  it('IMPORT_LOAD_STARTED sets import-loading and clears bundled selection', () => {
    const state = reducer(createInitialSession(), { type: 'IMPORT_LOAD_STARTED', requestId: 1 });
    expect(state.phase).toBe('import-loading');
    expect(state.projectMode).toBe('imported');
    expect(state.selectedProjectId).toBeNull();
    expect(state.evaluation).toBeNull();
  });

  it('IMPORT_LOAD_SUCCEEDED with matching requestId moves to project-ready', () => {
    const state = importLoadSucceededState(1);
    expect(state.phase).toBe('project-ready');
    expect(state.importContext?.normalizedProject).toBeTruthy();
  });

  it('IMPORT_LOAD_SUCCEEDED with stale requestId is a no-op', () => {
    const reducerWithStale = createSessionReducer({ importedProjectValidator: stubImportedProjectValidator });
    let state = createInitialSession();
    state = { ...state, importRequestId: 2 };
    const before = state;
    state = reducerWithStale(state, {
      type: 'IMPORT_LOAD_SUCCEEDED',
      requestId: 1,
      workbookRef: null,
      normalizedProject: null,
    });
    expect(state).toBe(before);
  });

  it('IMPORT_LOAD_FAILED sets import-invalid with no evaluation scores', () => {
    let state = reducer(createInitialSession(), { type: 'IMPORT_LOAD_STARTED', requestId: 1 });
    state = reducer(state, {
      type: 'IMPORT_LOAD_FAILED',
      requestId: 1,
      validation: { ok: false, category: 'missing-project-row', messages: ['Populate Project row 2'] },
    });
    expect(state.phase).toBe('import-invalid');
    expect(state.evaluation).toBeNull();
    expect(state.presentation).toBeNull();
  });

  it('REFRESH_STARTED clears evaluation (fail-closed)', () => {
    let state = importLoadSucceededState(1);
    state = {
      ...state,
      phase: 'evaluated',
      evaluation: { projectId: 'import:IMPORT-DEMO-001' } as never,
      presentation: {} as never,
    };
    state = reducer(state, { type: 'REFRESH_STARTED', requestId: 1 });
    expect(state.evaluation).toBeNull();
    expect(state.presentation).toBeNull();
    expect(state.importContext?.refreshState).toBe('refreshing');
  });

  it('REFRESH_SUCCEEDED replaces normalized project, clears evaluation, and returns project-ready', () => {
    let state = importLoadSucceededState(1, '2026-06-15');
    state = {
      ...state,
      phase: 'evaluated',
      evaluation: { projectId: 'import:IMPORT-DEMO-001' } as never,
      presentation: {} as never,
    };
    state = reducer(state, { type: 'REFRESH_STARTED', requestId: 1 });
    state = reducer(state, {
      type: 'REFRESH_SUCCEEDED',
      requestId: 1,
      workbookRef: { ...workbookRef, lastModifiedMs: 99 },
      normalizedProject: normalizedProject('2026-07-01'),
    });

    expect(state.phase).toBe('project-ready');
    expect(state.evaluation).toBeNull();
    expect(state.presentation).toBeNull();
    expect(state.importContext?.refreshState).toBe('idle');
    expect(state.importContext?.normalizedProject?.snapshot.asOfDate).toBe('2026-07-01');
    expect(state.importContext?.workbookRef?.lastModifiedMs).toBe(99);
  });

  it('REFRESH_SUCCEEDED with stale requestId is a strict no-op', () => {
    let state = importLoadSucceededState(1, '2026-06-15');
    state = { ...state, importRequestId: 2 };
    const before = state;
    state = reducer(state, {
      type: 'REFRESH_SUCCEEDED',
      requestId: 1,
      workbookRef,
      normalizedProject: normalizedProject('2026-07-01'),
    });
    expect(state).toBe(before);
  });

  it('REFRESH_FAILED sets import-invalid with no scores', () => {
    let state = importLoadSucceededState(1);
    state = reducer(state, { type: 'REFRESH_STARTED', requestId: 1 });
    state = reducer(state, {
      type: 'REFRESH_FAILED',
      requestId: 1,
      validation: { ok: false, category: 'parse-failure', messages: ['Corrupt workbook'] },
    });
    expect(state.phase).toBe('import-invalid');
    expect(state.evaluation).toBeNull();
  });

  it('REFRESH_FAILED with stale requestId is a strict no-op', () => {
    let state = importLoadSucceededState(1);
    state = { ...state, importRequestId: 2 };
    const before = state;
    state = reducer(state, {
      type: 'REFRESH_FAILED',
      requestId: 1,
      validation: { ok: false, category: 'parse-failure', messages: ['Corrupt workbook'] },
    });
    expect(state).toBe(before);
  });

  it('RESELECT_REQUIRED clears evaluation without stale scores', () => {
    let state = importLoadSucceededState(1);
    state = {
      ...state,
      phase: 'evaluated',
      evaluation: { projectId: 'import:IMPORT-DEMO-001' } as never,
    };
    state = reducer(state, { type: 'RESELECT_REQUIRED', requestId: 1, reason: 'Reselect workbook' });
    expect(state.evaluation).toBeNull();
    expect(state.importContext?.refreshState).toBe('needs-reselect');
  });

  it('SELECT_PROJECT increments importRequestId and clears import context (BR-005)', () => {
    let state = importLoadSucceededState(1);
    const priorRequestId = state.importRequestId;
    state = reducer(state, selectProject('sample-b'));
    expect(state.projectMode).toBe('bundled');
    expect(state.importContext).toBeNull();
    expect(state.importRequestId).toBeGreaterThan(priorRequestId);
  });

  it('TOGGLE_SIGNAL_GROUP is ignored in imported mode', () => {
    let state = importLoadSucceededState(1);
    const beforeGroups = [...state.enabledSignalGroupIds];
    state = reducer(state, toggleSignalGroup('import-workbook'));
    expect(state.enabledSignalGroupIds).toEqual(beforeGroups);
    expect(state.projectMode).toBe('imported');
  });

  it('sync EVALUATE uses injected importedProjectValidator', () => {
    let state = importLoadSucceededState(1);
    state = reducer(state, { type: 'EVALUATE' });
    expect(state.phase).toBe('evaluated');
    expect(state.evaluation).not.toBeNull();
  });
});
