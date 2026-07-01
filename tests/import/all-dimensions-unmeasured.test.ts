import { describe, expect, it } from 'vitest';
import { MAPPING_REGISTRY } from '../../src/data/fixtures';
import { RULE_CATALOGS } from '../../src/domain/scoring/ruleCatalogs';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { validateImportedProject } from '../../src/import/validation/validateImportedProject';
import { normalizeImportedWorkbook } from '../../src/import/normalization/normalizeImportedWorkbook';
import { createNodeReadExcelFileParser } from '../../src/import/parsing/createNodeReadExcelFileParser';
import { validateWorkbookContract } from '../../src/import/validation/validateWorkbookContract';
import { readWorkbookFixture } from './helpers/workbookFixtures';

describe('all-dimensions-empty-row2.xlsx (ADR-011)', () => {
  const parser = createNodeReadExcelFileParser();
  const meta = { filename: 'all-dimensions-empty-row2.xlsx', lastModifiedMs: 1_700_000_000_000 };

  it('produces zero sourceSignals after normalize', async () => {
    const bytes = await readWorkbookFixture('all-dimensions-empty-row2.xlsx');
    const workbook = await parser.parse(bytes);
    const structural = validateWorkbookContract(workbook);
    expect(structural.ok).toBe(true);

    const project = normalizeImportedWorkbook(workbook, meta);
    expect(project.sourceSignals).toHaveLength(0);
  });

  it('passes validateImportedProject with zero signals (import-only profile)', async () => {
    const bytes = await readWorkbookFixture('all-dimensions-empty-row2.xlsx');
    const workbook = await parser.parse(bytes);
    const project = normalizeImportedWorkbook(workbook, meta);

    const load = validateImportedProject(project, MAPPING_REGISTRY);
    expect(load.ok).toBe(true);
  });

  it('evaluates to all four dimensions Unmeasured without fabricated scores', async () => {
    const bytes = await readWorkbookFixture('all-dimensions-empty-row2.xlsx');
    const workbook = await parser.parse(bytes);
    const project = normalizeImportedWorkbook(workbook, meta);

    const output = runEvaluation({
      project,
      enabledSignalGroupIds: new Set(['import-workbook']),
      mappingRegistry: MAPPING_REGISTRY,
      ruleCatalogs: RULE_CATALOGS,
      projectValidator: validateImportedProject,
    });

    expect(output.ok).toBe(true);
    if (output.ok) {
      for (const dimension of output.result.dimensions) {
        expect(dimension.measurementStatus).toBe('unmeasured');
      }
      expect(output.result.composite.eligible).toBe(false);
    }
  });
});
