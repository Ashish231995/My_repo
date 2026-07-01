import type {
  ParsedCell,
  ParsedRow,
  ParsedSheet,
  ParsedWorkbook,
  WorksheetName,
} from '../../../src/import/parsing/types';

export const SHEET_HEADERS: Record<WorksheetName, string[]> = {
  Project: ['templateVersion', 'projectKey', 'projectName', 'asOfDate', 'snapshotLabel'],
  Schedule: ['slipDays', 'milestoneDueDate', 'onTimePercent'],
  Delivery: ['blockerState', 'changeRatePercent', 'trendPercent'],
  Team: ['engagementScore', 'completionPercent'],
  Risk: ['escalationPriority', 'gapPriority'],
};

const COMPLETE_PROJECT_ROW = {
  templateVersion: '1.0',
  projectKey: 'IMPORT-DEMO-001',
  projectName: 'Import Demo Complete',
  asOfDate: '2026-06-15',
  snapshotLabel: '',
};

const COMPLETE_DIMENSION_ROWS: Record<Exclude<WorksheetName, 'Project'>, Record<string, string | number>> = {
  Schedule: { slipDays: 5, milestoneDueDate: '', onTimePercent: 85 },
  Delivery: { blockerState: 'advisory', changeRatePercent: 12, trendPercent: -3 },
  Team: { engagementScore: 72, completionPercent: 90 },
  Risk: { escalationPriority: 'important', gapPriority: 'none' },
};

function cell(
  rowIndex: number,
  columnIndex: number,
  columnName: string,
  value: string | number,
): ParsedCell {
  return {
    rowIndex,
    columnIndex,
    columnName,
    rawValue: value,
    displayValue: String(value),
  };
}

export function buildParsedSheet(
  name: WorksheetName,
  dataRows: Record<string, string | number>[] = [],
): ParsedSheet {
  const headers = SHEET_HEADERS[name];
  const headerRow: ParsedRow = {
    rowIndex: 1,
    cells: headers.map((columnName, index) => cell(1, index + 1, columnName, columnName)),
  };
  const rows: ParsedRow[] = [headerRow];

  for (let i = 0; i < dataRows.length; i++) {
    const record = dataRows[i];
    const rowIndex = i + 2;
    const cells = headers.flatMap((columnName, index) => {
      const value = record[columnName];
      if (value === undefined || value === '') {
        return [];
      }
      return [cell(rowIndex, index + 1, columnName, value)];
    });
    rows.push({ rowIndex, cells });
  }

  const headerMap = Object.fromEntries(headers.map((h, index) => [h, index + 1]));
  return { name, rows, headers: headerMap };
}

export function buildParsedWorkbook(
  overrides: Partial<{
    project: Record<string, string | number>[];
    schedule: Record<string, string | number>[];
    delivery: Record<string, string | number>[];
    team: Record<string, string | number>[];
    risk: Record<string, string | number>[];
  }> = {},
): ParsedWorkbook {
  return {
    sheets: {
      Project: buildParsedSheet('Project', overrides.project ?? [COMPLETE_PROJECT_ROW]),
      Schedule: buildParsedSheet('Schedule', overrides.schedule ?? [COMPLETE_DIMENSION_ROWS.Schedule]),
      Delivery: buildParsedSheet('Delivery', overrides.delivery ?? [COMPLETE_DIMENSION_ROWS.Delivery]),
      Team: buildParsedSheet('Team', overrides.team ?? [COMPLETE_DIMENSION_ROWS.Team]),
      Risk: buildParsedSheet('Risk', overrides.risk ?? [COMPLETE_DIMENSION_ROWS.Risk]),
    },
    parseWarnings: [],
  };
}

export function buildMilestoneRecoveryWorkbook(asOfDate: string, milestoneDueDate: string): ParsedWorkbook {
  return buildParsedWorkbook({
    project: [{ ...COMPLETE_PROJECT_ROW, asOfDate }],
    schedule: [{ slipDays: 10, milestoneDueDate, onTimePercent: 85 }],
  });
}

export function getProjectDisplayValue(workbook: ParsedWorkbook, columnName: string): string | undefined {
  const sheet = workbook.sheets.Project;
  const colIndex = sheet.headers[columnName];
  if (!colIndex) return undefined;
  const row2 = sheet.rows.find((r) => r.rowIndex === 2);
  const match = row2?.cells.find((c) => c.columnIndex === colIndex);
  return match?.displayValue;
}

export function buildParsedSheetWithHeaders(
  name: WorksheetName,
  headers: string[],
  dataRows: Record<string, string | number>[] = [],
): ParsedSheet {
  const headerRow: ParsedRow = {
    rowIndex: 1,
    cells: headers.map((columnName, index) => cell(1, index + 1, columnName, columnName)),
  };
  const rows: ParsedRow[] = [headerRow];

  for (let i = 0; i < dataRows.length; i++) {
    const record = dataRows[i];
    const rowIndex = i + 2;
    const cells = headers.flatMap((columnName, index) => {
      const value = record[columnName];
      if (value === undefined || value === '') {
        return [];
      }
      return [cell(rowIndex, index + 1, columnName, value)];
    });
    rows.push({ rowIndex, cells });
  }

  return {
    name,
    rows,
    headers: Object.fromEntries(headers.map((h, index) => [h, index + 1])),
  };
}

/** Omits one required worksheet to trigger missing-worksheet validation. */
export function buildParsedWorkbookMissingSheet(missing: WorksheetName): ParsedWorkbook {
  const workbook = buildParsedWorkbook();
  const sheets = { ...workbook.sheets };
  delete (sheets as Partial<Record<WorksheetName, ParsedSheet>>)[missing];
  return { sheets: sheets as ParsedWorkbook['sheets'], parseWarnings: [] };
}

/** Replaces a worksheet header row with a subset missing a required column. */
export function buildParsedWorkbookMissingHeader(
  sheetName: WorksheetName,
  omittedHeader: string,
): ParsedWorkbook {
  const workbook = buildParsedWorkbook();
  const headers = SHEET_HEADERS[sheetName].filter((h) => h !== omittedHeader);
  const dataRow =
    sheetName === 'Project'
      ? COMPLETE_PROJECT_ROW
      : COMPLETE_DIMENSION_ROWS[sheetName as Exclude<WorksheetName, 'Project'>];
  const filteredRow = Object.fromEntries(
    Object.entries(dataRow).filter(([key]) => key !== omittedHeader),
  );
  workbook.sheets[sheetName] = buildParsedSheetWithHeaders(sheetName, headers, [filteredRow]);
  return workbook;
}

export function buildParsedWorkbookWithEmptyProjectKey(): ParsedWorkbook {
  return buildParsedWorkbook({
    project: [{ ...COMPLETE_PROJECT_ROW, projectKey: '' }],
  });
}

export function buildParsedWorkbookWithInvalidAsOfDate(): ParsedWorkbook {
  return buildParsedWorkbook({
    project: [{ ...COMPLETE_PROJECT_ROW, asOfDate: 'not-a-date' }],
  });
}
