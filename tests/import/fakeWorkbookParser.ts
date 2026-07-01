import type { WorkbookParserPort } from '../../src/import/parsing/WorkbookParserPort.js';
import type { ParsedWorkbook } from '../../src/import/parsing/types.js';

export class FakeWorkbookParser implements WorkbookParserPort {
  constructor(private readonly result: ParsedWorkbook | Error) {}

  async parse(_bytes: ArrayBuffer): Promise<ParsedWorkbook> {
    if (this.result instanceof Error) {
      throw this.result;
    }
    return this.result;
  }
}

export function createFakeWorkbookParser(result: ParsedWorkbook | Error): FakeWorkbookParser {
  return new FakeWorkbookParser(result);
}
