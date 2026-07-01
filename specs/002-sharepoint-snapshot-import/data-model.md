# Data Model: SharePoint-Synced Project Snapshot Import

**Feature**: `002-sharepoint-snapshot-import`  
**Date**: 2026-07-01  
**Extends**: `001-pm-copilot-demo/data-model.md`  
**Source**: `spec.md` Workbook Contract v1.0, FR-001–FR-026, BR-001–BR-006

## Overview

Feature 002 adds **import acquisition**, **parser-neutral workbook representation**, **contract validation**, and **import session mode** entities. Evaluation outputs (`EvaluationResult`, `EvidenceItem`, dimension/composite types) are **reused unchanged** from 001.

```text
ImportedWorkbookReference
  → ParsedWorkbook
  → WorkbookValidationResult
  → ImportedSnapshotProject (fixture-shaped)
  → runEvaluation (001 pipeline)
  → EvaluationResult + ImportProvenance on EvidenceItem
```

---

## Project Mode

| Mode | `projectMode` | Active selection | Integration checklist | Evaluation input |
|------|---------------|------------------|----------------------|------------------|
| None | `none` | — | Hidden | — |
| Bundled | `bundled` | `selectedProjectId` (A/B/C) | Visible (FR-023) | Fixture + `enabledSignalGroupIds` |
| Imported | `imported` | `importContext` | Hidden | Normalized project + all import signals enabled |

Mode transitions clear stale `evaluation`, `presentation`, and mode-specific load state (BR-006, FR-023).

---

## Entity Definitions

### ImportedWorkbookReference

In-memory handle to user-selected workbook metadata. **Not a filesystem path.**

| Field | Type | Notes |
|-------|------|-------|
| `filename` | `string` | `File.name` — shown in UI |
| `lastModifiedMs` | `number` | `File.lastModified` |
| `acquisitionMethod` | `'file-picker' \| 'file-input'` | Telemetry-free diagnostic |
| `fileHandle` | `FileSystemFileHandle \| null` | Present when File System Access used; enables `getFile()` refresh |
| `lastKnownFile` | `File \| null` | Optional display metadata only — **not** used for file-input refresh |

Bytes are read on demand into `ArrayBuffer`; not persisted across reload.

---

### ParsedWorkbook (parser-neutral)

Output of `WorkbookParserPort` — no scoring or React types.

| Field | Type | Notes |
|-------|------|-------|
| `sheets` | `Record<WorksheetName, ParsedSheet>` | Keys: `Project`, `Schedule`, `Delivery`, `Team`, `Risk` after parse |
| `parseWarnings` | `string[]` | Non-fatal parser notices |

### ParsedSheet

| Field | Type | Notes |
|-------|------|-------|
| `name` | `WorksheetName` | Case-sensitive |
| `rows` | `ParsedRow[]` | 1-based `rowIndex` |
| `headers` | `Record<string, number>` | Column name → 1-based column index from row 1 |

### ParsedCell

| Field | Type | Notes |
|-------|------|-------|
| `rowIndex` | `number` | 1-based; row 2 = snapshot row |
| `columnIndex` | `number` | 1-based |
| `columnName` | `string` | Contract header name |
| `rawValue` | `unknown` | Parser-native value |
| `displayValue` | `string` | Trimmed string for validation |

---

### WorkbookValidationResult

| Field | Type | Notes |
|-------|------|-------|
| `ok` | `boolean` | Structural gate |
| `category` | `WorkbookValidationCategory` | Deterministic enum — see `contracts/workbook-contract.md` |
| `messages` | `string[]` | User-facing recovery guidance |
| `fieldErrors` | `WorkbookFieldError[]` | Optional structured hints |

**Categories (structural failure)**:

- `unsupported-file-type`
- `missing-worksheet`
- `missing-header-column`
- `missing-project-row`
- `unsupported-template-version`
- `invalid-project-identity`
- `invalid-snapshot-date`
- `extra-data-rows`
- `parse-failure`

**Not validation failures** (proceed to normalization): empty/absent dimension row 2; invalid cell values on row 2 (handled at signal level per BR-003).

---

### ImportedSnapshotProject

Normalized project equivalent to `SampleProjectFixture` for evaluation handoff.

| Field | Type | Notes |
|-------|------|-------|
| `schemaVersion` | `'1.0'` | Aligns with fixture schema |
| `id` | `string` | Derived from `projectKey` (prefixed `import:`) |
| `displayName` | `string` | `projectName` or `projectKey` |
| `scenario` | `'imported'` | Distinct from bundled scenarios |
| `origin` | `'imported'` | Discriminator for validation profile |
| `identity` | `ProjectIdentity` | From `Project` row 2 |
| `snapshot` | `SnapshotMetadata` | `asOfDate` authoritative (BR-004) |
| `signalGroups` | `[ImportSignalGroup]` | Single synthetic group `import-workbook` |
| `sourceSignals` | `ImportedSourceSignal[]` | Zero or more |
| `importMeta` | `ImportSessionMetadata` | Provenance banner fields |

