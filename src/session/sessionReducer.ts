import { INVALID_FIXTURES, MAPPING_REGISTRY, SAMPLE_PROJECTS } from '../data/fixtures';
import { runEvaluation } from '../domain/evaluation/runEvaluation';
import { projectForPersona } from '../domain/persona/projectForPersona';
import { RULE_CATALOGS } from '../domain/scoring/ruleCatalogs';
import { validateProject } from '../domain/validation/validateProject';
import type { SessionAction, SessionState } from '../domain/model/session';
import { applyReset, createInitialSession } from './initialSession';

function defaultEnabledGroupIds(projectId: string): string[] {
  const project = SAMPLE_PROJECTS[projectId];
  if (!project) {
    return [];
  }
  return project.signalGroups.filter((group) => group.defaultEnabled).map((group) => group.id);
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'INIT':
      return createInitialSession();

    case 'SELECT_PROJECT': {
      const project = SAMPLE_PROJECTS[action.projectId];
      if (!project) {
        return {
          ...state,
          phase: 'invalid-project',
          selectedProjectId: null,
          enabledSignalGroupIds: [],
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
          selectedProjectId: null,
          enabledSignalGroupIds: [],
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
        selectedProjectId: action.projectId,
        enabledSignalGroupIds: defaultEnabledGroupIds(action.projectId),
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

    case 'EVALUATE': {
      if (
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

    case 'TOGGLE_SIGNAL_GROUP': {
      if (!state.selectedProjectId) {
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
      return applyReset();

    case 'CONFIRM_RESET':
      return applyReset();

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
