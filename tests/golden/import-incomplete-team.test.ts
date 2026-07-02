import { describe, expect, it } from 'vitest';
import { MAPPING_REGISTRY } from '../../src/data/fixtures';
import { RULE_CATALOGS } from '../../src/domain/scoring/ruleCatalogs';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { loadImportedProject } from '../../src/import/orchestration/loadImportedProject';
import { normalizeImportedWorkbook } from '../../src/import/normalization/normalizeImportedWorkbook';
import { validateImportedProject } from '../../src/import/validation/validateImportedProject';
import { createNodeReadExcelFileParser } from '../../src/import/parsing/createNodeReadExcelFileParser';
import { readWorkbookFixture } from '../import/helpers/workbookFixtures';

describe('golden import-incomplete-team (AS-004, FR-012)', () => {
  const parser = createNodeReadExcelFileParser();
  const meta = {
    filename: 'incomplete-team-empty-row2.xlsx',
    lastModifiedMs: 1_700_000_000_000,
    acquisitionMethod: 'file-input' as const,
    fileHandle: null,
    lastKnownFile: null,
  };

  it('produces no Team dimension signals when Team row 2 is empty', async () => {
    const bytes = await readWorkbookFixture('incomplete-team-empty-row2.xlsx');
    const workbook = await parser.parse(bytes);
    const project = normalizeImportedWorkbook(workbook, meta);

    const teamSignals = project.sourceSignals.filter((signal) =>
      signal.provenance.worksheet === 'Team',
    );
    expect(teamSignals).toHaveLength(0);
    expect(project.sourceSignals.some((signal) => signal.mappingKey === 'engagement-score')).toBe(
      false,
    );
  });

  it('evaluates Team Unmeasured with no fabricated score and excludes Team from composite', async () => {
    const bytes = await readWorkbookFixture('incomplete-team-empty-row2.xlsx');
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

    const measured = output.result.dimensions.filter(
      (dimension) => dimension.measurementStatus === 'measured',
    );
    expect(measured).toHaveLength(3);

    const team = output.result.dimensions.find((dimension) => dimension.dimensionId === 'team');
    expect(team?.measurementStatus).toBe('unmeasured');
    expect(team?.displayScore).toBeNull();
    expect(team?.rawScore).toBeNull();
    expect(team?.classification).toBeNull();
    expect(team?.coveragePercent).toBe(0);

    expect(output.result.composite.eligible).toBe(true);
    expect(output.result.composite.displayComposite).toBe(72);
    expect(output.result.composite.classification).toBe('at-risk');
    expect(output.result.composite.contributingDimensionIds).toEqual([
      'schedule',
      'delivery',
      'risk',
    ]);
    expect(output.result.composite.contributingDimensionIds).not.toContain('team');
    expect(output.result.composite.coverageStatement).toMatch(/3 of 4/i);
  });
});
