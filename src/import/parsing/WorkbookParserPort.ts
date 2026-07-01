import type { ParsedWorkbook } from './types.js';

export interface WorkbookParserPort {
  parse(bytes: ArrayBuffer): Promise<ParsedWorkbook>;
}
