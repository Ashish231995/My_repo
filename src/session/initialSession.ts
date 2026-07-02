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
    invalidProject: null,
    evaluation: null,
    presentation: null,
    ui: createEmptyUiState(),
    projectMode: 'none',
    importContext: null,
    importRequestId: 0,
  };
}

/**
 * Reset the session while invalidating any outstanding import/refresh operations.
 * The monotonic `importRequestId` is advanced (never reset to zero) so that late
 * completions from before the reset can never match a post-reset operation.
 */
export function applyReset(previousImportRequestId = 0): SessionState {
  return {
    ...createInitialSession(),
    importRequestId: previousImportRequestId + 1,
  };
}
