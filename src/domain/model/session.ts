import type { Persona } from './enums';
import type { EvaluationResult, PersonaPresentation } from './evaluation';

export type SessionPhase =
  | 'initial'
  | 'project-ready'
  | 'evaluated'
  | 'invalid-project'
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

export interface SessionState {
  sessionId: string;
  persona: Persona;
  phase: SessionPhase;
  selectedProjectId: string | null;
  enabledSignalGroupIds: string[];
  projectLoad: ProjectLoadResult | null;
  evaluation: EvaluationResult | null;
  presentation: PersonaPresentation | null;
  ui: SessionUiState;
}

export type SessionAction =
  | { type: 'INIT' }
  | { type: 'SELECT_PROJECT'; projectId: string }
  | { type: 'TOGGLE_SIGNAL_GROUP'; groupId: string }
  | { type: 'SET_PERSONA'; persona: Persona }
  | { type: 'EVALUATE' }
  | { type: 'REQUEST_RESET' }
  | { type: 'CONFIRM_RESET' }
  | { type: 'CANCEL_RESET' }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'TOGGLE_EVIDENCE'; evidenceId: string }
  | { type: 'TOGGLE_COACH_SECTION'; sectionId: string };
