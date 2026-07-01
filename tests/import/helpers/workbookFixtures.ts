import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/workbooks');

export const WORKBOOK_FIXTURE_FILES = [
  'complete-v1.xlsx',
  'incomplete-team-empty-row2.xlsx',
  'partial-schedule.xlsx',
  'all-dimensions-empty-row2.xlsx',
  'invalid-template-version.xlsx',
  'missing-project-row2.xlsx',
  'extra-row3-data.xlsx',
  'malformed-dimension-values.xlsx',
] as const;

export type WorkbookFixtureFile = (typeof WORKBOOK_FIXTURE_FILES)[number];

export async function readWorkbookFixture(name: WorkbookFixtureFile | string): Promise<ArrayBuffer> {
  const buf = await readFile(join(FIXTURE_DIR, name));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

export async function readInvalidNotXlsxFixture(): Promise<ArrayBuffer> {
  return readWorkbookFixture('invalid-not-xlsx.bin');
}
