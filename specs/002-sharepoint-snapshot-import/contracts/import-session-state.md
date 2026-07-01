# Import Session State Contract

**Feature**: `002-sharepoint-snapshot-import`  
**Extends**: `specs/001-pm-copilot-demo/contracts/session-state.md`  
**Modules**: `src/session/` (pure reducer), `src/import/controller/` (async side effects)

## Design rule: synchronous pure reducer

`sessionReducer` MUST remain **synchronous and pure**. It MUST NOT:

- Call `WorkbookAcquisitionPort`, `WorkbookParserPort`, or `loadImportedProject`
- `await` promises or perform file I/O
- Import from `read-excel-file`
- **Import from `src/import/**`** (including `validateImportedProject`)

All acquisition, byte reading, parsing, validation, and normalization run in **`importController`** (or equivalent orchestration hook) outside the reducer. The controller dispatches **lifecycle result actions** with `requestId` stale-result protection.

`EVALUATE` MAY remain synchronous in the reducer when `importContext.normalizedProject` is already present.

### Reducer factory dependency injection

```typescript
function createSessionReducer(deps: {
  importedProjectValidator: ProjectValidator; // supplied by SessionProvider / AppProviders
}): (state: SessionState, action: SessionAction) => SessionState;
```

- **`SessionProvider` / `AppProviders`** imports `validateImportedProject` from `src/import/validation/` and passes it as `importedProjectValidator` when calling `createSessionReducer`.
- **`sessionReducer.ts`** closes over `importedProjectValidator` at factory time — it does **not** import from `src/import/**`.
- On sync `EVALUATE` (imported mode), the reducer calls `runEvaluation({ …, projectValidator: deps.importedProjectValidator })`.

### SessionAction payloads (data-only)

All `SessionAction` variants MUST carry **serializable data only** (IDs, enums, validation results, normalized project snapshots). Payloads MUST NOT include functions, parser/acquisition ports, or `File` / `ArrayBuffer` handles.

---

## SessionState extensions

```typescript
type ProjectMode = 'none' | 'bundled' | 'imported';

interface SessionState {
  // --- 001 fields (unchanged semantics for bundled mode) ---
  sessionId: string;
  persona: Persona;
  phase: SessionPhase;
  selectedProjectId: string | null;
  enabledSignalGroupIds: string[];
  projectLoad: ProjectLoadResult | null;
  invalidProject: InvalidProjectContext | null;
  evaluation: EvaluationResult | null;
  presentation: PersonaPresentation | null;
  ui: SessionUiState;

  // --- 002 extensions ---
  projectMode: ProjectMode;
  importContext: ImportSessionContext | null;
  importRequestId: number; // monotonic; stale async results ignored when mismatch
}

type SessionPhase =
  | 'initial'
  | 'project-ready'
  | 'evaluated'
  | 'invalid-project'
  | 'import-invalid'
  | 'import-loading'   // async load in flight
  | 'error';
```

## ImportSessionContext

```typescript
interface ImportSessionContext {
  workbookRef: ImportedWorkbookReference | null;
  validation: WorkbookValidationResult | null;
  normalizedProject: ImportedSnapshotProject | null;
  refreshState: 'idle' | 'refreshing' | 'needs-reselect';
  loadState: 'idle' | 'loading';
}
```

---

## UI intent actions (controller entry points — not reducer handlers for async work)

| UI / feature action | Handler |
|---------------------|---------|
| User clicks Import | `importController.requestImport()` |
| User clicks Refresh | `importController.requestRefresh()` |
| User clicks Reselect | `importController.requestReselect()` |
| User cancels file picker | **No dispatch** — current bundled/imported context unchanged |

### Acquisition cancellation and context guards

**Import / reselect flow** (controller):

1. Capture `contextToken` = current `importRequestId` + `projectMode` before opening the picker.
2. `acquired = await acquisition.selectWorkbook()`.
3. If `acquired === null` (user cancelled) → **return without dispatching any lifecycle action**.
4. If `contextToken` no longer matches `getState()` (e.g. user selected a bundled sample while picker was open) → **discard `acquired`; no dispatch**.
5. Only then `dispatch(IMPORT_LOAD_STARTED { requestId })` and proceed with parse/load.

Picker cancellation MUST NOT mutate session state. A returned file MUST NOT be applied after the active context has changed.

---

## Lifecycle actions (pure reducer)

