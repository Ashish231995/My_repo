import { describe, expect, it } from 'vitest';
import { createNodeReadExcelFileParser } from '../../src/import/parsing/createNodeReadExcelFileParser';
import type { WorksheetName } from '../../src/import/parsing/types';
import {
  readWorkbookFixture,
  WORKBOOK_FIXTURE_FILES,
} from './helpers/workbookFixtures';

const EXPECTED_SHEETS: WorksheetName[] = ['Project', 'Schedule', 'Delivery', 'Team', 'Risk'];

describe('createNodeReadExcelFileParser (contract)', () => {
  const parser = createNodeReadExcelFileParser();

  it.each(WORKBOOK_FIXTURE_FILES)('parses %s successfully with five contract worksheets', async (file) => {
    const bytes = await readWorkbookFixture(file);
    const workbook = await parser.parse(bytes);

    expect(workbook.parseWarnings).toEqual([]);
    for (const sheetName of EXPECTED_SHEETS) {
      expect(workbook.sheets[sheetName]).toBeDefined();
      expect(workbook.sheets[sheetName].name).toBe(sheetName);
      expect(workbook.sheets[sheetName].rows.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('maps complete-v1 Project.templateVersion as string "1.0"', async () => {
    const bytes = await readWorkbookFixture('complete-v1.xlsx');
    const workbook = await parser.parse(bytes);
    const project = workbook.sheets.Project;
    const templateCell = project.rows
      .find((row) => row.rowIndex === 2)
      ?.cells.find((c) => c.columnName === 'templateVersion');

    expect(templateCell).toBeDefined();
    expect(templateCell?.rawValue).toBe('1.0');
    expect(typeof templateCell?.rawValue).toBe('string');
  });

  it('maps invalid-template-version Project.templateVersion as string "2.0"', async () => {
    const bytes = await readWorkbookFixture('invalid-template-version.xlsx');
    const workbook = await parser.parse(bytes);
    const templateCell = workbook.sheets.Project.rows
      .find((row) => row.rowIndex === 2)
      ?.cells.find((c) => c.columnName === 'templateVersion');

    expect(templateCell?.rawValue).toBe('2.0');
    expect(typeof templateCell?.rawValue).toBe('string');
  });

  it('maps complete-v1 numeric health fields as numbers', async () => {
    const bytes = await readWorkbookFixture('complete-v1.xlsx');
    const workbook = await parser.parse(bytes);
    const slipCell = workbook.sheets.Schedule.rows
      .find((row) => row.rowIndex === 2)
      ?.cells.find((c) => c.columnName === 'slipDays');

    expect(typeof slipCell?.rawValue).toBe('number');
    expect(slipCell?.rawValue).toBe(5);
  });

  it('reflects incomplete-team-empty-row2 Team headers-only layout', async () => {
    const bytes = await readWorkbookFixture('incomplete-team-empty-row2.xlsx');
    const workbook = await parser.parse(bytes);
    expect(workbook.sheets.Team.rows.every((row) => row.rowIndex === 1)).toBe(true);
  });

  it('reflects extra-row3-data Schedule row 3 slipDays', async () => {
    const bytes = await readWorkbookFixture('extra-row3-data.xlsx');
    const workbook = await parser.parse(bytes);
    const row3Slip = workbook.sheets.Schedule.rows
      .find((row) => row.rowIndex === 3)
      ?.cells.find((c) => c.columnName === 'slipDays');

    expect(row3Slip?.rawValue).toBe(99);
  });
});
