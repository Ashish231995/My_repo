# Architecture & Plan-Readiness Checklist: SharePoint-Synced Project Snapshot Import

**Purpose**: Architecture quality gate for Feature 002 before `/speckit-implement`.

**Created**: 2026-07-01  
**Remediated**: 2026-06-29 (final task-plan remediation pass)  
**Feature**: `002-sharepoint-snapshot-import`

**Artifacts reviewed**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/*`, `tasks.md`, `tests/fixtures/workbooks/README.md`

---

## 1. Constitution Compliance

- [x] **CHK001** — Principle I: FR/AS traceability in `contracts/implementation-traceability.md`
- [x] **CHK002** — Principle II: Memory-only; no persistence; parser bundled; ADR-010 acquisition
- [x] **CHK003** — Principle III: 001 scoring reused; no new health mappings (BR-001)
- [x] **CHK004** — Principle IV: Workbook → `mappingKey` → existing canonical types
- [x] **CHK005** — Principle V: `SET_PERSONA` re-project only for import evaluations
- [x] **CHK006** — Principle VI: `src/import/` pure modules; parser port isolation; domain does not import import layer
- [x] **CHK007** — Principle VII: Test-first strategy; reducer/controller/parser layering
- [x] **CHK008** — Principle VIII: Import invalid/refresh/reselect states in session contract

**Gate**: ✅ PASS

---

## 2. Baseline Extension Safety

- [x] **CHK009** — 001 scoring contracts untouched
- [x] **CHK010** — 001 golden tests must remain green (explicit regression rule)
- [x] **CHK011** — Sample A–C fallback preserved (FR-020, AS-016)
- [x] **CHK012** — Integration checklist bundled-only (FR-023, ADR session contract)
- [x] **CHK012a** — ADR-011 import-only: `validateImportedProject` in `src/import/validation/`; bundled `validateProject` unchanged

---

## 3. Architectural Boundaries

- [x] **CHK013** — Acquisition isolated (`src/import/acquisition/`)
- [x] **CHK014** — Parser adapter isolated (async `WorkbookParserPort`; shared `mapSheetsToParsedWorkbook`; browser entry only in adapter)
- [x] **CHK015** — Validation before normalization
- [x] **CHK016** — Normalization before `runEvaluation`
- [x] **CHK017** — Structural vs evidence failure separation (spec iteration 3)
- [x] **CHK017a** — ADR-015: `sessionReducer` synchronous/pure; async work in `importController`
- [x] **CHK017b** — ADR-016: `createSessionReducer({ importedProjectValidator })`; `AppProviders` supplies `validateImportedProject`; `sessionReducer.ts` no `src/import/**` imports; data-only `SessionAction` payloads

---

## 4. Dependency & Security

- [x] **CHK018** — Parser dependency justified (ADR-009 revision; Complexity Tracking)
- [x] **CHK019** — MIT license pinned `read-excel-file@9.2.0` (5.8.8 superseded)
- [x] **CHK020** — No runtime network for parser or SharePoint

---

## 5. Pre-task remediation items

- [x] **CHK021** — OI-001 resolved: `tests/fixtures/workbooks/README.md` manifest (cells, outcomes, SHA-256 column)
- [x] **CHK022** — OI-003 resolved: Node contract tests use production parser + shared mapper; MV-008 manual browser smoke (not jsdom Web Worker claims)
- [x] **CHK023** — ADR-010 refresh: handle `getFile()` vs file-input reselect documented
- [x] **CHK024** — SHA-256 hashes populated when `.xlsx` binaries authored (implementation T208)
- [x] **CHK025** — OI-002 resolved: `FakeWorkbookAcquisition` + `FakeWorkbookParser` in controller/integration tests

---

## 6. Session & test sequencing (final remediation)

- [x] **CHK026** — Lifecycle actions (`IMPORT_LOAD_*`, `REFRESH_*`, `RESELECT_REQUIRED`) with `requestId` stale protection documented
- [x] **CHK026a** — Picker acquisition: `selectWorkbook` before `IMPORT_LOAD_STARTED`; cancel → no dispatch; context change → selection ignored
- [x] **CHK026b** — Refresh fail-closed: spec AS-024/AS-025; `REFRESH_STARTED` clears evaluation; `RESELECT_REQUIRED` / `REFRESH_FAILED` show no stale health scores; recovery reselect or bundled sample
- [x] **CHK027** — Reducer tests precede reducer impl; controller tests precede controller impl (`tasks.md` Phase 1)
- [x] **CHK028** — Validation/golden tests independent of UI panels
- [x] **CHK029** — Explicit tasks for BR-003, BR-004, BR-005, FR-014, stale async completion
- [x] **CHK030** — Import perf &lt;500 ms required — **SC-009** in `spec.md`; `tests/perf/import-bench.test.ts` (T277); G-009

---

## Final verdict

| Criterion | Status |
|-----------|--------|
| Constitution gates | ✅ PASS |
| 001 extension safety | ✅ PASS |
| Boundary / dependency direction | ✅ PASS |
| Open items OI-001–OI-004 | ✅ Resolved in plan |
| Task plan remediated (T201–T285) | ✅ Complete |
| Implementation started | ⏸ Not started |

**Readiness**: ✅ **APPROVED for `/speckit-implement`** — spec authoritative for refresh fail-closed (AS-024/AS-025) and perf (SC-009); pending workbook binary authoring (T207–T208) at Phase 0 only.
