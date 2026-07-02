import type { Persona } from '../domain/model/enums';
import type {
  ImportedWorkbookReference,
  SessionAction,
  WorkbookValidationSnapshot,
} from '../domain/model/session';
import type { SampleProjectFixture } from '../domain/model/evaluation';

export function init(): SessionAction {
  return { type: 'INIT' };
}

export function selectProject(projectId: string): SessionAction {
  return { type: 'SELECT_PROJECT', projectId };
}

export function loadInvalidProject(fixtureId: string): SessionAction {
  return { type: 'LOAD_INVALID_PROJECT', fixtureId };
}

export function toggleSignalGroup(groupId: string): SessionAction {
  return { type: 'TOGGLE_SIGNAL_GROUP', groupId };
}

export function setPersona(persona: Persona): SessionAction {
  return { type: 'SET_PERSONA', persona };
}

export function evaluate(): SessionAction {
  return { type: 'EVALUATE' };
}

export function requestReset(triggerElementId?: string): SessionAction {
  return { type: 'REQUEST_RESET', triggerElementId };
}

export function confirmReset(): SessionAction {
  return { type: 'CONFIRM_RESET' };
}

export function cancelReset(): SessionAction {
  return { type: 'CANCEL_RESET' };
}

export function setError(message: string): SessionAction {
  return { type: 'SET_ERROR', message };
}

export function toggleEvidence(evidenceId: string): SessionAction {
  return { type: 'TOGGLE_EVIDENCE', evidenceId };
}

export function toggleCoachSection(sectionId: string): SessionAction {
  return { type: 'TOGGLE_COACH_SECTION', sectionId };
}

export function importLoadStarted(requestId: number): SessionAction {
  return { type: 'IMPORT_LOAD_STARTED', requestId };
}

export function importLoadSucceeded(
  requestId: number,
  workbookRef: ImportedWorkbookReference | null,
  normalizedProject: SampleProjectFixture | null,
): SessionAction {
  return { type: 'IMPORT_LOAD_SUCCEEDED', requestId, workbookRef, normalizedProject };
}

export function importLoadFailed(
  requestId: number,
  validation: Extract<WorkbookValidationSnapshot, { ok: false }>,
): SessionAction {
  return { type: 'IMPORT_LOAD_FAILED', requestId, validation };
}

export function refreshStarted(requestId: number): SessionAction {
  return { type: 'REFRESH_STARTED', requestId };
}

export function refreshSucceeded(
  requestId: number,
  workbookRef: ImportedWorkbookReference | null,
  normalizedProject: SampleProjectFixture | null,
): SessionAction {
  return { type: 'REFRESH_SUCCEEDED', requestId, workbookRef, normalizedProject };
}

export function refreshFailed(
  requestId: number,
  validation: Extract<WorkbookValidationSnapshot, { ok: false }>,
): SessionAction {
  return { type: 'REFRESH_FAILED', requestId, validation };
}

export function reselectRequired(requestId: number, reason: string): SessionAction {
  return { type: 'RESELECT_REQUIRED', requestId, reason };
}
