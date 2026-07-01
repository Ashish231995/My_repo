# Research: SharePoint-Synced Project Snapshot Import

**Feature**: `002-sharepoint-snapshot-import`  
**Date**: 2026-07-01 (remediated 2026-07-01 — ADR-009 revision)  
**Phase**: 0 — Outline & Research  
**Baseline**: Extends completed `001-pm-copilot-demo` (Demonstration Rule Catalog v1.0 APPROVED)

## Research Tasks

| Task | Outcome |
|------|---------|
| Evaluate browser-compatible `.xlsx` parsing libraries | **ADR-009** — `read-excel-file@9.2.0` (MIT) behind parser port |
| Compare file acquisition patterns for refresh | **ADR-010** — File System Access refresh vs file-input reselect |
| Confirm zero persistence / zero runtime network for import path | No storage APIs; parser bundled; no CDN at runtime |
| Define import evaluation profile vs bundled `validateProject` | **ADR-011** — import-only profile; 001 bundled unchanged |
| Preserve 001 golden tests unchanged | Import code isolated; no edits to 001 scoring contracts |
| Workbook test fixtures | **OI-001 resolved** — `tests/fixtures/workbooks/README.md` manifest |
| Vitest parser testing | **OI-003 resolved** — Node entry contract tests + injected port for orchestration |

---

## ADR-009: Excel Parsing Dependency — `read-excel-file@9.2.0`

**Decision**: Pin **`read-excel-file@9.2.0`** (MIT) as the sole Excel parsing dependency, isolated behind async `WorkbookParserPort` in `src/import/parsing/`. Pin exact version in `package.json` during implementation.

### Version comparison (5.8.8 vs 9.2.0)

| Criterion | `5.8.8` (May 2024) | `9.2.0` (Jun 2026) | Selection |
|-----------|-------------------|-------------------|-----------|
| **Maintenance** | Superseded line | Current npm release | **9.2.0** |
| **License** | MIT | MIT | Tie |
| **Browser entry** | `read-excel-file/browser`; Web Workers | Same; `/browser` uses Web Workers | Tie |
| **Node entry** | `read-excel-file/node` | `read-excel-file/node`; `unzipper-esm` (9.2.0) fixes Vite bundler dynamic-`require` issues | **9.2.0** |
| **API shape** | Legacy default `readXlsxFile` | `readSheet` / default `readExcelFile` returns `{ sheet, data }[]` for all sheets | **9.2.0** (multi-sheet contract) |
| **Async** | Async read | Async read | Tie |
| **TypeScript** | Included | Included; 9.x type renames (`ParseSheetData*`); Node 18+ | **9.2.0** |
| **Vitest** | `/node` in jsdom/node pool | `/node` — no Web Worker in contract tests | **9.2.0** |
| **Vite 8** | Works; older unzipper bundling quirks reported | 9.2.0 explicitly addresses bundler compatibility | **9.2.0** |
| **Bundle size** | Prior plan cited ~26 KB min prebuilt bundle (5.x); **not re-used as 9.x estimate** | Unpacked npm package ~1.2 MB; **app bundle impact MUST be measured at implementation** (`vite build` output) | Document at build time |

**Rejected pin `5.8.8`**: Superseded API; no concrete Vite/Vitest/Edge incompatibility for 9.2.0; 9.2.0 preferred per project policy unless documented blocker — none found.

### Adapter API (9.2.0)

**Production (browser bundle only)** — `src/import/parsing/readExcelFileParser.ts`:

```typescript
import readExcelFile from 'read-excel-file/browser';

export async function parseWorkbookBytes(bytes: ArrayBuffer): Promise<ParsedWorkbook> {
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const sheets = await readExcelFile(blob);
  return toParsedWorkbook(sheets); // maps { sheet, data }[] → row-indexed ParsedWorkbook
}
```

**Contract tests (Vitest)** — `tests/import/readExcelFileParser.contract.test.ts`:

```typescript
import readExcelFile from 'read-excel-file/node';
import { readFile } from 'node:fs/promises';

const bytes = await readFile('tests/fixtures/workbooks/complete-v1.xlsx');
const sheets = await readExcelFile(bytes);
// assert sheet names, row 2 cells per tests/fixtures/workbooks/README.md
```

**Port interface**:

```typescript
interface WorkbookParserPort {
  parse(bytes: ArrayBuffer): Promise<ParsedWorkbook>;
}
```

`createBrowserReadExcelFileParser()` and `createNodeReadExcelFileParser()` both call shared `mapSheetsToParsedWorkbook`. Contract tests use the **production** node factory — no duplicated mapping in test files. Orchestration/controller tests inject `FakeWorkbookParser`.

**Rows 3+ detection**: `toParsedWorkbook` assigns **1-based row indices** from each sheet's `data` array. Non-empty contract-column cells at row index ≥ 3 fail structural validation.

**Alternatives considered**:

