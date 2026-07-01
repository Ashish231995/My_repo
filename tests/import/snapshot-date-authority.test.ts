import { describe, expect, it } from 'vitest';
import { MAPPING_REGISTRY, RULE_CATALOGS } from '../../src/data/fixtures';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { validateImportedProject } from '../../src/import/validation/validateImportedProject';
import { normalizeImportedWorkbook } from '../../src/import/normalization/normalizeImportedWorkbook';
import { buildMilestoneRecoveryWorkbook } from './helpers/parsedWorkbookBuilders';
import { createFakeWorkbookParser } from './fakeWorkbookParser';
import { loadImportedProject } from '../../src/import/orchestration/loadImportedProject';

describe('snapshot.asOfDate authority (BR-004) and REC-002 timing', () => {
  const meta = {
    filename: 'synthetic.xlsx',
    lastModifiedMs: 1_700_000_000_000,
    acquisitionMethod: 'file-input' as const,
    fileHandle: null,
    lastKnownFile: null,
  };

  async function evaluateSynthetic(asOfDate: string, milestoneDueDate: string) {
    const workbook = buildMilestoneRecoveryWorkbook(asOfDate, milestoneDueDate);
    const parser = createFakeWorkbookParser(workbook);
    const load = await loadImportedProject(new ArrayBuffer(0), meta, {
      parser,
      registry: MAPPING_REGISTRY,
    });
    expect(load.ok).toBe(true);
    if (!load.ok) return null;

    expect(load.project.snapshot.asOfDate).toBe(asOfDate);

    return runEvaluation({
      project: load.project as never,
      enabledSignalGroupIds: new Set(['import-workbook']),
      mappingRegistry: MAPPING_REGISTRY,
      ruleCatalogs: RULE_CATALOGS,
      projectValidator: validateImportedProject,
    });
  }

  it('maps Project.asOfDate to snapshot.asOfDate via normalizeImportedWorkbook', () => {
    const workbook = buildMilestoneRecoveryWorkbook('2026-06-10', '2026-06-20');
    const project = normalizeImportedWorkbook(workbook, {
      filename: 'synthetic.xlsx',
      lastModifiedMs: meta.lastModifiedMs,
    });
    expect(project.snapshot.asOfDate).toBe('2026-06-10');
  });

  it('emits FND-002 / REC-002 when daysUntilDue is within 0–14 (slipDays ≥ 8)', async () => {
    const output = await evaluateSynthetic('2026-06-10', '2026-06-20');
    expect(output?.ok).toBe(true);
    if (output?.ok) {
      expect(output.result.findings.some((f) => f.id === 'FND-002')).toBe(true);
      expect(output.result.recommendations.some((r) => r.id === 'REC-002')).toBe(true);
    }
  });

  it('suppresses FND-002 / REC-002 when snapshot.asOfDate moves milestone outside 14-day window', async () => {
    const output = await evaluateSynthetic('2026-05-01', '2026-06-20');
    expect(output?.ok).toBe(true);
    if (output?.ok) {
      expect(output.result.findings.some((f) => f.id === 'FND-002')).toBe(false);
      expect(output.result.recommendations.some((r) => r.id === 'REC-002')).toBe(false);
    }
  });
});
