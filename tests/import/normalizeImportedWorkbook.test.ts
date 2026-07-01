import { describe, expect, it } from 'vitest';
import { MAPPING_REGISTRY } from '../../src/data/fixtures';
import { normalizeImportedWorkbook } from '../../src/import/normalization/normalizeImportedWorkbook';
import { workbookColumnRegistry } from '../../src/import/normalization/workbookColumnRegistry';
import { createNodeReadExcelFileParser } from '../../src/import/parsing/createNodeReadExcelFileParser';
import { readWorkbookFixture } from './helpers/workbookFixtures';

describe('workbookColumnRegistry', () => {
  it('covers every contract column with a mappingKey', () => {
    const keys = new Set(Object.values(workbookColumnRegistry).map((entry) => entry.mappingKey));
    expect(keys.has('milestone-slip')).toBe(true);
    expect(keys.has('baseline-health')).toBe(true);
    expect(keys.has('blocker-open')).toBe(true);
    expect(keys.has('engagement-score')).toBe(true);
    expect(keys.has('governance-gap')).toBe(true);
  });
});

describe('normalizeImportedWorkbook', () => {
  const parser = createNodeReadExcelFileParser();
  const meta = { filename: 'complete-v1.xlsx', lastModifiedMs: 1_700_000_000_000 };

  it('maps Schedule.slipDays to milestone-slip mappingKey', async () => {
    const bytes = await readWorkbookFixture('complete-v1.xlsx');
    const workbook = await parser.parse(bytes);
    const project = normalizeImportedWorkbook(workbook, meta);

    const slipSignal = project.sourceSignals.find((s) => s.mappingKey === 'milestone-slip');
    expect(slipSignal).toBeDefined();
    expect(slipSignal?.payload.slipDays).toBe(5);
    expect(MAPPING_REGISTRY['milestone-slip']).toBeDefined();
  });

  it('sets import provenance on each source signal', async () => {
    const bytes = await readWorkbookFixture('complete-v1.xlsx');
    const workbook = await parser.parse(bytes);
    const project = normalizeImportedWorkbook(workbook, meta);

    expect(project.sourceSignals.length).toBeGreaterThan(0);
    for (const signal of project.sourceSignals) {
      expect(signal.provenance.workbookFilename).toBe(meta.filename);
      expect(signal.provenance.worksheet).toBeTruthy();
      expect(signal.provenance.row).toBe(2);
      expect(signal.provenance.column).toBeTruthy();
      expect(signal.provenance.mappingOutcome).toMatch(/^(mapped|failed|unsupported)$/);
    }
  });

  it('sets Project.asOfDate on snapshot metadata (BR-004)', async () => {
    const bytes = await readWorkbookFixture('complete-v1.xlsx');
    const workbook = await parser.parse(bytes);
    const project = normalizeImportedWorkbook(workbook, meta);

    expect(project.snapshot.asOfDate).toBe('2026-06-15');
    expect(project.importMeta.workbookAsOfDate).toBe('2026-06-15');
  });
});
