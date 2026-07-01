import readXlsxFile from 'read-excel-file/node';
import type { WorkbookParserPort } from './WorkbookParserPort.js';
import { mapSheetsToParsedWorkbook } from './mapSheetsToParsedWorkbook.js';
import type { ParsedWorkbook } from './types.js';

function toNodeBuffer(bytes: ArrayBuffer): Uint8Array {
  const BufferCtor = (globalThis as typeof globalThis & {
    Buffer?: { from(data: ArrayBuffer | Uint8Array): Uint8Array };
  }).Buffer;
  if (!BufferCtor) {
    throw new Error('Node Buffer is required for createNodeReadExcelFileParser');
  }
  return BufferCtor.from(bytes);
}

export function createNodeReadExcelFileParser(): WorkbookParserPort {
  return {
    async parse(bytes: ArrayBuffer): Promise<ParsedWorkbook> {
      const sheets = await readXlsxFile(toNodeBuffer(bytes));
      return mapSheetsToParsedWorkbook(sheets);
    },
  };
}
