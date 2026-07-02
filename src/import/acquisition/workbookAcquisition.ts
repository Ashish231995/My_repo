import type {
  AcquiredWorkbook,
  ImportedWorkbookReference,
  RefreshWorkbookResult,
  WorkbookAcquisitionPort,
} from './types.js';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function isSupportedWorkbookFilename(filename: string): boolean {
  return filename.toLowerCase().endsWith('.xlsx');
}

async function fileToAcquired(
  file: File,
  acquisitionMethod: ImportedWorkbookReference['acquisitionMethod'],
  fileHandle: FileSystemFileHandle | null,
): Promise<AcquiredWorkbook> {
  const bytes = await file.arrayBuffer();
  return {
    bytes,
    reference: {
      filename: file.name,
      lastModifiedMs: file.lastModified,
      acquisitionMethod,
      fileHandle,
      lastKnownFile: acquisitionMethod === 'file-input' ? file : null,
    },
  };
}

interface FileSystemAccessWindow {
  showOpenFilePicker?: (options?: {
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: Array<{ description?: string; accept: Record<string, string[]> }>;
  }) => Promise<FileSystemFileHandle[]>;
}

function isAbortError(error: unknown): boolean {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    return error.name === 'AbortError';
  }
  return Boolean(error && typeof error === 'object' && (error as { name?: string }).name === 'AbortError');
}

function fileSystemAccessAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as FileSystemAccessWindow).showOpenFilePicker === 'function'
  );
}

/** Production File System Access picker (Edge/Chrome). AbortError → cancellation (null). */
async function defaultPickFileHandles(): Promise<FileSystemFileHandle[] | null> {
  const picker = (window as FileSystemAccessWindow).showOpenFilePicker;
  if (!picker) {
    return null;
  }
  try {
    const handles = await picker({
      multiple: false,
      excludeAcceptAllOption: false,
      types: [
        {
          description: 'Excel Workbook (.xlsx)',
          accept: { [XLSX_MIME]: ['.xlsx'] },
        },
      ],
    });
    return handles && handles.length > 0 ? handles : null;
  } catch (error) {
    if (isAbortError(error)) {
      return null;
    }
    throw error;
  }
}

/** Hidden file-input fallback when the File System Access API is unavailable. */
function defaultPickInputFile(): Promise<File | null> {
  return new Promise<File | null>((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = `.xlsx,${XLSX_MIME}`;
    input.multiple = false;
    input.style.display = 'none';

    let settled = false;

    const cleanup = (): void => {
      input.removeEventListener('change', onChange);
      input.removeEventListener('cancel', onCancel);
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };

    const settle = (file: File | null): void => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(file);
    };

    const onChange = (): void => {
      const file = input.files && input.files.length > 0 ? input.files[0] : null;
      settle(file);
    };

    const onCancel = (): void => {
      settle(null);
    };

    input.addEventListener('change', onChange);
    input.addEventListener('cancel', onCancel);

    document.body.appendChild(input);
    input.click();
  });
}

export interface BrowserWorkbookAcquisitionOptions {
  pickFileHandles?: () => Promise<FileSystemFileHandle[] | null>;
  pickInputFile?: () => Promise<File | null>;
}

export function createBrowserWorkbookAcquisition(
  options: BrowserWorkbookAcquisitionOptions = {},
): WorkbookAcquisitionPort {
  async function acquireFromHandles(
    pickFileHandles: () => Promise<FileSystemFileHandle[] | null>,
  ): Promise<AcquiredWorkbook | null> {
    const handles = await pickFileHandles();
    if (!handles || handles.length === 0) {
      return null;
    }
    const handle = handles[0];
    const file = await handle.getFile();
    if (!isSupportedWorkbookFilename(file.name)) {
      return null;
    }
    return fileToAcquired(file, 'file-picker', handle);
  }

  async function acquireFromInput(
    pickInputFile: () => Promise<File | null>,
  ): Promise<AcquiredWorkbook | null> {
    const file = await pickInputFile();
    if (!file) {
      return null;
    }
    if (!isSupportedWorkbookFilename(file.name)) {
      return null;
    }
    return fileToAcquired(file, 'file-input', null);
  }

  return {
    async selectWorkbook(): Promise<AcquiredWorkbook | null> {
      // Injected pickers take priority so unit tests can force a specific tier.
      if (options.pickFileHandles) {
        return acquireFromHandles(options.pickFileHandles);
      }
      if (options.pickInputFile) {
        return acquireFromInput(options.pickInputFile);
      }

      // Production defaults: prefer File System Access, fall back to hidden input.
      if (fileSystemAccessAvailable()) {
        return acquireFromHandles(defaultPickFileHandles);
      }
      return acquireFromInput(defaultPickInputFile);
    },

    async refresh(acquired: AcquiredWorkbook): Promise<RefreshWorkbookResult> {
      if (acquired.reference.acquisitionMethod === 'file-input') {
        return {
          status: 'needs-reselect',
          reason: 'File input tier requires user reselection',
        };
      }

      const handle = acquired.reference.fileHandle;
      if (!handle) {
        return {
          status: 'needs-reselect',
          reason: 'No file handle available for refresh',
        };
      }

      const file = await handle.getFile();
      if (!isSupportedWorkbookFilename(file.name)) {
        return {
          status: 'needs-reselect',
          reason: 'Reselect a valid .xlsx workbook',
        };
      }

      return {
        status: 'refreshed',
        acquired: await fileToAcquired(file, 'file-picker', handle),
      };
    },
  };
}
