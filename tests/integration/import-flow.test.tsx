import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAPPING_REGISTRY } from '../../src/data/fixtures';
import { RULE_CATALOGS } from '../../src/domain/scoring/ruleCatalogs';
import * as runEvaluationModule from '../../src/domain/evaluation/runEvaluation';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { validateImportedProject } from '../../src/import/validation/validateImportedProject';
import { loadImportedProject } from '../../src/import/orchestration/loadImportedProject';
import type { WorkbookParserPort } from '../../src/import/parsing/WorkbookParserPort';
import type { ParsedWorkbook } from '../../src/import/parsing/types';
import { createFakeWorkbookAcquisition } from '../import/fakeWorkbookAcquisition';
import { createFakeWorkbookParser } from '../import/fakeWorkbookParser';
import { buildParsedWorkbook } from '../import/helpers/parsedWorkbookBuilders';
import { renderImportApp } from '../helpers/render-import-app';

const acquired = {
  bytes: new ArrayBuffer(4),
  reference: {
    filename: 'complete-v1.xlsx',
    lastModifiedMs: 1_700_000_000_000,
    acquisitionMethod: 'file-input' as const,
    fileHandle: null,
    lastKnownFile: null,
  },
};

function renderCompleteImportApp() {
  return renderImportApp({
    acquisition: createFakeWorkbookAcquisition(acquired),
    parser: createFakeWorkbookParser(buildParsedWorkbook()),
  });
}

function createDelayedParser(workbook: ParsedWorkbook, delayMs: number): WorkbookParserPort {
  return {
    parse: async () => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return workbook;
    },
  };
}

describe('import flow (US1 MVP — T242)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('imports via controller, evaluates via sync reducer, and shows provenance banner', async () => {
    const user = userEvent.setup();
    renderCompleteImportApp();

    expect(screen.getByTestId('import-snapshot-button')).toBeEnabled();
    expect(screen.queryByTestId('integration-checklist')).toBeNull();

    await user.click(screen.getByTestId('import-snapshot-button'));

    await waitFor(() => {
      expect(screen.getByTestId('evaluate-button')).toBeEnabled();
    });

    expect(screen.queryByTestId('integration-checklist')).toBeNull();
    expect(screen.getByTestId('results-placeholder')).toHaveTextContent(/imported workbook ready/i);

    const evaluateSpy = vi.spyOn(runEvaluationModule, 'runEvaluation');
    await user.click(screen.getByTestId('evaluate-button'));
    expect(evaluateSpy).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('import-provenance-banner')).toBeInTheDocument();

    const banner = screen.getByTestId('import-provenance-banner');
    expect(within(banner).getByText(/complete-v1\.xlsx/i)).toBeInTheDocument();
    expect(within(banner).getByText(/2026-06-15/i)).toBeInTheDocument();
    expect(within(banner).getByText(/not a live sharepoint connection/i)).toBeInTheDocument();

    const measuredStatuses = screen.getAllByRole('status', {
      name: /measurement status: measured/i,
    });
    expect(measuredStatuses).toHaveLength(4);
  });

  it('shows accessible loading state and prevents duplicate import actions', async () => {
    const user = userEvent.setup();
    const selectWorkbook = vi.fn(async () => acquired);

    renderImportApp({
      acquisition: {
        selectWorkbook,
        refresh: async () => ({
          status: 'needs-reselect' as const,
          reason: 'Not configured',
        }),
      },
      parser: createDelayedParser(buildParsedWorkbook(), 200),
    });

    const importButton = screen.getByTestId('import-snapshot-button');
    await user.click(importButton);

    await waitFor(() => {
      expect(screen.getByTestId('import-loading-status')).toBeInTheDocument();
    });
    expect(selectWorkbook).toHaveBeenCalledTimes(1);
    expect(importButton).toBeDisabled();
    expect(importButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('evaluate-button')).toBeDisabled();

    await user.click(importButton);
    expect(selectWorkbook).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByTestId('import-loading-status')).toBeNull();
    });
    expect(screen.getByTestId('import-snapshot-button')).toBeEnabled();
  });

  it('shows workbook provenance in evidence drilldown without raw cell payloads', async () => {
    const user = userEvent.setup();
    renderCompleteImportApp();

    await user.click(screen.getByTestId('import-snapshot-button'));
    await waitFor(() => expect(screen.getByTestId('evaluate-button')).toBeEnabled());
    await user.click(screen.getByTestId('evaluate-button'));

    await user.click(screen.getByTestId('explain-dimension-delivery'));

    const drilldown = screen.getByTestId('evidence-drilldown');
    const deliveryRow = within(drilldown).getByTestId('evidence-row-evidence-Delivery-blockerState');
    expect(deliveryRow.textContent).toMatch(/Worksheet:\s*Delivery/);
    expect(deliveryRow.textContent).toMatch(/Row:\s*2/);
    expect(deliveryRow.textContent).toMatch(/Column:\s*blockerState/);
    expect(deliveryRow.textContent).not.toMatch(/<c r=/);
    expect(deliveryRow.textContent).not.toMatch(/advisory/);
  });

  it('preserves bundled Sample B checklist and evaluation behavior', async () => {
    const user = userEvent.setup();
    renderCompleteImportApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    expect(screen.getByTestId('integration-checklist')).toBeInTheDocument();

    const evaluateSpy = vi.spyOn(runEvaluationModule, 'runEvaluation');
    await user.click(screen.getByTestId('evaluate-button'));
    expect(evaluateSpy).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('import-provenance-banner')).toBeNull();
    expect(within(screen.getByTestId('composite-health')).getByText('51')).toBeInTheDocument();
    expect(within(screen.getByTestId('composite-health')).getByText('At Risk')).toBeInTheDocument();
  });

  it('uses the same evaluation path as golden import-complete for normalized project', async () => {
    const load = await loadImportedProject(acquired.bytes, acquired.reference, {
      parser: createFakeWorkbookParser(buildParsedWorkbook()),
      registry: MAPPING_REGISTRY,
    });
    expect(load.ok).toBe(true);
    if (!load.ok) return;

    const golden = runEvaluation({
      project: load.project,
      enabledSignalGroupIds: new Set(['import-workbook']),
      mappingRegistry: MAPPING_REGISTRY,
      ruleCatalogs: RULE_CATALOGS,
      projectValidator: validateImportedProject,
    });

    expect(golden.ok).toBe(true);
    if (golden.ok) {
      for (const dimension of golden.result.dimensions) {
        expect(dimension.measurementStatus).toBe('measured');
      }
    }
  });
});
