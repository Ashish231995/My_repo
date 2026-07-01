import type { MappingRegistry } from '../../data/fixtures/mapping-registry.js';
import { isSupportedWorkbookFilename } from '../acquisition/workbookAcquisition.js';
import type { ImportedWorkbookReference } from '../acquisition/types.js';
import { normalizeImportedWorkbook } from '../normalization/normalizeImportedWorkbook.js';
import type { WorkbookParserPort } from '../parsing/WorkbookParserPort.js';
import type { ImportedSnapshotProject } from '../types.js';
import type { WorkbookValidationResult } from '../validation/validationCategories.js';
import { validateWorkbookContract } from '../validation/validateWorkbookContract.js';

export type ImportLoadResult =
  | { ok: true; project: ImportedSnapshotProject }
  | { ok: false; validation: WorkbookValidationResult };

export async function loadImportedProject(
  bytes: ArrayBuffer,
  meta: ImportedWorkbookReference,
  deps: { parser: WorkbookParserPort; registry: MappingRegistry },
): Promise<ImportLoadResult> {
  if (!isSupportedWorkbookFilename(meta.filename)) {
    return {
      ok: false,
      validation: {
        ok: false,
        category: 'unsupported-file-type',
        messages: ['Select a .xlsx workbook'],
      },
    };
  }

  let workbook;
  try {
    workbook = await deps.parser.parse(bytes);
  } catch {
    return {
      ok: false,
      validation: {
        ok: false,
        category: 'parse-failure',
        messages: ['Workbook could not be parsed'],
      },
    };
  }

  const structural = validateWorkbookContract(workbook);
  if (!structural.ok) {
    return { ok: false, validation: structural };
  }

  const project = normalizeImportedWorkbook(workbook, {
    filename: meta.filename,
    lastModifiedMs: meta.lastModifiedMs,
  });

  return { ok: true, project };
}
