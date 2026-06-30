import type { SessionState, SessionUiState } from '../domain/model/session';

function createEmptyUiState(): SessionUiState {
  return {
    resetConfirmOpen: false,
    lastFocusedElementId: null,
    errorMessage: null,
    expandedEvidenceIds: new Set<string>(),
    expandedCoachSections: new Set<string>(),
  };
}

export function createInitialSession(): SessionState {
  return {
    sessionId: crypto.randomUUID(),
    persona: 'intermediate',
    phase: 'initial',
    selectedProjectId: null,
    enabledSignalGroupIds: [],
    projectLoad: null,
    evaluation: null,
    presentation: null,
    ui: createEmptyUiState(),
  };
}

export function applyReset(): SessionState {
  return createInitialSession();
}
