import type {
  AcquiredWorkbook,
  ImportedWorkbookReference,
  RefreshWorkbookResult,
  WorkbookAcquisitionPort,
} from './types.js';

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

export interface BrowserWorkbookAcquisitionOptions {
  pickFileHandles?: () => Promise<FileSystemFileHandle[] | null>;
  pickInputFile?: () => Promise<File | null>;
}

export function createBrowserWorkbookAcquisition(
  options: BrowserWorkbookAcquisitionOptions = {},
): WorkbookAcquisitionPort {
  return {
    async selectWorkbook(): Promise<AcquiredWorkbook | null> {
      if (options.pickFileHandles) {
        const handles = await options.pickFileHandles();
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

      if (options.pickInputFile) {
        const file = await options.pickInputFile();
        if (!file) {
          return null;
        }
        if (!isSupportedWorkbookFilename(file.name)) {
          return null;
        }
        return fileToAcquired(file, 'file-input', null);
      }

      return null;
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
