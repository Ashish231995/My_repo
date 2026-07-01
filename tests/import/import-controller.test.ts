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
    const state = importedEvaluatedState(3);
    const acquisition = {
      selectWorkbook: vi.fn(),
      refresh: vi.fn(async () => ({
        status: 'needs-reselect' as const,
        reason: 'File input tier requires user reselection',
      })),
    };
    const controller = createImportController({
      dispatch: (action) => dispatched.push(action),
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
      expect(reselect.requestId).toBe(started.requestId);
      expect(reselect.requestId).toBe(3);
      expect(reselect.reason).toMatch(/reselect/i);
    }
  });

  it('invalid refreshed workbook dispatches REFRESH_STARTED → REFRESH_FAILED', async () => {
    const dispatched: SessionAction[] = [];
    const state = importedEvaluatedState(4);
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
      dispatch: (action) => dispatched.push(action),
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
      expect(failed.requestId).toBe(started.requestId);
      expect(failed.requestId).toBe(4);
      expect(failed.validation.category).toBe('parse-failure');
    }
    expect(failingLoad).toHaveBeenCalledWith(
      refreshedBytes,
      expect.objectContaining({ lastModifiedMs: 500 }),
      expect.objectContaining({ registry: MAPPING_REGISTRY }),
    );
  });
});
