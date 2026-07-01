import { CONTRACT_SHEET_HEADERS, REQUIRED_WORKSHEETS } from './sheetHeaders.js';
import type { ParsedCell, ParsedRow, ParsedSheet, ParsedWorkbook, WorksheetName } from './types.js';

function formatIsoDate(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDisplayValue(raw: unknown): string {
  if (raw instanceof Date) {
    return formatIsoDate(raw);
  }
  return String(raw).trim();
}

function toRawValue(raw: unknown): unknown {
  if (raw instanceof Date) {
    return formatIsoDate(raw);
  }
  return raw;
}

function mapSheet(name: WorksheetName, data: unknown[][]): ParsedSheet {
  const expectedHeaders = [...CONTRACT_SHEET_HEADERS[name]];
  const headers: Record<string, number> = Object.fromEntries(
    expectedHeaders.map((header, index) => [header, index + 1]),
  );
  const rows: ParsedRow[] = [];

  if (data.length === 0) {
    return { name, rows, headers };
  }

  const headerRow = data[0] ?? [];
  const headerCells: ParsedCell[] = expectedHeaders.map((columnName, colIndex) => ({
    rowIndex: 1,
    columnIndex: colIndex + 1,
    columnName,
    rawValue: headerRow[colIndex] ?? columnName,
    displayValue: toDisplayValue(headerRow[colIndex] ?? columnName),
  }));
  rows.push({ rowIndex: 1, cells: headerCells });

  for (let rowOffset = 1; rowOffset < data.length; rowOffset += 1) {
    const rowData = data[rowOffset] ?? [];
    const rowIndex = rowOffset + 1;
    const cells: ParsedCell[] = [];

    for (let colIndex = 0; colIndex < expectedHeaders.length; colIndex += 1) {
      const raw = rowData[colIndex];
      if (raw === undefined || raw === null || raw === '') {
        continue;
      }
      const columnName = expectedHeaders[colIndex];
      const rawValue = toRawValue(raw);
      cells.push({
        rowIndex,
        columnIndex: colIndex + 1,
        columnName,
        rawValue,
        displayValue: toDisplayValue(rawValue),
      });
    }

    if (cells.length > 0) {
      rows.push({ rowIndex, cells });
    }
  }

  return { name, rows, headers };
}

export function mapSheetsToParsedWorkbook(
  sheets: ReadonlyArray<{ sheet: string; data: unknown[][] }>,
): ParsedWorkbook {
  const mapped: Partial<Record<WorksheetName, ParsedSheet>> = {};

  for (const sheetName of REQUIRED_WORKSHEETS) {
    const input = sheets.find((sheet) => sheet.sheet === sheetName);
    if (input) {
      mapped[sheetName] = mapSheet(sheetName, input.data);
    }
  }

  return {
    sheets: mapped as Record<WorksheetName, ParsedSheet>,
    parseWarnings: [],
  };
}
