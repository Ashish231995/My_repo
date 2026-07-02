import { describe, expect, it, vi } from 'vitest';
import { MAPPING_REGISTRY } from '../../src/data/fixtures';
import type { SessionAction, SessionState } from '../../src/domain/model/session';
import { createInitialSession } from '../../src/session/initialSession';
import { createImportController } from '../../src/import/controller/importController';
import { loadImportedProject } from '../../src/import/orchestration/loadImportedProject';
import { buildParsedWorkbook } from './helpers/parsedWorkbookBuilders';
import { createFakeWorkbookParser } from './fakeWorkbookParser';

describe('createImportController', () => {
  const acquired = {
    bytes: new ArrayBuffer(4),
    reference: {
      filename: 'complete-v1.xlsx',
      lastModifiedMs: 1,
      acquisitionMethod: 'file-input' as const,
      fileHandle: null,
      lastKnownFile: null,
    },
  };

  function importedEvaluatedState(requestId = 1): SessionState {
    return {
      ...createInitialSession(),
      projectMode: 'imported',
      phase: 'evaluated',
      importRequestId: requestId,
      evaluation: { projectId: 'import:IMPORT-DEMO-001' } as never,
      importContext: {
        workbookRef: acquired.reference,
        validation: null,
        normalizedProject: normalizedProject('2026-06-15'),
        refreshState: 'idle',
        loadState: 'idle',
      },
    } as SessionState;
  }

  function normalizedProject(asOfDate: string) {
    return {
      schemaVersion: '1.0',
      id: 'import:IMPORT-DEMO-001',
      displayName: 'Import Demo Complete',
      scenario: 'imported',
      origin: 'imported',
      identity: { projectKey: 'IMPORT-DEMO-001' },
      snapshot: { asOfDate, label: 'Snapshot' },
      signalGroups: [{ id: 'import-workbook', label: 'Import', defaultEnabled: true }],
      sourceSignals: [],
      importMeta: {
        filename: 'complete-v1.xlsx',
        workbookAsOfDate: asOfDate,
        localLastModifiedMs: 1,
        trustLabel: 'Local snapshot',
      },
    } as never;
  }

  it('import success dispatches IMPORT_LOAD_STARTED then IMPORT_LOAD_SUCCEEDED with matching requestId', async () => {
    const dispatched: SessionAction[] = [];
    let state = { ...createInitialSession(), importRequestId: 1 };
    const acquisition = {
      selectWorkbook: vi.fn(async () => acquired),
      refresh: vi.fn(),
    };
    const controller = createImportController({
      dispatch: (action) => {
        dispatched.push(action);
        if (action.type === 'IMPORT_LOAD_STARTED') {
          state = { ...state, importRequestId: action.requestId };
        }
      },
      getState: () => state,
      acquisition,
      parser: createFakeWorkbookParser(buildParsedWorkbook()),
      load: loadImportedProject,
    });

    await controller.requestImport();

    expect(dispatched.map((a) => a.type)).toEqual(['IMPORT_LOAD_STARTED', 'IMPORT_LOAD_SUCCEEDED']);
    const started = dispatched[0];
    const succeeded = dispatched[1];
    expect(started.type).toBe('IMPORT_LOAD_STARTED');
    expect(succeeded.type).toBe('IMPORT_LOAD_SUCCEEDED');
    if (started.type === 'IMPORT_LOAD_STARTED' && succeeded.type === 'IMPORT_LOAD_SUCCEEDED') {
      expect(succeeded.requestId).toBe(started.requestId);
      expect(succeeded.normalizedProject).toBeTruthy();
      expect(succeeded.workbookRef?.filename).toBe('complete-v1.xlsx');
    }
  });

  it('picker cancel dispatches no lifecycle actions', async () => {
    const dispatched: SessionAction[] = [];
    const controller = createImportController({
      dispatch: (action) => dispatched.push(action),
      getState: () => createInitialSession(),
      acquisition: { selectWorkbook: vi.fn(async () => null), refresh: vi.fn() },
      parser: createFakeWorkbookParser(buildParsedWorkbook()),
      load: loadImportedProject,
    });

    await controller.requestImport();
    expect(dispatched).toEqual([]);
  });

  it('context-change guard dispatches nothing when bundled selection wins during picker', async () => {
    let state = createInitialSession();
    const dispatched: SessionAction[] = [];
    const acquisition = {
      selectWorkbook: vi.fn(async () => {
        state = { ...state, projectMode: 'bundled', selectedProjectId: 'sample-a', importRequestId: 99 };
        return acquired;
      }),
      refresh: vi.fn(),
    };
    const controller = createImportController({
      dispatch: (action) => dispatched.push(action),
      getState: () => state,
      acquisition,
      parser: createFakeWorkbookParser(buildParsedWorkbook()),
      load: loadImportedProject,
    });

    await controller.requestImport();
    expect(dispatched).toEqual([]);
  });

  it('file-input refresh dispatches exact REFRESH_STARTED → RESELECT_REQUIRED sequence', async () => {
    const dispatched: SessionAction[] = [];
    let state = importedEvaluatedState(3);
    const acquisition = {
      selectWorkbook: vi.fn(),
      refresh: vi.fn(async () => ({
        status: 'needs-reselect' as const,
        reason: 'File input tier requires user reselection',
      })),
    };
    const controller = createImportController({
      dispatch: (action) => {
        if (action.type === 'REFRESH_STARTED') {
          state = { ...state, importRequestId: action.requestId };
        }
        dispatched.push(action);
      },
      getState: () => state,
      acquisition,
      parser: createFakeWorkbookParser(buildParsedWorkbook()),
      load: loadImportedProject,
    });

    await controller.requestRefresh();

    expect(dispatched.map((a) => a.type)).toEqual(['REFRESH_STARTED', 'RESELECT_REQUIRED']);
    const started = dispatched[0];
    const reselect = dispatched[1];
    if (started.type === 'REFRESH_STARTED' && reselect.type === 'RESELECT_REQUIRED') {
      // refresh allocates a new increasing requestId (3 → 4) that REFRESH_STARTED adopts
      expect(started.requestId).toBe(4);
      expect(reselect.requestId).toBe(started.requestId);
      expect(reselect.reason).toMatch(/reselect/i);
    }
  });

  it('invalid refreshed workbook dispatches REFRESH_STARTED → REFRESH_FAILED', async () => {
    const dispatched: SessionAction[] = [];
    let state = importedEvaluatedState(4);
    const refreshedBytes = new ArrayBuffer(8);
    const acquisition = {
      selectWorkbook: vi.fn(),
      refresh: vi.fn(async () => ({
        status: 'refreshed' as const,
        acquired: {
          bytes: refreshedBytes,
          reference: { ...acquired.reference, lastModifiedMs: 500 },
        },
      })),
    };
    const failingLoad = vi.fn(async () => ({
      ok: false as const,
      validation: {
        ok: false as const,
        category: 'parse-failure' as const,
        messages: ['Corrupt workbook after refresh'],
      },
    }));
    const controller = createImportController({
      dispatch: (action) => {
        if (action.type === 'REFRESH_STARTED') {
          state = { ...state, importRequestId: action.requestId };
        }
        dispatched.push(action);
      },
      getState: () => state,
      acquisition,
      parser: createFakeWorkbookParser(new Error('parse failed')),
      load: failingLoad,
    });

    await controller.requestRefresh();

    expect(dispatched.map((a) => a.type)).toEqual(['REFRESH_STARTED', 'REFRESH_FAILED']);
    const started = dispatched[0];
    const failed = dispatched[1];
    if (started.type === 'REFRESH_STARTED' && failed.type === 'REFRESH_FAILED') {
      // refresh allocates a new increasing requestId (4 → 5)
      expect(started.requestId).toBe(5);
      expect(failed.requestId).toBe(started.requestId);
      expect(failed.validation.category).toBe('parse-failure');
    }
    expect(failingLoad).toHaveBeenCalledWith(
      refreshedBytes,
      expect.objectContaining({ lastModifiedMs: 500 }),
      expect.objectContaining({ registry: MAPPING_REGISTRY }),
    );
  });

  it('overlapping refreshes allocate increasing requestIds; the stale completion is ignored', async () => {
    const dispatched: SessionAction[] = [];
    let state = importedEvaluatedState(3);
    let releaseFirstRefresh: (() => void) | null = null;
    const firstRefreshGate = new Promise<void>((resolve) => {
      releaseFirstRefresh = resolve;
    });
    let refreshCall = 0;

    const acquisition = {
      selectWorkbook: vi.fn(),
      refresh: vi.fn(async () => {
        refreshCall += 1;
        if (refreshCall === 1) {
          await firstRefreshGate;
        }
        return {
          status: 'refreshed' as const,
          acquired: {
            bytes: new ArrayBuffer(4),
            reference: { ...acquired.reference, lastModifiedMs: 100 + refreshCall },
          },
        };
      }),
    };

    // The reducer stale-guard: completions only apply when requestId matches current state.
    const controller = createImportController({
      dispatch: (action) => {
        if (action.type === 'REFRESH_STARTED') {
          state = { ...state, importRequestId: action.requestId };
        }
        if (action.type === 'REFRESH_SUCCEEDED' && action.requestId !== state.importRequestId) {
          return; // stale — reducer would no-op
        }
        dispatched.push(action);
      },
      getState: () => state,
      acquisition,
      parser: createFakeWorkbookParser(buildParsedWorkbook()),
      load: loadImportedProject,
    });

    const first = controller.requestRefresh(); // allocates requestId 4
    const second = controller.requestRefresh(); // allocates requestId 5, adopted before first completes
    releaseFirstRefresh?.();
    await Promise.all([first, second]);

    const starts = dispatched.filter((a) => a.type === 'REFRESH_STARTED');
    expect(starts.map((a) => (a.type === 'REFRESH_STARTED' ? a.requestId : -1))).toEqual([4, 5]);

    const succeeded = dispatched.filter((a) => a.type === 'REFRESH_SUCCEEDED');
    // Only the newest refresh (requestId 5) survives the stale guard.
    expect(succeeded).toHaveLength(1);
    if (succeeded[0]?.type === 'REFRESH_SUCCEEDED') {
      expect(succeeded[0].requestId).toBe(5);
    }
  });

  it('reset advances the requestId so a new import ignores the pre-reset completion', async () => {
    const flushMacrotask = () => new Promise((resolve) => setTimeout(resolve, 0));
    const dispatched: SessionAction[] = [];
    let state: SessionState = { ...createInitialSession(), importRequestId: 0 };
    let releaseFirstLoad: (() => void) | null = null;
    const firstLoadGate = new Promise<void>((resolve) => {
      releaseFirstLoad = resolve;
    });
    let loadCall = 0;

    const load = vi.fn(async () => {
      loadCall += 1;
      if (loadCall === 1) {
        await firstLoadGate;
      }
      return { ok: true as const, project: normalizedProject('2026-06-15') };
    });

    const acquisition = {
      selectWorkbook: vi.fn(async () => acquired),
      refresh: vi.fn(),
    };

    const controller = createImportController({
      dispatch: (action) => {
        if (action.type === 'IMPORT_LOAD_STARTED') {
          state = { ...state, importRequestId: action.requestId, projectMode: 'imported' };
        }
        if (action.type === 'IMPORT_LOAD_SUCCEEDED' && action.requestId !== state.importRequestId) {
          return; // stale — reducer would no-op
        }
        dispatched.push(action);
      },
      getState: () => state,
      acquisition,
      parser: createFakeWorkbookParser(buildParsedWorkbook()),
      load,
    });

    const first = controller.requestImport();
    await flushMacrotask(); // first passes the picker guard and blocks inside load()
    expect(state.importRequestId).toBe(1);

    // Reset while the first load is in-flight: advance the requestId (never reset to zero).
    state = { ...createInitialSession(), importRequestId: state.importRequestId + 1 };

    const second = controller.requestImport(); // IMPORT_LOAD_STARTED requestId 3
    await flushMacrotask();
    releaseFirstLoad?.();
    await Promise.all([first, second]);

    const succeeded = dispatched.filter((a) => a.type === 'IMPORT_LOAD_SUCCEEDED');
    // The pre-reset load (requestId 1) is stale and dropped; only the post-reset load applies.
    expect(succeeded).toHaveLength(1);
    if (succeeded[0]?.type === 'IMPORT_LOAD_SUCCEEDED') {
      expect(succeeded[0].requestId).toBe(3);
    }
  });
});
