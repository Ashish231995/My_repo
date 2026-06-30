import { describe, expect, it } from 'vitest';
import { SAMPLE_PROJECTS } from '../../src/data/fixtures';
import type { SessionState } from '../../src/domain/model/session';
import { createInitialSession } from '../../src/session/initialSession';
import {
  evaluate,
  requestReset,
  selectProject,
  setPersona,
  toggleSignalGroup,
} from '../../src/session/sessionActions';
import { sessionReducer } from '../../src/session/sessionReducer';

describe('sessionReducer (Phase 1)', () => {
  it('INIT returns Intermediate default session', () => {
    const state = sessionReducer(createInitialSession(), { type: 'INIT' });
    expect(state.persona).toBe('intermediate');
    expect(state.selectedProjectId).toBeNull();
    expect(state.evaluation).toBeNull();
  });

  it('SET_PERSONA updates persona without evaluation', () => {
    const initial = createInitialSession();
    const state = sessionReducer(initial, setPersona('expert'));
    expect(state.persona).toBe('expert');
    expect(state.evaluation).toBeNull();
  });

  it('REQUEST_RESET without evaluation applies immediate reset', () => {
    const dirty = sessionReducer(createInitialSession(), setPersona('expert'));
    const state = sessionReducer(dirty, requestReset());
    expect(state.persona).toBe('intermediate');
    expect(state.selectedProjectId).toBeNull();
    expect(state.ui.resetConfirmOpen).toBe(false);
  });

  it('REQUEST_RESET with evaluation opens confirm dialog only', () => {
    const withEvaluation: SessionState = {
      ...createInitialSession(),
      phase: 'evaluated',
      evaluation: {
        projectId: 'sample-b',
        snapshot: { asOfDate: '2026-06-01', label: 'Snapshot' },
        evaluatedAtSnapshotDate: '2026-06-01',
        dimensions: [],
        composite: {
          eligible: true,
          rawComposite: 51,
          displayComposite: 51,
          classification: 'at-risk',
          contributingDimensionIds: [],
          coverageStatement: '',
          insufficientCoverage: null,
        },
        findings: [],
        recommendations: [],
        evidenceIndex: new Map(),
      },
    };
    const state = sessionReducer(withEvaluation, requestReset());
    expect(state.ui.resetConfirmOpen).toBe(true);
    expect(state.evaluation).not.toBeNull();
  });
});

describe('sessionReducer (Phase 2C — SELECT_PROJECT)', () => {
  it('validates bundled fixture and moves to project-ready', () => {
    const state = sessionReducer(createInitialSession(), selectProject('sample-b'));

    expect(state.phase).toBe('project-ready');
    expect(state.selectedProjectId).toBe('sample-b');
    expect(state.projectLoad?.ok).toBe(true);
  });

  it('loads default-enabled signal groups from fixture', () => {
    const expected = SAMPLE_PROJECTS['sample-b'].signalGroups
      .filter((group) => group.defaultEnabled)
      .map((group) => group.id);

    const state = sessionReducer(createInitialSession(), selectProject('sample-b'));

    expect(state.enabledSignalGroupIds).toEqual(expected);
  });

  it('clears previous evaluation and presentation on project change', () => {
    const ready = sessionReducer(createInitialSession(), selectProject('sample-a'));
    const evaluated = sessionReducer(ready, evaluate());
    const switched = sessionReducer(evaluated, selectProject('sample-b'));

    expect(switched.evaluation).toBeNull();
    expect(switched.presentation).toBeNull();
    expect(switched.phase).toBe('project-ready');
  });

  it('marks unknown project ids invalid', () => {
    const state = sessionReducer(createInitialSession(), selectProject('unknown-project'));

    expect(state.phase).toBe('invalid-project');
    expect(state.selectedProjectId).toBeNull();
    expect(state.projectLoad?.ok).toBe(false);
  });
});

describe('sessionReducer (Phase 2C — EVALUATE)', () => {
  it('does not evaluate without a valid selected project', () => {
    const state = sessionReducer(createInitialSession(), evaluate());

    expect(state.evaluation).toBeNull();
    expect(state.phase).toBe('initial');
  });

  it('runs runEvaluation for project-ready session and stores result', () => {
    const ready = sessionReducer(createInitialSession(), selectProject('sample-b'));
    const state = sessionReducer(ready, evaluate());

    expect(state.phase).toBe('evaluated');
    expect(state.evaluation).not.toBeNull();
    expect(state.evaluation?.projectId).toBe('sample-b');
    expect(state.evaluation?.composite.displayComposite).toBe(51);
    expect(state.evaluation?.composite.classification).toBe('at-risk');
  });

  it('keeps evaluation persona-independent when persona changes', () => {
    const ready = sessionReducer(createInitialSession(), selectProject('sample-b'));
    const evaluated = sessionReducer(ready, evaluate());
    const afterPersona = sessionReducer(evaluated, setPersona('expert'));

    expect(afterPersona.evaluation).toBe(evaluated.evaluation);
    expect(afterPersona.evaluation?.composite.displayComposite).toBe(51);
    expect(afterPersona.presentation).toBeNull();
  });
});

describe('sessionReducer (Phase 3 — TOGGLE_SIGNAL_GROUP)', () => {
  it('toggles only the requested group in enabledSignalGroupIds', () => {
    const ready = sessionReducer(createInitialSession(), selectProject('sample-b'));
    const toggled = sessionReducer(ready, toggleSignalGroup('grp-delivery'));

    expect(toggled.enabledSignalGroupIds).not.toContain('grp-delivery');
    expect(toggled.enabledSignalGroupIds).toContain('grp-schedule');

    const restored = sessionReducer(toggled, toggleSignalGroup('grp-delivery'));
    expect(restored.enabledSignalGroupIds).toContain('grp-delivery');
  });

  it('clears evaluation and presentation while preserving project and persona', () => {
    const ready = sessionReducer(createInitialSession(), selectProject('sample-b'));
    const withPersona = sessionReducer(ready, setPersona('expert'));
    const evaluated = sessionReducer(withPersona, evaluate());
    const toggled = sessionReducer(evaluated, toggleSignalGroup('grp-delivery'));

    expect(toggled.selectedProjectId).toBe('sample-b');
    expect(toggled.persona).toBe('expert');
    expect(toggled.evaluation).toBeNull();
    expect(toggled.presentation).toBeNull();
    expect(toggled.phase).toBe('project-ready');
  });

  it('does not automatically evaluate after toggling', () => {
    const ready = sessionReducer(createInitialSession(), selectProject('sample-b'));
    const toggled = sessionReducer(ready, toggleSignalGroup('grp-team'));

    expect(toggled.evaluation).toBeNull();
    expect(toggled.phase).toBe('project-ready');
  });
});
