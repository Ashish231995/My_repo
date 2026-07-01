import { describe, expect, it } from 'vitest';
import { MAPPING_REGISTRY } from '../../src/data/fixtures';
import { RULE_CATALOGS } from '../../src/domain/scoring/ruleCatalogs';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { validateImportedProject } from '../../src/import/validation/validateImportedProject';
import { normalizeImportedWorkbook } from '../../src/import/normalization/normalizeImportedWorkbook';
import { createNodeReadExcelFileParser } from '../../src/import/parsing/createNodeReadExcelFileParser';
import { validateWorkbookContract } from '../../src/import/validation/validateWorkbookContract';
import { readWorkbookFixture } from './helpers/workbookFixtures';

describe('invalid evidence exclusion (BR-003)', () => {
  const parser = createNodeReadExcelFileParser();
  const meta = { filename: 'malformed-dimension-values.xlsx', lastModifiedMs: 1_700_000_000_000 };

  it('passes structural validation for malformed-dimension-values.xlsx', async () => {
    const bytes = await readWorkbookFixture('malformed-dimension-values.xlsx');
    const workbook = await parser.parse(bytes);
    expect(validateWorkbookContract(workbook).ok).toBe(true);
  });

  it('excludes out-of-range engagement-score with visible exclusionReason', async () => {
    const bytes = await readWorkbookFixture('malformed-dimension-values.xlsx');
    const workbook = await parser.parse(bytes);
    const project = normalizeImportedWorkbook(workbook, meta);

    const engagement = project.sourceSignals.find((s) => s.mappingKey === 'engagement-score');
    expect(engagement?.provenance.exclusionReason).toBeTruthy();
    expect(engagement?.provenance.scoringIncluded).toBe(false);
  });

  it('excludes invalid blocker-open enum with visible exclusionReason', async () => {
    const bytes = await readWorkbookFixture('malformed-dimension-values.xlsx');
    const workbook = await parser.parse(bytes);
    const project = normalizeImportedWorkbook(workbook, meta);

    const blocker = project.sourceSignals.find((s) => s.mappingKey === 'blocker-open');
    expect(blocker?.provenance.exclusionReason).toBeTruthy();
    expect(blocker?.provenance.scoringIncluded).toBe(false);
  });

  it('does not fabricate scores for excluded evidence at evaluation', async () => {
    const bytes = await readWorkbookFixture('malformed-dimension-values.xlsx');
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
      const team = output.result.dimensions.find((d) => d.dimensionId === 'team');
      const delivery = output.result.dimensions.find((d) => d.dimensionId === 'delivery');
      expect(team?.measurementStatus).not.toBe('measured');
      expect(delivery?.measurementStatus).not.toBe('measured');
    }
  });
});
