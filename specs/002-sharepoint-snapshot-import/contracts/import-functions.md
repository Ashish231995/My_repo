# Import Functions Contract

**Feature**: `002-sharepoint-snapshot-import`  
**Layer**: Pure TypeScript under `src/import/` — no React imports

## Boundary map

| Stage | Module | Primary exports |
|-------|--------|-----------------|
| Acquisition | `src/import/acquisition/` | `WorkbookAcquisitionPort`, `createBrowserWorkbookAcquisition` |
| Parsing | `src/import/parsing/` | `WorkbookParserPort`, `createReadExcelFileParser` |
| Validation | `src/import/validation/` | `validateWorkbookContract` |
| Normalization | `src/import/normalization/` | `normalizeImportedWorkbook`, `validateImportedProject` |
| Handoff | `src/import/orchestration/` | `loadImportedProject` |

Evaluation after handoff: **`runEvaluation`** from `src/domain/evaluation/runEvaluation.ts` (001, unchanged).

---

## Acquisition

```typescript
interface WorkbookAcquisitionPort {
  /** Open picker; returns null if user cancels */
  selectWorkbook(): Promise<AcquiredWorkbook | null>;
  /** Re-read bytes per acquisition method (see refresh rules) */
  refresh(acquired: AcquiredWorkbook): Promise<RefreshWorkbookResult>;
}

interface AcquiredWorkbook {
  reference: ImportedWorkbookReference;
  bytes: ArrayBuffer;
}

type RefreshWorkbookResult =
  | { status: 'ok'; bytes: ArrayBuffer; lastModifiedMs: number }
  | { status: 'needs-reselect'; reason: string };
```

### Refresh rules (ADR-010)

| `acquisitionMethod` | `refresh()` behaviour |
|---------------------|----------------------|
| `'file-picker'` (File System Access handle present) | `await fileHandle.getFile()` → read **latest** bytes and `lastModified` |
| `'file-input'` | **Always** `{ status: 'needs-reselect' }` — user must reselect synchronized workbook via file input |

**Rules**:

- `accept` restricts to `.xlsx` / OOXML MIME.
- No path strings stored or displayed.
- Cancellation → no session mutation.
- File-input tier MUST NOT silently reuse a stale `File` for refresh.

---

## Parsing

```typescript
interface WorkbookParserPort {
  parse(bytes: ArrayBuffer): Promise<ParsedWorkbook>;
}

interface ParsedWorkbook {
  sheets: Partial<Record<WorksheetName, ParsedSheet>>;
  parseWarnings: string[];
}
```

**Implementation** — `createReadExcelFileParser()` in `readExcelFileParser.ts`:

```typescript
import readExcelFile from 'read-excel-file/browser';

export function createReadExcelFileParser(): WorkbookParserPort {
  return {
    async parse(bytes: ArrayBuffer): Promise<ParsedWorkbook> {
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const sheetResults = await readExcelFile(blob);
      return mapSheetsToParsedWorkbook(sheetResults);
    },
  };
}
```

`mapSheetsToParsedWorkbook` converts `{ sheet: string; data: unknown[][] }[]` to 1-based row-indexed `ParsedWorkbook`.

**Pinned dependency**: `read-excel-file@9.2.0` — **only** imported in `readExcelFileParser.ts`.

**Test strategy (OI-003)**:

| Test | Parser source |
|------|---------------|
| `readExcelFileParser.contract.test.ts` | `read-excel-file/node` + `tests/fixtures/workbooks/*.xlsx` |
| `loadImportedProject.test.ts` | Injected `FakeWorkbookParser` |
| `import-parser.smoke.test.ts` | `read-excel-file/browser` (one fixture) |

**Invariants**:

- Parse is async (library API).
- Parser MUST NOT call scoring, validation categories, or React.
- Domain/orchestration tests inject `FakeWorkbookParser` — no Web Workers.

---

## Validation

```typescript
function validateWorkbookContract(
  workbook: ParsedWorkbook,
): WorkbookValidationResult;
```

**Input**: Parser-neutral model only.  
**Output**: Deterministic category + messages per `workbook-contract.md`.  
**Side effects**: None.

---

## Normalization

```typescript
function normalizeImportedWorkbook(
  workbook: ParsedWorkbook,
  meta: { filename: string; lastModifiedMs: number },
): ImportedSnapshotProject;
```

**Behaviour**:

- Reads `Project` row 2 for identity and snapshot.
- Emits `ImportedSourceSignal` per populated dimension cell on row 2.
- Attaches `ImportProvenance` on each signal.
- Empty dimension row 2 → no signals for that dimension.
- Uses existing `mappingKey` values from `MAPPING_REGISTRY` — no new keys.

```typescript
function validateImportedProject(
  project: ImportedSnapshotProject,
  registry: MappingRegistry,
): ProjectLoadResult;
```

**Import-only profile (ADR-011)**:

- Allows `sourceSignals.length === 0` (all dimensions **Unmeasured** after evaluation).
- Requires identity + snapshot.
- **Does not modify** bundled `validateProject` in `src/domain/validation/validateProject.ts`.

---

## Orchestration

```typescript
async function loadImportedProject(
  bytes: ArrayBuffer,
  meta: ImportedWorkbookReference,
  deps: {
    parser: WorkbookParserPort;
    registry: MappingRegistry;
  },
): Promise<ImportLoadResult>;

type ImportLoadResult =
  | { ok: true; project: ImportedSnapshotProject }
  | { ok: false; validation: WorkbookValidationResult };
```

Session reducer awaits `loadImportedProject` on `IMPORT_WORKBOOK_SELECTED` and successful `REFRESH_SNAPSHOT`.

---

## Evaluation handoff

```typescript
// Session reducer EVALUATE branch when projectMode === 'imported'
runEvaluation({
  project: importContext.normalizedProject,
  projectOrigin: 'imported',
  enabledSignalGroupIds: new Set(['import-workbook']),
  mappingRegistry: MAPPING_REGISTRY,
  ruleCatalogs: RULE_CATALOGS,
});
```

**001 change surface** (minimal, planned):

- Add optional `projectOrigin` to `EvaluationInput` (default `'bundled'`).
- When `projectOrigin === 'imported'`, call `validateImportedProject`; otherwise **`validateProject` unchanged**.
- **No changes** to dimension scoring, composite, recommendations, or persona projection.

---

## Error handling

| Layer | Failure | UI phase |
|-------|---------|----------|
| Acquisition | Cancel | No change |
| Acquisition | Wrong type | `import-invalid` before parse |
| Parse | Exception | `import-invalid` / `parse-failure` |
| Validate | Structural | `import-invalid` — no scores (FR-008) |
| Normalize | Internal | `error` phase (unexpected) |
| Evaluate | Import project invalid | Should not occur post-validation |

---

## Dependency direction

```text
features/import-snapshot → session → import/orchestration
import/orchestration → validation, normalization, parsing
import/normalization → domain/model, data/fixtures/mapping-registry
domain/evaluation → validateImportedProject | validateProject (001) — NOT import/parsing
```

React features MUST NOT import `read-excel-file` directly.
