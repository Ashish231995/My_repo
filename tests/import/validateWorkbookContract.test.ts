import { describe, expect, it } from 'vitest';
import { createNodeReadExcelFileParser } from '../../src/import/parsing/createNodeReadExcelFileParser';
import { validateWorkbookContract } from '../../src/import/validation/validateWorkbookContract';
import { readWorkbookFixture } from './helpers/workbookFixtures';
import {
  buildParsedWorkbookMissingHeader,
  buildParsedWorkbookMissingSheet,
  buildParsedWorkbookWithEmptyProjectKey,
  buildParsedWorkbookWithInvalidAsOfDate,
} from './helpers/parsedWorkbookBuilders';

describe('validateWorkbookContract (structural — synthetic ParsedWorkbook)', () => {
  it('rejects missing required worksheet with missing-worksheet', () => {
    const result = validateWorkbookContract(buildParsedWorkbookMissingSheet('Risk'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.category).toBe('missing-worksheet');
    }
  });

  it('rejects missing recognized header with missing-header-column', () => {
    const result = validateWorkbookContract(buildParsedWorkbookMissingHeader('Project', 'projectKey'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.category).toBe('missing-header-column');
    }
  });

  it('rejects empty projectKey with invalid-project-identity', () => {
    const result = validateWorkbookContract(buildParsedWorkbookWithEmptyProjectKey());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.category).toBe('invalid-project-identity');
    }
  });

  it('rejects invalid asOfDate with invalid-snapshot-date', () => {
    const result = validateWorkbookContract(buildParsedWorkbookWithInvalidAsOfDate());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.category).toBe('invalid-snapshot-date');
    }
  });
});

describe('validateWorkbookContract (structural — authored binaries)', () => {
  const parser = createNodeReadExcelFileParser();

  async function validateFixture(file: string) {
    const bytes = await readWorkbookFixture(file);
    const workbook = await parser.parse(bytes);
    return validateWorkbookContract(workbook);
  }

  it('accepts complete-v1.xlsx', async () => {
    const result = await validateFixture('complete-v1.xlsx');
    expect(result.ok).toBe(true);
  });

  it('accepts incomplete-team-empty-row2.xlsx (empty Team row 2 is not structural failure)', async () => {
    const result = await validateFixture('incomplete-team-empty-row2.xlsx');
    expect(result.ok).toBe(true);
  });

  it('accepts all-dimensions-empty-row2.xlsx', async () => {
    const result = await validateFixture('all-dimensions-empty-row2.xlsx');
    expect(result.ok).toBe(true);
  });

  it('accepts malformed-dimension-values.xlsx (dimension malformed values are not structural)', async () => {
    const result = await validateFixture('malformed-dimension-values.xlsx');
    expect(result.ok).toBe(true);
  });

  it('rejects invalid-template-version.xlsx with unsupported-template-version', async () => {
    const result = await validateFixture('invalid-template-version.xlsx');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.category).toBe('unsupported-template-version');
    }
  });

  it('rejects missing-project-row2.xlsx with missing-project-row', async () => {
    const result = await validateFixture('missing-project-row2.xlsx');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.category).toBe('missing-project-row');
    }
  });

  it('rejects extra-row3-data.xlsx with extra-data-rows', async () => {
    const result = await validateFixture('extra-row3-data.xlsx');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.category).toBe('extra-data-rows');
    }
  });
});
