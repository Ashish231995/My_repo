# Import Functions Contract

**Feature**: `002-sharepoint-snapshot-import`  
**Layers**: Pure `src/import/` modules + `src/import/controller/` (async) — no React in import core

## Boundary map

| Stage | Module | Primary exports |
|-------|--------|-----------------|
| Acquisition | `src/import/acquisition/` | `WorkbookAcquisitionPort`, `createBrowserWorkbookAcquisition` |
| Parsing | `src/import/parsing/` | `WorkbookParserPort`, `mapSheetsToParsedWorkbook`, `createNodeReadExcelFileParser`, `createBrowserReadExcelFileParser` |
| Validation | `src/import/validation/` | `validateWorkbookContract`, **`validateImportedProject`** |
| Normalization | `src/import/normalization/` | `normalizeImportedWorkbook`, `workbookColumnRegistry` |
| Orchestration | `src/import/orchestration/` | `loadImportedProject` |
| Controller | `src/import/controller/` | `createImportController` |
| Evaluation | `src/domain/evaluation/runEvaluation.ts` | Injects `ProjectValidator`; **no `src/import` imports** |

---

## Dependency direction (mandatory)

```text
features/import-snapshot → import/controller → import/orchestration
import/orchestration → validation, normalization, parsing
import/validation → domain/model types, mapping-registry (data only)
import/normalization → domain/model types, mapping-registry

src/domain/** → MUST NOT import src/import/**
session/sessionReducer.ts → domain, session types only; MUST NOT import src/import/**
session/createSessionReducer({ importedProjectValidator }) → closes over validator; no src/import import in reducer module
SessionProvider / AppProviders → imports validateImportedProject; passes to createSessionReducer
SessionAction payloads → data-only (no functions, ports, File, ArrayBuffer)
```

```typescript
// src/domain/validation/projectValidator.ts (or evaluation.ts)
type ProjectValidator = (
  project: SampleProjectFixture,
  registry: MappingRegistry,
) => ProjectLoadResult;

interface EvaluationInput {
  project: SampleProjectFixture;
  enabledSignalGroupIds: ReadonlySet<string>;
  mappingRegistry: MappingRegistry;
  ruleCatalogs: RuleCatalogs;
  projectValidator?: ProjectValidator; // default: validateProject (001 bundled)
}
```

- **Bundled callers**: omit `projectValidator` → `validateProject` (001 behaviour unchanged).
- **Imported `EVALUATE`**: `createSessionReducer({ importedProjectValidator })` where `SessionProvider` / `AppProviders` passes `validateImportedProject` from `src/import/validation/`.

---

## Acquisition

```typescript
interface WorkbookAcquisitionPort {
  selectWorkbook(): Promise<AcquiredWorkbook | null>;
  refresh(acquired: AcquiredWorkbook): Promise<RefreshWorkbookResult>;
}
```

Refresh rules per ADR-010: file-picker `getFile()` latest bytes; file-input always `needs-reselect`.

**Test doubles**: `tests/import/fakeWorkbookAcquisition.ts` (OI-002 closed).

---

## Parsing

```typescript
interface WorkbookParserPort {
  parse(bytes: ArrayBuffer): Promise<ParsedWorkbook>;
}
```

### Shared mapping (single source of truth)

```typescript
// src/import/parsing/mapSheetsToParsedWorkbook.ts
export function mapSheetsToParsedWorkbook(
  sheets: ReadonlyArray<{ sheet: string; data: unknown[][] }>,
): ParsedWorkbook;
```

### Production adapters (both call shared mapper)

```typescript
// src/import/parsing/createNodeReadExcelFileParser.ts
import readExcelFile from 'read-excel-file/node';

// src/import/parsing/createBrowserReadExcelFileParser.ts
import readExcelFile from 'read-excel-file/browser';
```

**Contract test** (`readExcelFileParser.contract.test.ts`) MUST use `createNodeReadExcelFileParser()` from production — **not** duplicate mapping logic in the test file.

**Browser Web Worker behaviour**: verified by **manual** Edge/Chrome smoke (quickstart MV-008) + `npm run build` bundle check — **not** claimed in jsdom/Vitest.

