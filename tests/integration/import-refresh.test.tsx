import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WorkbookAcquisitionPort } from '../../src/import/acquisition/types';
import type { WorkbookParserPort } from '../../src/import/parsing/WorkbookParserPort';
import { createFakeWorkbookParser } from '../import/fakeWorkbookParser';
import { buildParsedWorkbook } from '../import/helpers/parsedWorkbookBuilders';
import { renderImportApp } from '../helpers/render-import-app';

const initialAcquired = {
  bytes: new ArrayBuffer(4),
  reference: {
    filename: 'complete-v1.xlsx',
    lastModifiedMs: 1_700_000_000_000,
    acquisitionMethod: 'file-picker' as const,
    fileHandle: { getFile: async () => new File([], 'complete-v1.xlsx') } as FileSystemFileHandle,
    lastKnownFile: null,
  },
};

const fileInputAcquired = {
  bytes: new ArrayBuffer(4),
  reference: {
    filename: 'complete-v1.xlsx',
    lastModifiedMs: 1_700_000_000_000,
    acquisitionMethod: 'file-input' as const,
    fileHandle: null,
    lastKnownFile: null,
  },
};

const refreshedAcquired = {
  bytes: new ArrayBuffer(8),
  reference: {
    ...initialAcquired.reference,
    lastModifiedMs: 1_800_000_000_000,
  },
};

async function importAndEvaluate(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId('import-snapshot-button'));
  await waitFor(() => expect(screen.getByTestId('evaluate-button')).toBeEnabled());
  await user.click(screen.getByTestId('evaluate-button'));
  await waitFor(() => expect(screen.getByTestId('health-dashboard')).toBeInTheDocument());
}

function createAcquisition(overrides: Partial<WorkbookAcquisitionPort>): WorkbookAcquisitionPort {
  return {
    selectWorkbook: overrides.selectWorkbook ?? (async () => initialAcquired),
    refresh: overrides.refresh ?? (async () => ({
      status: 'refreshed' as const,
      acquired: refreshedAcquired,
    })),
  };
}

function parserThatFailsAfterFirstImport(): WorkbookParserPort {
  const parse = vi
    .fn()
    .mockResolvedValueOnce(buildParsedWorkbook())
    .mockRejectedValueOnce(new Error('parse failed after refresh'));
  return { parse };
}

describe('import refresh (US4 — T260)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refreshes via file handle, clears evaluation, and requires Evaluate again', async () => {
    const user = userEvent.setup();
    const refresh = vi.fn(async () => ({
      status: 'refreshed' as const,
      acquired: refreshedAcquired,
    }));

    renderImportApp({
      acquisition: createAcquisition({ refresh }),
      parser: createFakeWorkbookParser(buildParsedWorkbook()),
    });

    await importAndEvaluate(user);
    expect(screen.getByTestId('refresh-snapshot-button')).toBeInTheDocument();

    await user.click(screen.getByTestId('refresh-snapshot-button'));
    expect(refresh).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByTestId('health-dashboard')).toBeNull();
    });
    expect(screen.getByTestId('evaluate-button')).toBeEnabled();
    expect(screen.getByTestId('results-placeholder')).toHaveTextContent(/imported workbook ready/i);

    await user.click(screen.getByTestId('evaluate-button'));
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('shows reselect for file-input refresh and clears stale health results', async () => {
    const user = userEvent.setup();

    renderImportApp({
      acquisition: createAcquisition({
        selectWorkbook: async () => fileInputAcquired,
        refresh: async () => ({
          status: 'needs-reselect' as const,
          reason: 'File input tier requires user reselection',
        }),
      }),
      parser: createFakeWorkbookParser(buildParsedWorkbook()),
    });

    await importAndEvaluate(user);
    await user.click(screen.getByTestId('refresh-snapshot-button'));

    await waitFor(() => {
      expect(screen.getByTestId('reselect-workbook-button')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('health-dashboard')).toBeNull();
    expect(screen.queryByTestId('composite-health')).toBeNull();
    expect(screen.getByTestId('import-reselect-status')).toHaveTextContent(/reselect/i);
    expect(screen.getByTestId('evaluate-button')).toBeDisabled();
  });

  it('removes stale health results after refresh failure', async () => {
    const user = userEvent.setup();

    renderImportApp({
      acquisition: createAcquisition({
        refresh: async () => ({
          status: 'refreshed' as const,
          acquired: refreshedAcquired,
        }),
      }),
      parser: parserThatFailsAfterFirstImport(),
    });

    await importAndEvaluate(user);
    await user.click(screen.getByTestId('refresh-snapshot-button'));

    await waitFor(() => {
      expect(screen.getByTestId('import-invalid-status')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('health-dashboard')).toBeNull();
    expect(screen.queryByTestId('composite-health')).toBeNull();
  });

  it('recovers via reselect after file-input needs-reselect', async () => {
    const user = userEvent.setup();
    let refreshCalls = 0;

    renderImportApp({
      acquisition: createAcquisition({
        selectWorkbook: async () => fileInputAcquired,
        refresh: async () => {
          refreshCalls += 1;
          if (refreshCalls === 1) {
            return {
              status: 'needs-reselect' as const,
              reason: 'File input tier requires user reselection',
            };
          }
          return { status: 'refreshed' as const, acquired: refreshedAcquired };
        },
      }),
      parser: createFakeWorkbookParser(buildParsedWorkbook()),
    });

    await importAndEvaluate(user);
    await user.click(screen.getByTestId('refresh-snapshot-button'));
    await waitFor(() => expect(screen.getByTestId('reselect-workbook-button')).toBeEnabled());

    await user.click(screen.getByTestId('reselect-workbook-button'));
    await waitFor(() => expect(screen.getByTestId('evaluate-button')).toBeEnabled());
    await user.click(screen.getByTestId('evaluate-button'));
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
  });

  it('recovers to bundled Sample B after refresh failure', async () => {
    const user = userEvent.setup();

    renderImportApp({
      acquisition: createAcquisition({
        refresh: async () => ({
          status: 'refreshed' as const,
          acquired: refreshedAcquired,
        }),
      }),
      parser: parserThatFailsAfterFirstImport(),
    });

    await importAndEvaluate(user);
    await user.click(screen.getByTestId('refresh-snapshot-button'));
    await waitFor(() => expect(screen.getByTestId('import-invalid-status')).toBeInTheDocument());

    await user.click(screen.getByTestId('project-option-sample-b'));
    expect(screen.getByTestId('integration-checklist')).toBeInTheDocument();
    await user.click(screen.getByTestId('evaluate-button'));
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
    expect(within(screen.getByTestId('composite-health')).getByText('51')).toBeInTheDocument();
    expect(screen.queryByTestId('refresh-snapshot-button')).toBeNull();
  });

  it('does not show refresh controls for bundled sample projects', async () => {
    const user = userEvent.setup();
    renderImportApp({
      acquisition: createAcquisition({}),
      parser: createFakeWorkbookParser(buildParsedWorkbook()),
    });

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('evaluate-button'));
    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('refresh-snapshot-button')).toBeNull();
    expect(screen.queryByTestId('reselect-workbook-button')).toBeNull();
  });
});
