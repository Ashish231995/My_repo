import { CONTRACT_SHEET_HEADERS, REQUIRED_WORKSHEETS } from '../parsing/sheetHeaders.js';
import type { ParsedCell, ParsedSheet, ParsedWorkbook, WorksheetName } from '../parsing/types.js';
import type { WorkbookValidationResult } from './validationCategories.js';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function failure(
  category: Extract<WorkbookValidationResult, { ok: false }>['category'],
  message: string,
): WorkbookValidationResult {
  return { ok: false, category, messages: [message] };
}

function getRow(sheet: ParsedSheet, rowIndex: number): ParsedCell[] {
  return sheet.rows.find((row) => row.rowIndex === rowIndex)?.cells ?? [];
}

function getCellValue(sheet: ParsedSheet, rowIndex: number, columnName: string): string | undefined {
  const cell = getRow(sheet, rowIndex).find((entry) => entry.columnName === columnName);
  if (!cell) {
    return undefined;
  }
  return cell.displayValue;
}

function hasHeaderRow(sheet: ParsedSheet, worksheet: WorksheetName): boolean {
  const required = CONTRACT_SHEET_HEADERS[worksheet];
  const headerCells = getRow(sheet, 1);
  return required.every((columnName) =>
    headerCells.some((cell) => cell.columnName === columnName && cell.displayValue === columnName),
  );
}

function hasExtraDataRows(sheet: ParsedSheet, worksheet: WorksheetName): boolean {
  const contractColumns = new Set(CONTRACT_SHEET_HEADERS[worksheet]);
  return sheet.rows.some(
    (row) =>
      row.rowIndex >= 3 &&
      row.cells.some((cell) => contractColumns.has(cell.columnName) && cell.displayValue !== ''),
  );
}

export function validateWorkbookContract(workbook: ParsedWorkbook): WorkbookValidationResult {
  for (const worksheet of REQUIRED_WORKSHEETS) {
    if (!workbook.sheets[worksheet]) {
      return failure('missing-worksheet', `Missing required worksheet: ${worksheet}`);
    }
  }

  for (const worksheet of REQUIRED_WORKSHEETS) {
    const sheet = workbook.sheets[worksheet];
    if (!hasHeaderRow(sheet, worksheet)) {
      return failure('missing-header-column', `Missing required header column on ${worksheet}`);
    }
  }

  for (const worksheet of REQUIRED_WORKSHEETS) {
    if (hasExtraDataRows(workbook.sheets[worksheet], worksheet)) {
      return failure('extra-data-rows', `Extra contract data found below row 2 on ${worksheet}`);
    }
  }

  const projectSheet = workbook.sheets.Project;
  const projectRow2 = getRow(projectSheet, 2);
  if (projectRow2.length === 0) {
    return failure('missing-project-row', 'Project row 2 is required');
  }

  const templateVersion = getCellValue(projectSheet, 2, 'templateVersion');
  if (templateVersion !== '1.0') {
    return failure('unsupported-template-version', 'templateVersion must be 1.0 on Project row 2');
  }

  const projectKey = getCellValue(projectSheet, 2, 'projectKey')?.trim() ?? '';
  if (!projectKey) {
    return failure('invalid-project-identity', 'projectKey is required on Project row 2');
  }

  const asOfDate = getCellValue(projectSheet, 2, 'asOfDate') ?? '';
  if (!isValidIsoDate(asOfDate)) {
    return failure('invalid-snapshot-date', 'asOfDate must be a valid ISO date on Project row 2');
  }

  return { ok: true };
}
