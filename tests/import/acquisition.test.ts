import { describe, expect, it, vi } from 'vitest';
import {
  createBrowserWorkbookAcquisition,
  isSupportedWorkbookFilename,
} from '../../src/import/acquisition/workbookAcquisition';
import type { AcquiredWorkbook } from '../../src/import/acquisition/types';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function bufferFromBytes(bytes: number[]): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

describe('createBrowserWorkbookAcquisition — extension guard', () => {
  it('isSupportedWorkbookFilename rejects non-.xlsx extensions', () => {
    expect(isSupportedWorkbookFilename('report.bin')).toBe(false);
    expect(isSupportedWorkbookFilename('notes.txt')).toBe(false);
    expect(isSupportedWorkbookFilename('snapshot.xlsx')).toBe(true);
  });

  it('selectWorkbook rejects unsupported extension before reading bytes', async () => {
    const badFile = new File(['not an xlsx'], 'invalid-not-xlsx.bin', { type: 'application/octet-stream' });
    const acquisition = createBrowserWorkbookAcquisition({
      pickInputFile: async () => badFile,
    });

    const result = await acquisition.selectWorkbook();
    expect(result).toBeNull();
  });
});

describe('createBrowserWorkbookAcquisition — picker cancellation', () => {
  it('returns null without side effects when File System Access picker is cancelled', async () => {
    const acquisition = createBrowserWorkbookAcquisition({
      pickFileHandles: async () => null,
    });

    const result = await acquisition.selectWorkbook();
    expect(result).toBeNull();
  });

  it('returns null without side effects when file-input prompt is cancelled', async () => {
    const acquisition = createBrowserWorkbookAcquisition({
      pickInputFile: async () => null,
    });

    const result = await acquisition.selectWorkbook();
    expect(result).toBeNull();
  });
});

describe('createBrowserWorkbookAcquisition — File System Access tier (ADR-010)', () => {
  it('selectWorkbook reads File bytes from handle.getFile()', async () => {
    const initialBytes = bufferFromBytes([0x50, 0x4b, 0x03, 0x04]);
    const getFile = vi.fn(async () =>
      new File([initialBytes], 'complete-v1.xlsx', { type: XLSX_MIME, lastModified: 100 }),
    );
    const handle = { getFile } as FileSystemFileHandle;

    const acquisition = createBrowserWorkbookAcquisition({
      pickFileHandles: async () => [handle],
    });

    const selected = await acquisition.selectWorkbook();
    expect(getFile).toHaveBeenCalledTimes(1);
    expect(selected).not.toBeNull();
    expect(new Uint8Array(selected!.bytes)).toEqual(new Uint8Array(initialBytes));
    expect(selected!.reference.acquisitionMethod).toBe('file-picker');
    expect(selected!.reference.fileHandle).toBe(handle);
    expect(selected!.reference.lastModifiedMs).toBe(100);
  });

  it('refresh calls handle.getFile() again and returns updated bytes/metadata', async () => {
    const initialBytes = bufferFromBytes([1, 2, 3]);
    const refreshedBytes = bufferFromBytes([9, 8, 7]);
    let callCount = 0;
    const getFile = vi.fn(async () => {
      callCount += 1;
      const bytes = callCount === 1 ? initialBytes : refreshedBytes;
      const lastModified = callCount === 1 ? 100 : 250;
      return new File([bytes], 'complete-v1.xlsx', { type: XLSX_MIME, lastModified });
    });
    const handle = { getFile } as FileSystemFileHandle;

    const acquisition = createBrowserWorkbookAcquisition({
      pickFileHandles: async () => [handle],
    });

    const selected = (await acquisition.selectWorkbook()) as AcquiredWorkbook;
    expect(getFile).toHaveBeenCalledTimes(1);

    const refreshResult = await acquisition.refresh(selected);
    expect(getFile).toHaveBeenCalledTimes(2);
    expect(refreshResult.status).toBe('refreshed');
    if (refreshResult.status === 'refreshed') {
      expect(new Uint8Array(refreshResult.acquired.bytes)).toEqual(new Uint8Array(refreshedBytes));
      expect(refreshResult.acquired.reference.lastModifiedMs).toBe(250);
      expect(refreshResult.acquired.reference.fileHandle).toBe(handle);
    }
  });
});

describe('createBrowserWorkbookAcquisition — file-input tier (ADR-010)', () => {
  it('selectWorkbook reads File bytes once on selection', async () => {
    const bytes = bufferFromBytes([0x50, 0x4b]);
    const file = new File([bytes], 'complete-v1.xlsx', { type: XLSX_MIME, lastModified: 300 });
    const arrayBufferSpy = vi.spyOn(file, 'arrayBuffer');

    const acquisition = createBrowserWorkbookAcquisition({
      pickInputFile: async () => file,
    });

    const selected = await acquisition.selectWorkbook();
    expect(arrayBufferSpy).toHaveBeenCalledTimes(1);
    expect(selected?.reference.acquisitionMethod).toBe('file-input');
    expect(selected?.reference.fileHandle).toBeNull();
    expect(selected?.reference.lastKnownFile).toBe(file);
  });

  it('refresh returns needs-reselect and never silently reuses cached File bytes', async () => {
    const bytes = bufferFromBytes([0x50, 0x4b]);
    const file = new File([bytes], 'complete-v1.xlsx', { type: XLSX_MIME, lastModified: 300 });
    const arrayBufferSpy = vi.spyOn(file, 'arrayBuffer');

    const acquisition = createBrowserWorkbookAcquisition({
      pickInputFile: async () => file,
    });

    const selected = (await acquisition.selectWorkbook()) as AcquiredWorkbook;
    arrayBufferSpy.mockClear();

    const refreshResult = await acquisition.refresh(selected);
    expect(refreshResult.status).toBe('needs-reselect');
    if (refreshResult.status === 'needs-reselect') {
      expect(refreshResult.reason).toMatch(/reselect/i);
    }
    expect(arrayBufferSpy).not.toHaveBeenCalled();
  });
});
