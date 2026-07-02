import type { Persona } from './enums';
import type { EvaluationResult, PersonaPresentation, SampleProjectFixture } from './evaluation';

export type ProjectMode = 'none' | 'bundled' | 'imported';

export type SessionPhase =
  | 'initial'
  | 'project-ready'
  | 'evaluated'
  | 'invalid-project'
  | 'import-invalid'
  | 'import-loading'
  | 'error';

export interface SessionUiState {
  resetConfirmOpen: boolean;
  lastFocusedElementId: string | null;
  errorMessage: string | null;
  expandedEvidenceIds: Set<string>;
  expandedCoachSections: Set<string>;
}

export interface ProjectLoadResult {
  ok: boolean;
  projectId?: string;
  message?: string;
}

export interface InvalidProjectContext {
  fixtureId: string;
  displayName: string;
  projectKey: string | null;
  category: string;
  message: string;
}

export interface ImportedWorkbookReference {
  filename: string;
  lastModifiedMs: number;
  acquisitionMethod: 'file-picker' | 'file-input';
  fileHandle: FileSystemFileHandle | null;
  lastKnownFile: File | null;
}

export type WorkbookValidationSnapshot =
  | { ok: true }
  | {
      ok: false;
      category: string;
      messages: string[];
    };

export interface ImportSessionContext {
  workbookRef: ImportedWorkbookReference | null;
  validation: WorkbookValidationSnapshot | null;
  normalizedProject: SampleProjectFixture | null;
  refreshState: 'idle' | 'refreshing' | 'needs-reselect';
  loadState: 'idle' | 'loading';
}

export interface SessionState {
  sessionId: string;
  persona: Persona;
  phase: SessionPhase;
  selectedProjectId: string | null;
  enabledSignalGroupIds: string[];
  projectLoad: ProjectLoadResult | null;
  invalidProject: InvalidProjectContext | null;
  evaluation: EvaluationResult | null;
  presentation: PersonaPresentation | null;
  ui: SessionUiState;
  projectMode: ProjectMode;
  importContext: ImportSessionContext | null;
  importRequestId: number;
}

export type SessionAction =
  | { type: 'INIT' }
  | { type: 'SELECT_PROJECT'; projectId: string }
  | { type: 'LOAD_INVALID_PROJECT'; fixtureId: string }
  | { type: 'TOGGLE_SIGNAL_GROUP'; groupId: string }
  | { type: 'SET_PERSONA'; persona: Persona }
  | { type: 'EVALUATE' }
  | { type: 'REQUEST_RESET'; triggerElementId?: string }
  | { type: 'CONFIRM_RESET' }
  | { type: 'CANCEL_RESET' }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'TOGGLE_EVIDENCE'; evidenceId: string }
  | { type: 'TOGGLE_COACH_SECTION'; sectionId: string }
  | { type: 'IMPORT_LOAD_STARTED'; requestId: number }
  | {
      type: 'IMPORT_LOAD_SUCCEEDED';
      requestId: number;
      workbookRef: ImportedWorkbookReference | null;
      normalizedProject: SampleProjectFixture | null;
    }
  | {
      type: 'IMPORT_LOAD_FAILED';
      requestId: number;
      validation: Extract<WorkbookValidationSnapshot, { ok: false }>;
    }
  | { type: 'REFRESH_STARTED'; requestId: number }
  | {
      type: 'REFRESH_SUCCEEDED';
      requestId: number;
      workbookRef: ImportedWorkbookReference | null;
      normalizedProject: SampleProjectFixture | null;
    }
  | {
      type: 'REFRESH_FAILED';
      requestId: number;
      validation: Extract<WorkbookValidationSnapshot, { ok: false }>;
    }
  | { type: 'RESELECT_REQUIRED'; requestId: number; reason: string };
