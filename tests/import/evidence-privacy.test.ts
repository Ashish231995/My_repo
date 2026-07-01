import { describe, expect, it } from 'vitest';
import { MAPPING_REGISTRY } from '../../src/data/fixtures';
import { RULE_CATALOGS } from '../../src/domain/scoring/ruleCatalogs';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { validateImportedProject } from '../../src/import/validation/validateImportedProject';
import { normalizeImportedWorkbook } from '../../src/import/normalization/normalizeImportedWorkbook';
import { createNodeReadExcelFileParser } from '../../src/import/parsing/createNodeReadExcelFileParser';
import { readWorkbookFixture } from './helpers/workbookFixtures';
import {
  assertImportProvenanceFieldsOnly,
  assertNoBinaryHandles,
} from './helpers/privacyAssertions';

describe('import evidence privacy (FR-014)', () => {
  const parser = createNodeReadExcelFileParser();
  const meta = { filename: 'complete-v1.xlsx', lastModifiedMs: 1_700_000_000_000 };

  it('recursively excludes ArrayBuffer, File, and FileSystemFileHandle from normalized project', async () => {
    const bytes = await readWorkbookFixture('complete-v1.xlsx');
    const workbook = await parser.parse(bytes);
    const project = normalizeImportedWorkbook(workbook, meta);

    expect(() => assertNoBinaryHandles(project)).not.toThrow();
  });

  it('recursively excludes binary handles from evaluation evidence output', async () => {
    const bytes = await readWorkbookFixture('complete-v1.xlsx');
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
      expect(() => assertNoBinaryHandles(output.result)).not.toThrow();
      for (const item of output.result.evidenceIndex.values()) {
        expect(() => assertNoBinaryHandles(item)).not.toThrow();
        expect(item.mapping.provenance.originalSourceTerm).not.toMatch(/<c r=/);
      }
    }
  });

  it('limits import provenance to approved metadata fields only', async () => {
    const bytes = await readWorkbookFixture('complete-v1.xlsx');
    const workbook = await parser.parse(bytes);
    const project = normalizeImportedWorkbook(workbook, meta);

    expect(project.sourceSignals.length).toBeGreaterThan(0);
    for (const signal of project.sourceSignals) {
      assertImportProvenanceFieldsOnly(signal.provenance as Record<string, unknown>);
      expect(signal.provenance.row).toBe(2);
      expect(typeof signal.provenance.column).toBe('string');
      expect(typeof signal.provenance.worksheet).toBe('string');
      expect(signal.provenance.workbookFilename).toBe(meta.filename);
    }
  });
});
