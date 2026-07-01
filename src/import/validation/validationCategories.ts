export type WorkbookValidationCategory =
  | 'unsupported-file-type'
  | 'unsupported-template-version'
  | 'missing-worksheet'
  | 'missing-header-column'
  | 'missing-project-row'
  | 'invalid-project-identity'
  | 'invalid-snapshot-date'
  | 'extra-data-rows'
  | 'parse-failure';

export interface WorkbookFieldError {
  worksheet?: string;
  column?: string;
  row?: number;
  message: string;
}

export type WorkbookValidationResult =
  | { ok: true }
  | {
      ok: false;
      category: WorkbookValidationCategory;
      messages: string[];
      fieldErrors?: WorkbookFieldError[];
    };
