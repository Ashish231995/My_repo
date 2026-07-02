import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createBrowserWorkbookAcquisition,
  isSupportedWorkbookFilename,
} from '../../src/import/acquisition/workbookAcquisition';
import type { AcquiredWorkbook } from '../../src/import/acquisition/types';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

type FileSystemAccessWindow = { showOpenFilePicker?: unknown };

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

describe('createBrowserWorkbookAcquisition — production default picker (no injected options)', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'showOpenFilePicker');

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(window, 'showOpenFilePicker', originalDescriptor);
    } else {
      delete (window as FileSystemAccessWindow).showOpenFilePicker;
    }
    vi.restoreAllMocks();
  });

  function spyOnInputCreation(): HTMLInputElement[] {
    const created: HTMLInputElement[] = [];
    const realCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      const el = realCreateElement(tagName);
      if (tagName === 'input') {
        created.push(el as HTMLInputElement);
      }
      return el;
    }) as typeof document.createElement);
    return created;
  }

  it('prefers window.showOpenFilePicker with a single-file .xlsx filter', async () => {
    const bytes = bufferFromBytes([0x50, 0x4b, 0x03, 0x04]);
    const file = new File([bytes], 'complete-v1.xlsx', { type: XLSX_MIME, lastModified: 100 });
    const handle = { getFile: vi.fn(async () => file) } as unknown as FileSystemFileHandle;
    const showOpenFilePicker = vi.fn(
      async (_options?: {
        multiple?: boolean;
        types?: Array<{ accept: Record<string, string[]> }>;
      }) => [handle],
    );
    (window as FileSystemAccessWindow).showOpenFilePicker = showOpenFilePicker;

    const acquisition = createBrowserWorkbookAcquisition();
    const selected = await acquisition.selectWorkbook();

    expect(showOpenFilePicker).toHaveBeenCalledTimes(1);
    const pickerArgs = showOpenFilePicker.mock.calls[0][0];
    expect(pickerArgs?.multiple).toBe(false);
    expect(pickerArgs?.types?.[0]?.accept).toEqual({ [XLSX_MIME]: ['.xlsx'] });
    expect(selected?.reference.acquisitionMethod).toBe('file-picker');
    expect(selected?.reference.fileHandle).toBe(handle);
  });

  it('treats AbortError from showOpenFilePicker as cancellation (null, no state change)', async () => {
    const showOpenFilePicker = vi.fn(async () => {
      throw new DOMException('The user aborted a request.', 'AbortError');
    });
    (window as FileSystemAccessWindow).showOpenFilePicker = showOpenFilePicker;

    const acquisition = createBrowserWorkbookAcquisition();
    const result = await acquisition.selectWorkbook();
    expect(result).toBeNull();
  });

  it('falls back to a hidden file input when File System Access is unavailable and cleans it up', async () => {
    delete (window as FileSystemAccessWindow).showOpenFilePicker;

    const bytes = bufferFromBytes([0x50, 0x4b]);
    const file = new File([bytes], 'complete-v1.xlsx', { type: XLSX_MIME, lastModified: 400 });

    const createdInputs = spyOnInputCreation();
    const acquisition = createBrowserWorkbookAcquisition();
    const promise = acquisition.selectWorkbook();
    await Promise.resolve();

    const input = createdInputs[0];
    expect(input).toBeDefined();
    expect(input.type).toBe('file');
    expect(input.accept).toContain('.xlsx');
    expect(document.body.contains(input)).toBe(true);

    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));

    const selected = await promise;
    expect(selected?.reference.acquisitionMethod).toBe('file-input');
    expect(selected?.reference.lastKnownFile).toBe(file);
    // Temporary input element removed after selection.
    expect(document.body.contains(input)).toBe(false);
  });

  it('hidden file input cancellation resolves to null and removes the element', async () => {
    delete (window as FileSystemAccessWindow).showOpenFilePicker;

    const createdInputs = spyOnInputCreation();
    const acquisition = createBrowserWorkbookAcquisition();
    const promise = acquisition.selectWorkbook();
    await Promise.resolve();

    const input = createdInputs[0];
    expect(input).toBeDefined();
    input.dispatchEvent(new Event('cancel'));

    const result = await promise;
    expect(result).toBeNull();
    expect(document.body.contains(input)).toBe(false);
  });
});
