import { describe, expect, it } from 'vitest';
import { MAPPING_REGISTRY } from '../../src/data/fixtures';
import { RULE_CATALOGS } from '../../src/domain/scoring/ruleCatalogs';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { loadImportedProject } from '../../src/import/orchestration/loadImportedProject';
import { normalizeImportedWorkbook } from '../../src/import/normalization/normalizeImportedWorkbook';
import { validateImportedProject } from '../../src/import/validation/validateImportedProject';
import { createNodeReadExcelFileParser } from '../../src/import/parsing/createNodeReadExcelFileParser';
import { readWorkbookFixture } from '../import/helpers/workbookFixtures';

describe('golden import-partial-schedule (AS-005, FR-012)', () => {
  const parser = createNodeReadExcelFileParser();
  const meta = {
    filename: 'partial-schedule.xlsx',
    lastModifiedMs: 1_700_000_000_000,
    acquisitionMethod: 'file-input' as const,
    fileHandle: null,
    lastKnownFile: null,
  };

  it('maps only populated Schedule cells without imputing onTimePercent', async () => {
    const bytes = await readWorkbookFixture('partial-schedule.xlsx');
    const workbook = await parser.parse(bytes);
    const project = normalizeImportedWorkbook(workbook, meta);

    const scheduleSignals = project.sourceSignals.filter(
      (signal) => signal.provenance.worksheet === 'Schedule',
    );
    expect(scheduleSignals).toHaveLength(1);
    expect(scheduleSignals[0]?.mappingKey).toBe('milestone-slip');
    expect(scheduleSignals[0]?.payload).toEqual({ slipDays: 8 });
    expect(scheduleSignals.some((signal) => signal.mappingKey === 'baseline-health')).toBe(false);
  });

  it('evaluates Schedule Partial with 50% coverage and excludes Schedule from composite', async () => {
    const bytes = await readWorkbookFixture('partial-schedule.xlsx');
    const load = await loadImportedProject(bytes, meta, {
      parser,
      registry: MAPPING_REGISTRY,
    });

    expect(load.ok).toBe(true);
    if (!load.ok) return;

    const output = runEvaluation({
      project: load.project,
      enabledSignalGroupIds: new Set(['import-workbook']),
      mappingRegistry: MAPPING_REGISTRY,
      ruleCatalogs: RULE_CATALOGS,
      projectValidator: validateImportedProject,
    });

    expect(output.ok).toBe(true);
    if (!output.ok) return;

    const schedule = output.result.dimensions.find(
      (dimension) => dimension.dimensionId === 'schedule',
    );
    expect(schedule?.measurementStatus).toBe('partial');
    expect(schedule?.coveragePercent).toBe(50);
    expect(schedule?.missingRequiredCanonicalTypes).toContain('schedule.baseline-health');
    expect(schedule?.displayScore).toBe(40);
    expect(schedule?.classification).toBe('critical');

    const measured = output.result.dimensions.filter(
      (dimension) => dimension.measurementStatus === 'measured',
    );
    expect(measured).toHaveLength(3);
    expect(measured.map((dimension) => dimension.dimensionId)).toEqual([
      'delivery',
      'team',
      'risk',
    ]);

    expect(output.result.composite.eligible).toBe(true);
    expect(output.result.composite.displayComposite).toBe(74);
    expect(output.result.composite.classification).toBe('at-risk');
    expect(output.result.composite.contributingDimensionIds).toEqual([
      'delivery',
      'team',
      'risk',
    ]);
    expect(output.result.composite.contributingDimensionIds).not.toContain('schedule');
    expect(output.result.composite.coverageStatement).toMatch(/3 of 4/i);
  });
});