| Action | Payload | Reducer behaviour |
|--------|---------|-------------------|
| `IMPORT_LOAD_STARTED` | `{ requestId }` | `phase: 'import-loading'`; `loadState: 'loading'`; clear prior evaluation; `projectMode: 'imported'`; clear `selectedProjectId`; `enabledSignalGroupIds: []` |
| `IMPORT_LOAD_SUCCEEDED` | `{ requestId, workbookRef, normalizedProject }` | If `requestId !== state.importRequestId` → **no-op** (stale). Else `phase: 'project-ready'`; set context; clear validation error |
| `IMPORT_LOAD_FAILED` | `{ requestId, validation }` | If stale → no-op. Else `phase: 'import-invalid'`; store validation; clear `evaluation` / `presentation`; no scores |
| `REFRESH_STARTED` | `{ requestId }` | If stale → no-op. `refreshState: 'refreshing'`; **clear `evaluation` and `presentation`** (no stale health dashboard) |
| `REFRESH_SUCCEEDED` | `{ requestId, workbookRef, normalizedProject }` | If stale → no-op. Replace normalized project; `phase: 'project-ready'`; `refreshState: 'idle'` |
| `REFRESH_FAILED` | `{ requestId, validation }` | If stale → no-op. **`phase: 'import-invalid'`**; store validation; clear `evaluation` / `presentation`; **no scores**; recovery via reselect workbook or bundled sample |
| `RESELECT_REQUIRED` | `{ requestId, reason }` | If stale → no-op. `refreshState: 'needs-reselect'`; set UI message; **clear `evaluation` and `presentation`** — **no stale health results** |
| `SELECT_PROJECT` | `{ projectId }` | **Increment `importRequestId`**; clear `importContext`; `projectMode: 'bundled'`; then 001 bundled select (BR-005, BR-006) |
| `EVALUATE` | — | Sync: bundled unchanged; imported uses `normalizedProject` + `importedProjectValidator` from `createSessionReducer` closure |
| `INIT` / `applyReset` | — | Clear import context; `importRequestId++`; `projectMode: 'none'` |

**Removed**: `IMPORT_WORKBOOK_SELECTED`, `REFRESH_SNAPSHOT`, `RESELECT_WORKBOOK`, **`IMPORT_CANCELLED`** — replaced by controller acquisition guards (picker cancel = no dispatch) and lifecycle actions above. No in-flight abort UI is planned for v1.

---

## Stale-result protection (BR-005 / late async)

When user selects a bundled sample while import load is in-flight:

1. `SELECT_PROJECT` increments `importRequestId` and clears import context.
2. Controller completes with old `requestId` → reducer ignores `IMPORT_LOAD_SUCCEEDED` / `REFRESH_SUCCEEDED`.
3. Bundled and imported contexts are **never** simultaneously active (`projectMode` is mutually exclusive).

Controller tests MUST prove late success actions do not overwrite bundled selection.

---

## Mode orchestration rules

### Bundled ↔ Imported mutual exclusion (BR-005)

- Exactly one of: `projectMode === 'bundled'` with `selectedProjectId`, or `projectMode === 'imported'` with `importContext`, or `projectMode === 'none'`.
- Never `selectedProjectId` and `normalizedProject` both driving evaluation.

### EVALUATE (imported)

- Reducer calls `runEvaluation` synchronously with `projectValidator: importedProjectValidator` from **`createSessionReducer({ importedProjectValidator })`**.
- `SessionProvider` / `AppProviders` supplies `validateImportedProject`; **`sessionReducer.ts` does not import `src/import/**`**.

### Refresh failure (fail-closed)

- **`REFRESH_STARTED`**: clears displayed evaluation immediately.
- **`RESELECT_REQUIRED`**: no health dashboard scores; user must reselect or choose a bundled sample.
- **`REFRESH_FAILED`**: `phase: 'import-invalid'`; no scores; recovery via **Reselect workbook** or **bundled sample** — never retain prior evaluation scores after a failed refresh.

### TOGGLE_SIGNAL_GROUP

- Only when `projectMode === 'bundled'`.

---

## UI visibility contract

| Surface | `bundled` | `imported` | `import-invalid` | `import-loading` |
|---------|-----------|------------|------------------|------------------|
| Integration checklist | Visible | Hidden | Hidden | Hidden |
| Import provenance banner | Hidden | Visible | Hidden | Hidden |
| Refresh / Reselect | Hidden | Visible / needs-reselect (**no scores**) | Hidden | Hidden |
| Invalid workbook panel | Hidden | Hidden | Visible | Hidden |
| Health dashboard scores | Per phase | Per phase | **Hidden** | **Hidden** |

---

## Privacy

Reducer and controller MUST NOT persist workbook bytes to storage APIs or log cell payloads.
