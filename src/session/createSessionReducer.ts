import { INVALID_FIXTURES, MAPPING_REGISTRY, SAMPLE_PROJECTS } from '../data/fixtures';
import { runEvaluation } from '../domain/evaluation/runEvaluation';
import type { SessionAction, SessionState } from '../domain/model/session';
import { projectForPersona } from '../domain/persona/projectForPersona';
import { RULE_CATALOGS } from '../domain/scoring/ruleCatalogs';
import type { ProjectValidator } from '../domain/validation/projectValidator';
import { validateProject } from '../domain/validation/validateProject';
import { applyReset, createInitialSession } from './initialSession';

export interface SessionReducerDeps {
  importedProjectValidator: ProjectValidator;
}

function defaultEnabledGroupIds(projectId: string): string[] {
  const project = SAMPLE_PROJECTS[projectId];
  if (!project) {
    return [];
  }
  return project.signalGroups.filter((group) => group.defaultEnabled).map((group) => group.id);
}

function validateProjectSelection(
  projectId: string,
): { ok: true } | { ok: false; message: string; category: string } {
  const project = SAMPLE_PROJECTS[projectId];
  if (!project) {
    return {
      ok: false,
      message: `Unknown project: ${projectId}`,
      category: 'malformed-structure',
    };
  }
  const load = validateProject(project, MAPPING_REGISTRY);
  if (!load.ok) {
    return {
      ok: false,
      message: load.invalid.message,
      category: load.invalid.category,
    };
  }
  return { ok: true };
}

function evaluateBundledProject(
  state: SessionState,
): SessionState {
  if (
    state.projectMode !== 'bundled' ||
    !state.selectedProjectId ||
    state.phase === 'initial' ||
    state.phase === 'invalid-project'
  ) {
    return state;
  }

  const project = SAMPLE_PROJECTS[state.selectedProjectId];
  if (!project) {
    return state;
  }

  const output = runEvaluation({
    project,
    enabledSignalGroupIds: new Set(state.enabledSignalGroupIds),
    mappingRegistry: MAPPING_REGISTRY,
    ruleCatalogs: RULE_CATALOGS,
  });

  if (!output.ok) {
    return {
      ...state,
      phase: 'error',
      ui: {
        ...state.ui,
        errorMessage: output.error.message,
      },
    };
  }

  return {
    ...state,
    phase: 'evaluated',
    evaluation: output.result,
    presentation: projectForPersona(output.result, state.persona),
    ui: { ...state.ui, errorMessage: null },
  };
}

function evaluateImportedProject(
  state: SessionState,
  importedProjectValidator: ProjectValidator,
): SessionState {
  const project = state.importContext?.normalizedProject;
  if (
    state.projectMode !== 'imported' ||
    !project ||
    state.phase === 'import-loading' ||
    state.phase === 'import-invalid'
  ) {
    return state;
  }

  const output = runEvaluation({
    project,
    enabledSignalGroupIds: new Set(['import-workbook']),
    mappingRegistry: MAPPING_REGISTRY,
    ruleCatalogs: RULE_CATALOGS,
    projectValidator: importedProjectValidator,
  });

  if (!output.ok) {
    return {
      ...state,
      phase: 'error',
      ui: {
        ...state.ui,
        errorMessage: output.error.message,
      },
    };
  }

  return {
    ...state,
    phase: 'evaluated',
    evaluation: output.result,
    presentation: projectForPersona(output.result, state.persona),
    ui: { ...state.ui, errorMessage: null },
  };
}

