import { expect } from 'vitest';

/** Approved ImportProvenance fields per data-model.md */
export const APPROVED_IMPORT_PROVENANCE_FIELDS = [
  'workbookFilename',
  'worksheet',
  'row',
  'column',
  'mappingOutcome',
  'scoringIncluded',
  'exclusionReason',
] as const;

function isFileSystemFileHandle(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'getFile' in value &&
    typeof (value as FileSystemFileHandle).getFile === 'function'
  );
}

/**
 * Recursively asserts no ArrayBuffer, File, or FileSystemFileHandle leaks into output.
 */
export function assertNoBinaryHandles(value: unknown, path = 'root'): void {
  if (value === null || value === undefined) {
    return;
  }

  if (value instanceof ArrayBuffer) {
    throw new Error(`ArrayBuffer leaked at ${path}`);
  }

  if (typeof File !== 'undefined' && value instanceof File) {
    throw new Error(`File leaked at ${path}`);
  }

  if (isFileSystemFileHandle(value)) {
    throw new Error(`FileSystemFileHandle leaked at ${path}`);
  }

  if (value instanceof Map) {
    for (const [key, entry] of value.entries()) {
      assertNoBinaryHandles(entry, `${path}.Map(${String(key)})`);
    }
    return;
  }

  if (value instanceof Set) {
    let index = 0;
    for (const entry of value.values()) {
      assertNoBinaryHandles(entry, `${path}.Set[${index}]`);
      index += 1;
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertNoBinaryHandles(entry, `${path}[${index}]`));
    return;
  }

  if (typeof value === 'object') {
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      assertNoBinaryHandles(entry, `${path}.${key}`);
    }
  }
}

export function assertImportProvenanceFieldsOnly(provenance: Record<string, unknown>): void {
  const keys = Object.keys(provenance).sort();
  expect(keys).toEqual([...APPROVED_IMPORT_PROVENANCE_FIELDS].sort());
}