### ImportedSourceSignal

Extends fixture signal shape with workbook provenance.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Stable: `{worksheet}-{column}` |
| `signalGroupId` | `'import-workbook'` | Always |
| `mappingKey` | `string` | From workbook column registry |
| `payload` | `Record<string, unknown>` | Canonical payload fields |
| `provenance` | `ImportProvenance` | Required for FR-013 |

### ImportProvenance

| Field | Type | Notes |
|-------|------|-------|
| `workbookFilename` | `string` | Not full path |
| `worksheet` | `WorksheetName` | |
| `row` | `2` | Literal when evidence exists |
| `column` | `string` | Contract column name |
| `mappingOutcome` | `'mapped' \| 'failed' \| 'unsupported'` | |
| `scoringIncluded` | `boolean` | |
| `exclusionReason` | `string \| null` | When excluded per BR-003 |

Mapped into `EvidenceItem.mapping` / drilldown per 001 patterns.

### ImportSessionMetadata

| Field | Type | Notes |
|-------|------|-------|
| `filename` | `string` | |
| `workbookAsOfDate` | `string` | ISO date from sheet |
| `localLastModifiedMs` | `number` | |
| `trustLabel` | `string` | Fixed copy: local snapshot, not live SharePoint |

---

### ImportSessionContext (session slice)

| Field | Type | Notes |
|-------|------|-------|
| `workbookRef` | `ImportedWorkbookReference \| null` | |
| `parsedWorkbook` | `ParsedWorkbook \| null` | Cleared on mode switch away from import |
| `validation` | `WorkbookValidationResult \| null` | Last validation outcome |
| `normalizedProject` | `ImportedSnapshotProject \| null` | Ready for evaluation |
| `refreshState` | `'idle' \| 'refreshing' \| 'needs-reselect'` | UI driver |

---

## Session State Extensions

Extends `SessionState` from 001 (`contracts/import-session-state.md`):

| New / changed field | Type | Notes |
|---------------------|------|-------|
| `projectMode` | `'none' \| 'bundled' \| 'imported'` | Orchestration |
| `importContext` | `ImportSessionContext \| null` | Null when not imported |
| `phase` | extended | Adds `import-invalid` for structural workbook failure |

**Unchanged from 001 when `projectMode === 'bundled'`**: `selectedProjectId`, `enabledSignalGroupIds`, checklist behaviour, golden-compatible paths.

---

## State Transitions

```text
none
  ├─ SELECT_PROJECT → bundled / project-ready | invalid-project
  └─ IMPORT_WORKBOOK_SELECTED → parse → validate
        ├─ fail → import-invalid
        └─ ok → imported / project-ready

imported / project-ready
  ├─ EVALUATE → evaluated
  ├─ REFRESH_SNAPSHOT (file-picker) → getFile() → parse → validate → normalize → project-ready | import-invalid
  ├─ REFRESH_SNAPSHOT (file-input) → needs-reselect → user reselects → parse → …
  └─ SELECT_PROJECT → bundled (clear import) → project-ready

evaluated (any mode)
  ├─ SET_PERSONA → re-project only
  ├─ mode switch → clear evaluation
  └─ RESET → none / initial
```

---

## Validation Rules Summary

| Rule | Structural? | Outcome |
|------|-------------|---------|
| All 5 worksheets present | Yes | `missing-worksheet` |
| Recognized headers row 1 | Yes | `missing-header-column` |
| `Project` row 2 required fields | Yes | `missing-project-row` / identity / template / date categories |
| Row ≥ 3 populated contract cells | Yes | `extra-data-rows` |
| Dimension row 2 empty/absent | No | Zero signals → Unmeasured dimension(s) |
| Dimension row 2 partial | No | Partial dimension per 001 rules |
| Invalid enum/number on row 2 | No | Signal excluded (BR-003) |

---

## Relationships to 001 Entities

| 001 entity | 002 relationship |
|------------|------------------|
| `SampleProjectFixture` | Bundled path unchanged; import produces parallel shape |
| `EvaluationResult` | Identical structure for dashboard reuse |
| `EvidenceItem` | Gains import provenance fields in mapping metadata |
| `SessionState` | Extended; bundled fields preserved |
| `MappingRegistry` | Reused; workbook columns map to existing `mappingKey` values |

**No modifications** to `CanonicalSignalType`, scoring catalogs, composite rules, or **`validateProject` (001 bundled path)**.

### Import-only validation (`validateImportedProject`)

Invoked **only** when `projectOrigin === 'imported'` after successful `validateWorkbookContract`.

| Condition | Import profile | Bundled `validateProject` |
|-----------|----------------|---------------------------|
| `sourceSignals.length === 0` | Allowed → all dimensions **Unmeasured** | Rejected (`empty-file`) — **unchanged** |
| Missing identity/snapshot | Rejected | Rejected — same guards |

Fixture: `tests/fixtures/workbooks/all-dimensions-empty-row2.xlsx` (see manifest).