export function createSessionReducer(deps: SessionReducerDeps) {
  const { importedProjectValidator } = deps;

  return function sessionReducer(state: SessionState, action: SessionAction): SessionState {
    switch (action.type) {
      case 'INIT':
        return createInitialSession();

      case 'IMPORT_LOAD_STARTED':
        return {
          ...state,
          phase: 'import-loading',
          projectMode: 'imported',
          selectedProjectId: null,
          enabledSignalGroupIds: [],
          projectLoad: null,
          invalidProject: null,
          evaluation: null,
          presentation: null,
          importRequestId: action.requestId,
          importContext: {
            workbookRef: null,
            validation: null,
            normalizedProject: null,
            refreshState: 'idle',
            loadState: 'loading',
          },
          ui: { ...state.ui, errorMessage: null },
        };

      case 'IMPORT_LOAD_SUCCEEDED': {
        if (action.requestId !== state.importRequestId) {
          return state;
        }
        return {
          ...state,
          phase: 'project-ready',
          importContext: {
            workbookRef: action.workbookRef,
            validation: null,
            normalizedProject: action.normalizedProject,
            refreshState: 'idle',
            loadState: 'idle',
          },
          evaluation: null,
          presentation: null,
          ui: { ...state.ui, errorMessage: null },
        };
      }

      case 'IMPORT_LOAD_FAILED': {
        if (action.requestId !== state.importRequestId) {
          return state;
        }
        return {
          ...state,
          phase: 'import-invalid',
          evaluation: null,
          presentation: null,
          importContext: {
            workbookRef: state.importContext?.workbookRef ?? null,
            validation: action.validation,
            normalizedProject: null,
            refreshState: 'idle',
            loadState: 'idle',
          },
          ui: { ...state.ui, errorMessage: null },
        };
      }

      case 'REFRESH_STARTED': {
        if (!state.importContext) {
          return state;
        }
        return {
          ...state,
          importRequestId: action.requestId,
          evaluation: null,
          presentation: null,
          importContext: {
            ...state.importContext,
            refreshState: 'refreshing',
          },
        };
      }

      case 'REFRESH_SUCCEEDED': {
        if (action.requestId !== state.importRequestId) {
          return state;
        }
        return {
          ...state,
          phase: 'project-ready',
          evaluation: null,
          presentation: null,
          importContext: {
            workbookRef: action.workbookRef,
            validation: null,
            normalizedProject: action.normalizedProject,
            refreshState: 'idle',
            loadState: 'idle',
          },
          ui: { ...state.ui, errorMessage: null },
        };
      }

      case 'REFRESH_FAILED': {
        if (action.requestId !== state.importRequestId) {
          return state;
        }
        return {
          ...state,
          phase: 'import-invalid',
          evaluation: null,
          presentation: null,
          importContext: {
            workbookRef: state.importContext?.workbookRef ?? null,
            validation: action.validation,
            normalizedProject: null,
            refreshState: 'idle',
            loadState: 'idle',
          },
          ui: { ...state.ui, errorMessage: null },
        };
      }

      case 'RESELECT_REQUIRED': {
        if (action.requestId !== state.importRequestId || !state.importContext) {
          return state;
        }
        return {
          ...state,
          evaluation: null,
          presentation: null,
          importContext: {
            ...state.importContext,
            refreshState: 'needs-reselect',
          },
          ui: { ...state.ui, errorMessage: action.reason },
        };
      }

      case 'SELECT_PROJECT': {
        const nextRequestId = state.importRequestId + 1;
        const project = SAMPLE_PROJECTS[action.projectId];
        if (!project) {
          return {
            ...state,
            phase: 'invalid-project',
            projectMode: 'bundled',
            selectedProjectId: null,
            enabledSignalGroupIds: [],
            importContext: null,
            importRequestId: nextRequestId,
            invalidProject: {
              fixtureId: action.projectId,
              displayName: action.projectId,
              projectKey: null,
              category: 'malformed-structure',
              message: `Unknown project: ${action.projectId}`,
            },
            projectLoad: { ok: false, message: `Unknown project: ${action.projectId}` },
            evaluation: null,
            presentation: null,
            ui: { ...state.ui, errorMessage: null },
          };
        }

        const load = validateProjectSelection(action.projectId);
        if (!load.ok) {
          return {
            ...state,
            phase: 'invalid-project',
            projectMode: 'bundled',
            selectedProjectId: null,
            enabledSignalGroupIds: [],
            importContext: null,
            importRequestId: nextRequestId,
            invalidProject: {
              fixtureId: action.projectId,
              displayName: project.displayName,
              projectKey: project.identity.projectKey?.trim() ? project.identity.projectKey : null,
              category: load.category,
              message: load.message,
            },
            projectLoad: { ok: false, message: load.message },
            evaluation: null,
            presentation: null,
            ui: { ...state.ui, errorMessage: null },
          };
        }

        return {
          ...state,
          phase: 'project-ready',
          projectMode: 'bundled',
          selectedProjectId: action.projectId,
          enabledSignalGroupIds: defaultEnabledGroupIds(action.projectId),
          importContext: null,
          importRequestId: nextRequestId,
          invalidProject: null,
          projectLoad: { ok: true, projectId: action.projectId },
          evaluation: null,
          presentation: null,
          ui: { ...state.ui, errorMessage: null },
        };
      }

      case 'LOAD_INVALID_PROJECT': {
        const project = INVALID_FIXTURES[action.fixtureId];
        if (!project) {
          return {
            ...state,
            phase: 'invalid-project',
            selectedProjectId: null,
            enabledSignalGroupIds: [],
            invalidProject: {
              fixtureId: action.fixtureId,
              displayName: action.fixtureId,
              projectKey: null,
              category: 'malformed-structure',
              message: `Unknown invalid fixture: ${action.fixtureId}`,
            },
            projectLoad: { ok: false, message: `Unknown invalid fixture: ${action.fixtureId}` },
            evaluation: null,
            presentation: null,
            ui: { ...state.ui, errorMessage: null },
          };
        }

        const validation = validateProject(project, MAPPING_REGISTRY);
        if (validation.ok) {
          return state;
        }

        return {
          ...state,
          phase: 'invalid-project',
          selectedProjectId: null,
          enabledSignalGroupIds: [],
          invalidProject: {
            fixtureId: action.fixtureId,
            displayName: project.displayName,
            projectKey: project.identity.projectKey?.trim() ? project.identity.projectKey : null,
            category: validation.invalid.category,
            message: validation.invalid.message,
          },
          projectLoad: { ok: false, message: validation.invalid.message },
          evaluation: null,
          presentation: null,
          ui: { ...state.ui, errorMessage: null },
        };
      }

      case 'EVALUATE':
        if (state.projectMode === 'imported') {
          return evaluateImportedProject(state, importedProjectValidator);
        }
        return evaluateBundledProject(state);

      case 'TOGGLE_SIGNAL_GROUP': {
        if (state.projectMode !== 'bundled' || !state.selectedProjectId) {
          return state;
        }

        const project = SAMPLE_PROJECTS[state.selectedProjectId];
        if (!project?.signalGroups.some((group) => group.id === action.groupId)) {
          return state;
        }

        const enabled = new Set(state.enabledSignalGroupIds);
        if (enabled.has(action.groupId)) {
          enabled.delete(action.groupId);
        } else {
          enabled.add(action.groupId);
        }

        return {
          ...state,
          enabledSignalGroupIds: [...enabled],
          evaluation: null,
          presentation: null,
          phase: 'project-ready',
        };
      }

      case 'SET_PERSONA':
        return {
          ...state,
          persona: action.persona,
          presentation: state.evaluation
            ? projectForPersona(state.evaluation, action.persona)
            : null,
        };

      case 'REQUEST_RESET':
        if (state.evaluation !== null) {
          return {
            ...state,
            ui: {
              ...state.ui,
              resetConfirmOpen: true,
              lastFocusedElementId: action.triggerElementId ?? state.ui.lastFocusedElementId,
            },
          };
        }
        return applyReset(state.importRequestId);

      case 'CONFIRM_RESET':
        return applyReset(state.importRequestId);

      case 'CANCEL_RESET':
        return {
          ...state,
          ui: {
            ...state.ui,
            resetConfirmOpen: false,
          },
        };

      case 'SET_ERROR':
        return {
          ...state,
          phase: 'error',
          evaluation: null,
          presentation: null,
          ui: {
            ...state.ui,
            errorMessage: action.message,
          },
        };

      case 'TOGGLE_EVIDENCE': {
        const expanded = new Set(state.ui.expandedEvidenceIds);
        if (expanded.has(action.evidenceId)) {
          expanded.delete(action.evidenceId);
        } else {
          expanded.add(action.evidenceId);
        }
        return {
          ...state,
          ui: {
            ...state.ui,
            expandedEvidenceIds: expanded,
          },
        };
      }

      case 'TOGGLE_COACH_SECTION': {
        const expanded = new Set(state.ui.expandedCoachSections);
        if (expanded.has(action.sectionId)) {
          expanded.delete(action.sectionId);
        } else {
          expanded.add(action.sectionId);
        }
        return {
          ...state,
          ui: {
            ...state.ui,
            expandedCoachSections: expanded,
          },
        };
      }

      default:
        return state;
    }
  };
}
