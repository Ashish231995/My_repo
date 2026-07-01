/** Parser-neutral workbook types (Feature 002). Expanded in Phase 1. */

export type WorksheetName = 'Project' | 'Schedule' | 'Delivery' | 'Team' | 'Risk';

export interface ParsedCell {
  rowIndex: number;
  columnIndex: number;
  columnName: string;
  rawValue: unknown;
  displayValue: string;
}

export interface ParsedRow {
  rowIndex: number;
  cells: ParsedCell[];
}

export interface ParsedSheet {
  name: WorksheetName;
  rows: ParsedRow[];
  headers: Record<string, number>;
}

export interface ParsedWorkbook {
  sheets: Record<WorksheetName, ParsedSheet>;
  parseWarnings: string[];
}
