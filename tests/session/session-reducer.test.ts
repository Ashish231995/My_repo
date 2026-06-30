import { describe, expect, it } from 'vitest';
import { createInitialSession } from '../../src/session/initialSession';
import { sessionReducer } from '../../src/session/sessionReducer';
import type { SessionState } from '../../src/domain/model/session';
import { setPersona, requestReset } from '../../src/session/sessionActions';

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
