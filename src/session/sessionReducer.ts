import type { SessionAction, SessionState } from '../domain/model/session';
import { applyReset, createInitialSession } from './initialSession';

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'INIT':
      return createInitialSession();

    case 'SET_PERSONA':
      return {
        ...state,
        persona: action.persona,
      };

    case 'REQUEST_RESET':
      if (state.evaluation !== null) {
        return {
          ...state,
          ui: {
            ...state.ui,
            resetConfirmOpen: true,
          },
        };
      }
      return applyReset();

    default:
      return state;
  }
}