- **SheetJS `xlsx`**: Rejected — larger bundle, Apache-2.0 CE procurement friction for read-only scope.
- **ExcelJS**: Rejected — write/formatting unused.
- **`read-excel-file@5.8.8`**: Rejected — superseded; weaker Vite bundling story than 9.2.0.
- **Runtime CDN**: Rejected — Constitution II.

**Implementation note**: Dependency documented here; **`package.json` not modified during planning**.

---

## ADR-010: File Acquisition — Handle Refresh vs Reselect Fallback

**Decision**: Two-tier acquisition with **explicit refresh semantics**:

### Tier 1 — File System Access (`showOpenFilePicker`)

- Store `FileSystemFileHandle` in `ImportedWorkbookReference.fileHandle`.
- **Refresh snapshot**: `await fileHandle.getFile()` → read latest bytes from synchronized local file (FR-016, AS-010).
- Updates `lastModifiedMs` from returned `File`.
- No filesystem path displayed or stored.

### Tier 2 — `<input type="file">` fallback

- Store `acquisitionMethod: 'file-input'`; **no** durable handle.
- **Refresh snapshot is not automatic**: `refresh()` returns `{ status: 'needs-reselect', reason: '...' }` immediately.
- UI shows **Reselect workbook**; user must pick the synchronized file again (FR-016, AS-012).
- **Do not** rely on stale cached `File` references for silent refresh — OneDrive-synced content requires a new user selection in this tier.

**Constraints**: No path entry (FR-004); cancellation → no session mutation.

**Alternatives considered**:

- **Cached `File` re-read on fallback**: Rejected — browser does not guarantee updated bytes without reselection; misleading refresh UX.
- **IndexedDB handle persistence**: Rejected — Constitution II.

---

## ADR-011: Import-Only Evaluation Profile

**Decision**: `validateImportedProject` in `src/import/validation/` applies **only** to workbooks that passed `validateWorkbookContract`. It is passed into `runEvaluation` via optional **`ProjectValidator`** injection at the call site — **not** by importing `src/import` inside `src/domain`.

| Rule | Import profile | Bundled `validateProject` (001) |
|------|----------------|----------------------------------|
| Zero `sourceSignals` after valid workbook | **Allowed** → all dimensions **Unmeasured** | **Rejected** (`empty-file`) — unchanged |
| Empty `signalGroups` | N/A — synthetic `import-workbook` group | Must have fixture groups — unchanged |
| Identity + snapshot | Required | Required — unchanged |
| `runEvaluation` scoring path | Same pipeline; `importedProjectValidator` from `createSessionReducer` closure | Default `validateProject` when validator omitted |

**001 guarantee**: `validateProject` implementation and **all 001 golden tests remain unmodified**. Import profile is a **separate function** injected at evaluate time for imported mode only.

**Test fixture**: `tests/fixtures/workbooks/all-dimensions-empty-row2.xlsx` (see manifest).

**Alternatives considered**:

- **Weaken bundled validation**: Rejected — violates baseline preservation.
- **Placeholder signals**: Rejected — BR-002.

---

## ADR-012: Architectural Layering (Import Extension)

Acquire → Parse → ValidateContract → Normalize → (lifecycle dispatch) → sync `EVALUATE` → `runEvaluation`.

Async acquisition/parse/load in **`importController`**; **sync pure** `sessionReducer` applies lifecycle actions with `requestId` stale protection (ADR-015).

---

## ADR-015: Synchronous Pure Session Reducer + Async Import Controller

**Decision**: `sessionReducer` remains synchronous and pure, created via **`createSessionReducer({ importedProjectValidator })`**. `SessionProvider` / `AppProviders` supplies `validateImportedProject`; **`sessionReducer.ts` must not import `src/import/**`**. UI calls `importController.requestImport|requestRefresh|requestReselect`. Controller selects workbook **before** `IMPORT_LOAD_STARTED`; picker cancel or context change → no lifecycle dispatch. Controller dispatches `IMPORT_LOAD_*`, `REFRESH_*`, `RESELECT_REQUIRED` with monotonic `requestId`. Refresh is **fail-closed** — no stale health scores after `REFRESH_FAILED` or `RESELECT_REQUIRED`.

**Rationale**: Keeps 001 reducer testability; isolates I/O; enables stale-result protection when user selects bundled sample during in-flight import.

---

## Privacy & Network Confirmation

Unchanged — parser bundled; no runtime network; no persistence.

---

## Resolved open items

| ID | Resolution |
|----|------------|
| **OI-001** | Authored fixtures under `tests/fixtures/workbooks/` + manifest README with cells, outcomes, SHA-256 column |
| **OI-003** | Node contract tests via production `createNodeReadExcelFileParser` + shared mapper; MV-008 manual Edge/Chrome smoke (not jsdom Web Worker claims) |
| **OI-002** | `FakeWorkbookAcquisition` + `FakeWorkbookParser` in `tests/import/`; used in controller and integration tests |
| **OI-004** | `ProjectValidator` optional on `EvaluationInput`; default `validateProject`; import wiring passes `validateImportedProject` |
