import { describe, expect, it } from 'vitest';
import { MAPPING_REGISTRY } from '../../src/data/fixtures';
import { loadImportedProject } from '../../src/import/orchestration/loadImportedProject';
import { buildParsedWorkbook } from './helpers/parsedWorkbookBuilders';
import { createFakeWorkbookParser } from './fakeWorkbookParser';

describe('loadImportedProject (injected FakeWorkbookParser)', () => {
  const meta = {
    filename: 'complete-v1.xlsx',
    lastModifiedMs: 1_700_000_000_000,
    acquisitionMethod: 'file-input' as const,
    fileHandle: null,
    lastKnownFile: null,
  };

  it('returns normalized project on successful parse → validate → normalize', async () => {
    const workbook = buildParsedWorkbook();
    const parser = createFakeWorkbookParser(workbook);
    const bytes = new ArrayBuffer(8);

    const result = await loadImportedProject(bytes, meta, {
      parser,
      registry: MAPPING_REGISTRY,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.project.snapshot.asOfDate).toBe('2026-06-15');
      expect(result.project.sourceSignals.length).toBeGreaterThan(0);
      expect(result.project.origin).toBe('imported');
    }
  });

  it('returns structural validation failure without calling parser twice', async () => {
    const workbook = buildParsedWorkbook({
      project: [{ templateVersion: '2.0', projectKey: 'IMPORT-DEMO-001', asOfDate: '2026-06-15' }],
    });
    const parser = createFakeWorkbookParser(workbook);

    const result = await loadImportedProject(new ArrayBuffer(8), meta, {
      parser,
      registry: MAPPING_REGISTRY,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.validation.category).toBe('unsupported-template-version');
    }
  });

  it('surfaces parse failures from the parser port', async () => {
    const parser = createFakeWorkbookParser(new Error('parse failed'));

    const result = await loadImportedProject(new ArrayBuffer(8), meta, {
      parser,
      registry: MAPPING_REGISTRY,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.validation.category).toBe('parse-failure');
    }
  });
});