**Test double**: `tests/import/fakeWorkbookParser.ts`.

---

## Validation

```typescript
function validateWorkbookContract(workbook: ParsedWorkbook): WorkbookValidationResult;

function validateImportedProject(
  project: ImportedSnapshotProject,
  registry: MappingRegistry,
): ProjectLoadResult;
```

`validateImportedProject` lives in **`src/import/validation/`** (import policy). Allows zero `sourceSignals`. Does **not** modify `validateProject`.

---

## Normalization

```typescript
function normalizeImportedWorkbook(
  workbook: ParsedWorkbook,
  meta: { filename: string; lastModifiedMs: number },
): ImportedSnapshotProject;
```

- `Project.asOfDate` from workbook row 2 → `snapshot.asOfDate` (BR-004).
- Malformed dimension cell values become signals excluded at `validateSignal` (BR-003) with visible `exclusionReason` in evidence.

---

## Orchestration (pure async function)

```typescript
async function loadImportedProject(
  bytes: ArrayBuffer,
  meta: ImportedWorkbookReference,
  deps: { parser: WorkbookParserPort; registry: MappingRegistry },
): Promise<ImportLoadResult>;
```

No React, no dispatch.

---

## Import controller (async side effects)

```typescript
interface ImportController {
  requestImport(): Promise<void>;
  requestRefresh(): Promise<void>;
  requestReselect(): Promise<void>;
}

function createImportController(deps: {
  dispatch: Dispatch<SessionAction>;
  getState: () => SessionState;
  acquisition: WorkbookAcquisitionPort;
  parser: WorkbookParserPort;
  load: typeof loadImportedProject;
}): ImportController;
```

**Flow (import)**:

1. Capture `contextToken` from `getState()` (`importRequestId` + `projectMode`).
2. `acquired = await acquisition.selectWorkbook()`.
3. If `acquired === null` (picker cancelled) → **return; no lifecycle dispatch**.
4. If `contextToken` ≠ current state → **discard `acquired`; no dispatch**.
5. `dispatch({ type: 'IMPORT_LOAD_STARTED', requestId: nextId })`.
6. `result = await loadImportedProject(acquired.bytes, acquired.reference, { parser })`.
7. `dispatch(IMPORT_LOAD_SUCCEEDED | IMPORT_LOAD_FAILED)` with same `requestId` (ignored if stale).

**Flow (refresh)** — fail-closed:

1. `dispatch(REFRESH_STARTED { requestId })` — clears displayed evaluation in reducer.
2. `acquisition.refresh` → on file-input tier: `RESELECT_REQUIRED` (no scores).
3. On reload: `REFRESH_SUCCEEDED | REFRESH_FAILED` — **`REFRESH_FAILED` → `import-invalid`, no scores**; recovery via reselect or bundled sample.

Controller tests use `FakeWorkbookAcquisition` + `FakeWorkbookParser`.

---

## Evaluation handoff (sync, in reducer)

```typescript
// Inside createSessionReducer closure — importedProjectValidator supplied by AppProviders
runEvaluation({
  project: state.importContext.normalizedProject,
  enabledSignalGroupIds: new Set(['import-workbook']),
  mappingRegistry: MAPPING_REGISTRY,
  ruleCatalogs: RULE_CATALOGS,
  projectValidator: importedProjectValidator,
});
```

001 `runEvaluation` default path unchanged for bundled fixtures.

---

## Error handling

| Layer | Failure | Reducer phase |
|-------|---------|---------------|
| Picker cancel (`acquired === null`) | — | **No lifecycle action**; context unchanged |
| Context changed while picker open | — | **No lifecycle action**; selection discarded |
| Load structural fail | `IMPORT_LOAD_FAILED` | `import-invalid`; no scores |
| Load success | `IMPORT_LOAD_SUCCEEDED` | `project-ready` |
| Refresh fail | `REFRESH_FAILED` | `import-invalid`; no scores |
| Reselect required (file-input) | `RESELECT_REQUIRED` | no scores; needs-reselect |
| Stale lifecycle action | ignored | unchanged |
| Evaluate | `error` | unexpected post-validation |
