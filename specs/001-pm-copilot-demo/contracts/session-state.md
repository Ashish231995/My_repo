# Session State Contract

**Feature**: `001-pm-copilot-demo`  
**Module**: `src/session/`

## SessionState

```typescript
interface SessionState {
  sessionId: string;
  persona: Persona; // default 'intermediate'
  phase: SessionPhase;
  selectedProjectId: string | null;
  enabledSignalGroupIds: string[];
  projectLoad: ProjectLoadResult | null;
  evaluation: EvaluationResult | null;
  presentation: PersonaPresentation | null;
  ui: SessionUiState;
}

type SessionPhase =
  | 'initial'
  | 'project-ready'      // valid project loaded, not evaluated
  | 'evaluated'
  | 'invalid-project'
  | 'error';

interface SessionUiState {
  resetConfirmOpen: boolean;
  lastFocusedElementId: string | null;
  errorMessage: string | null;
  expandedEvidenceIds: Set<string>; // Expert drilldown
  expandedCoachSections: Set<string>;
}
```

## Actions

| Action | Payload | Reducer behaviour |
|--------|---------|-------------------|
| `INIT` | — | `createInitialSession()` |
| `SELECT_PROJECT` | `projectId` | Load fixture; `validateProject`; set phase |
| `TOGGLE_SIGNAL_GROUP` | `groupId` | Flip enabled; clear evaluation + presentation |
| `SET_PERSONA` | `Persona` | Update persona; re-run `projectForPersona` if evaluation exists |
| `EVALUATE` | — | Run pipeline if `project-ready`; set evaluation + presentation |
| `REQUEST_RESET` | — | If evaluation: open confirm; else `applyReset` |
| `CONFIRM_RESET` | — | `applyReset` |
| `CANCEL_RESET` | — | Close confirm; restore focus id |
| `SET_ERROR` | `message` | phase `error` |
| `TOGGLE_EVIDENCE` | `evidenceId` | UI expansion only |
| `TOGGLE_COACH_SECTION` | `sectionId` | UI expansion only |

## Provider

```typescript
const SessionContext = createContext<{
  state: SessionState;
  dispatch: Dispatch<SessionAction>;
} | null>(null);
```

Single provider at app root. No persistence middleware.

## Reset semantics

| Trigger | Confirmation? | Result |
|---------|---------------|--------|
| Reset button, no evaluation | No | Immediate `applyReset` |
| Reset button, evaluation exists | Yes | Confirm → `applyReset` |
| Full page reload | N/A | Browser reload → `INIT` |

`applyReset` always returns Intermediate default — never "restored preference".

## Signal enable/disable

- Default enabled set from fixture `signalGroups[].defaultEnabled` on project select.
- Toggling clears `evaluation` and `presentation` to avoid stale results.
- Does not re-validate project structure.

## Privacy

Reducer MUST NOT call `localStorage`, `sessionStorage`, `indexedDB`, or `document.cookie`.
