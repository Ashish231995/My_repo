import readXlsxFile from 'read-excel-file/browser';
import type { WorkbookParserPort } from './WorkbookParserPort.js';
import { mapSheetsToParsedWorkbook } from './mapSheetsToParsedWorkbook.js';
import type { ParsedWorkbook } from './types.js';

export function createBrowserReadExcelFileParser(): WorkbookParserPort {
  return {
    async parse(bytes: ArrayBuffer): Promise<ParsedWorkbook> {
      const sheets = await readXlsxFile(bytes);
      return mapSheetsToParsedWorkbook(sheets);
    },
  };
}
