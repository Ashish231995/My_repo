/** Workbook acquisition types (Feature 002). Expanded in Phase 1. */

export interface ImportedWorkbookReference {
  filename: string;
  lastModifiedMs: number;
  acquisitionMethod: 'file-picker' | 'file-input';
  fileHandle: FileSystemFileHandle | null;
  lastKnownFile: File | null;
}

export interface AcquiredWorkbook {
  bytes: ArrayBuffer;
  reference: ImportedWorkbookReference;
}

export type RefreshWorkbookResult =
  | { status: 'refreshed'; acquired: AcquiredWorkbook }
  | { status: 'needs-reselect'; reason: string };

export interface WorkbookAcquisitionPort {
  selectWorkbook(): Promise<AcquiredWorkbook | null>;
  refresh(acquired: AcquiredWorkbook): Promise<RefreshWorkbookResult>;
}
