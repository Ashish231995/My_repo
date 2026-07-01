import { describe, expect, it } from 'vitest';
import { MAPPING_REGISTRY, RULE_CATALOGS } from '../../src/data/fixtures';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { loadImportedProject } from '../../src/import/orchestration/loadImportedProject';
import { validateImportedProject } from '../../src/import/validation/validateImportedProject';
import { createNodeReadExcelFileParser } from '../../src/import/parsing/createNodeReadExcelFileParser';
import { readWorkbookFixture } from '../import/helpers/workbookFixtures';

describe('golden import-complete (AS-001, AS-003)', () => {
  const meta = {
    filename: 'complete-v1.xlsx',
    lastModifiedMs: 1_700_000_000_000,
    acquisitionMethod: 'file-input' as const,
    fileHandle: null,
    lastKnownFile: null,
  };

  it('loads complete-v1.xlsx and evaluates four Measured dimensions with eligible composite', async () => {
    const bytes = await readWorkbookFixture('complete-v1.xlsx');
    const load = await loadImportedProject(bytes, meta, {
      parser: createNodeReadExcelFileParser(),
      registry: MAPPING_REGISTRY,
    });

    expect(load.ok).toBe(true);
    if (!load.ok) return;

    const output = runEvaluation({
      project: load.project as never,
      enabledSignalGroupIds: new Set(['import-workbook']),
      mappingRegistry: MAPPING_REGISTRY,
      ruleCatalogs: RULE_CATALOGS,
      projectValidator: validateImportedProject,
    });

    expect(output.ok).toBe(true);
    if (output.ok) {
      expect(output.result.dimensions).toHaveLength(4);
      for (const dimension of output.result.dimensions) {
        expect(dimension.measurementStatus).toBe('measured');
      }
      expect(output.result.composite.eligible).toBe(true);
      expect(output.result.composite.displayComposite).not.toBeNull();
    }
  });
});
