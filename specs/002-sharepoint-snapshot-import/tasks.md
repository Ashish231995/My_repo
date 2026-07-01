# Tasks: SharePoint-Synced Project Snapshot Import

**Input**: Design documents from `specs/002-sharepoint-snapshot-import/`  
**Prerequisites**: Approved `spec.md`, remediated `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  
**Baseline**: Extends completed `001-pm-copilot-demo` — **do not modify** 001 scoring contracts, sample fixtures, or golden expectations.

**Tests**: Constitution Principle VII + plan.md test-first strategy. Reducer tests = pure state transitions only. Controller tests = injected `FakeWorkbookAcquisition` + `FakeWorkbookParser`. Golden tests use pipeline/controller mocks — **no UI-only dependencies**.

**Organization**: Phase 0 (setup) → Phase 1 (foundational import pipeline + pure session/controller) → Phases 2–8 (US1–US7) → Phase 9 (polish & regression).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable — different files, no dependency on incomplete same-file work
- **[Story]**: US1–US7 maps to spec user stories
- **Refs**: FR/BR/AS/SC from `spec.md` and `contracts/implementation-traceability.md`
- **Evidence**: Test file or validation artifact proving completion

**Task totals**: **85 tasks** (T201–T285); MVP scope Phase 0 + 1 + 2 = **T201–T250 (50 tasks)**; **[P] tasks**: **39**

**Requirement coverage**: FR-001–026, BR-001–006, AS-001–025, SC-001–009 — all mapped (see `contracts/implementation-traceability.md`).

> **Note**: Task IDs start at **T201** to avoid collision with completed `001-pm-copilot-demo` tasks (T001–T138). Renumbered in final remediation pass (implementation not started).

---

## Phase 0: Setup and Dependency Pinning

**Purpose**: Pin `read-excel-file@9.2.0`, scaffold import + controller boundaries, author workbook fixtures. Blocks all import work.

- [X] T201 Pin `read-excel-file@9.2.0` in `package.json` per `research.md` ADR-009. **Refs**: ADR-009, FR-009 | **Evidence**: exact version in manifest; no `latest`
- [X] T202 Run `npm install` after manifest update. **Refs**: ADR-009 | **Evidence**: `package-lock.json` includes `read-excel-file@9.2.0`
- [X] T203 [P] Create `src/import/` scaffold: `acquisition/`, `parsing/`, `validation/`, `normalization/`, `orchestration/`, `controller/` per `plan.md`. **Refs**: plan.md §Project Structure, ADR-015 | **Evidence**: directories exist
- [X] T204 [P] Create test folders `tests/import/`, `tests/fixtures/workbooks/` if missing. **Refs**: plan.md §Testing Strategy | **Evidence**: paths exist
- [X] T205 [P] Create `tests/import/fakeWorkbookParser.ts` exporting `FakeWorkbookParser` implementing `WorkbookParserPort`. **Refs**: OI-003 | **Evidence**: injectable in orchestration and controller tests
- [X] T206 [P] Create `tests/import/fakeWorkbookAcquisition.ts` exporting `FakeWorkbookAcquisition` implementing `WorkbookAcquisitionPort`. **Refs**: OI-002 | **Evidence**: injectable in controller and integration tests
- [X] T207 Author minimal `.xlsx` binaries per `tests/fixtures/workbooks/README.md` manifest (`complete-v1.xlsx`, `incomplete-team-empty-row2.xlsx`, `partial-schedule.xlsx`, `all-dimensions-empty-row2.xlsx`, `invalid-template-version.xlsx`, `missing-project-row2.xlsx`, `extra-row3-data.xlsx`, `malformed-dimension-values.xlsx`) and `invalid-not-xlsx.bin`. **Refs**: OI-001, FR-005, BR-003 | **Evidence**: files present; no runtime xlsx writer dependency
- [X] T208 Populate SHA-256 hashes in `tests/fixtures/workbooks/README.md` for all authored binaries (CHK024). **Refs**: workbook-contract.md | **Evidence**: manifest hashes match `Get-FileHash` output
- [X] T209 Run `npm run test:golden` — all 001 golden tests MUST pass unchanged. **Refs**: CHK010, plan.md | **Evidence**: exit code 0; no edits to `tests/golden/sample-*.test.ts` expectations

**Checkpoint Phase 0**: Dependency pinned; fixtures authored; 001 golden regression green.

---

## Phase 1: Foundational Import Pipeline (Blocking)

**Purpose**: Parser-neutral workbook model, contract validation, normalization, orchestration, **pure session lifecycle reducer**, **async import controller**, `ProjectValidator` injection. **No UI.**

**Progress**: **28/32** tasks complete — **4 remaining** (T236–T241 session reducer/controller; T210–T221 + T224–T235 pipeline green).

> **Early type-contract tasks (Phase 0 pull-forward)**: T222, T223, and T231 were completed during Phase 0 as prerequisites for T205/T206 (`FakeWorkbookParser` / `FakeWorkbookAcquisition`). Deliverables are parser/acquisition **types and port interfaces only** in `src/import/parsing/types.ts`, `WorkbookParserPort.ts`, and `src/import/acquisition/types.ts` — no mapping, parser adapters, acquisition implementation, validation, normalization, reducer, or controller behavior.

**Independent Test**: `tests/import/*.test.ts`, `tests/session/import-reducer.test.ts`, `tests/import/import-controller.test.ts`, and `tests/golden/import-complete.test.ts` pass without any React UI.

### Tests (write first — expect fail)

- [X] T210 [P] Implement `tests/import/readExcelFileParser.contract.test.ts` using production `createNodeReadExcelFileParser()` + authored fixtures — **must not duplicate** `mapSheetsToParsedWorkbook` logic in the test file. **Refs**: OI-003 | **Evidence**: fails until T224–T225
- [X] T211 [P] Implement `tests/import/validateWorkbookContract.test.ts` for structural categories (template, Project row 2, headers, rows 3+, missing worksheet). **No UI dependency.** **Refs**: FR-005–FR-008, AS-008, AS-022 | **Evidence**: fails until T227
- [X] T212 [P] Implement `tests/import/normalizeImportedWorkbook.test.ts` for column→`mappingKey` mapping and provenance fields. **Refs**: FR-013, BR-001 | **Evidence**: fails until T229–T230
- [X] T213 [P] Implement `tests/import/all-dimensions-unmeasured.test.ts` for `all-dimensions-empty-row2.xlsx` → zero `sourceSignals`. **Refs**: ADR-011, AS-004 | **Evidence**: fails until T228, T230
- [X] T214 [P] Implement `tests/import/loadImportedProject.test.ts` with **injected** `FakeWorkbookParser` only. **Refs**: OI-003, FR-009 | **Evidence**: fails until T233
- [X] T215 [P] Implement `tests/import/acquisition.test.ts` for MIME/extension guard and refresh semantics (handle vs needs-reselect). **Refs**: FR-003, FR-006, FR-016, ADR-010, AS-007, AS-012 | **Evidence**: fails until T231–T232
- [X] T216 [P] Implement `tests/import/invalid-evidence-exclusion.test.ts` — malformed dimension values excluded with visible `exclusionReason` (BR-003) using `malformed-dimension-values.xlsx` or fake parser output. **Refs**: BR-003, FR-007 | **Evidence**: fails until T230
- [X] T217 [P] Implement `tests/import/snapshot-date-authority.test.ts` — assert `Project.asOfDate` → `snapshot.asOfDate` **and** that imported `snapshot.asOfDate` changes FND-002 / REC-002 outcome per 001 recommendation timing (`daysUntilDue = milestoneDueDate − snapshot.asOfDate`; use **synthetic `FakeWorkbookParser` output** with `slipDays ≥ 8` and valid `milestoneDueDate` at two different `asOfDate` values — **no additional workbook binary**). **Refs**: BR-004, AS-001 | **Evidence**: fails until T230
- [X] T218 [P] Implement `tests/session/import-reducer.test.ts` using `createSessionReducer({ importedProjectValidator: stub })` — pure lifecycle transitions: `IMPORT_LOAD_*`, `REFRESH_*` (**fail-closed**: `REFRESH_FAILED` → `import-invalid` no scores; `RESELECT_REQUIRED` no stale evaluation), `SELECT_PROJECT`, sync `EVALUATE`; **requestId stale no-op**; **SessionAction payloads data-only**. **Refs**: ADR-015, ADR-016, AS-024, AS-025, FR-023, BR-005 | **Evidence**: fails until T238
- [X] T219 [P] Implement `tests/import/import-controller.test.ts` with injected `FakeWorkbookAcquisition` + `FakeWorkbookParser` — **selectWorkbook before `IMPORT_LOAD_STARTED`**; picker cancel → no dispatch; context change during picker → selection ignored; refresh fail-closed paths. **Refs**: OI-002, ADR-015, AS-024, AS-025 | **Evidence**: fails until T239
- [X] T220 [P] Implement `tests/golden/import-complete.test.ts` — `loadImportedProject` + `runEvaluation({ projectValidator: validateImportedProject })` only; **no UI**. **Refs**: AS-001, AS-003, SC-001, FR-011 | **Evidence**: fails until T233–T241
- [X] T221 [P] Implement `tests/import/evidence-privacy.test.ts` — evidence/drilldown mapping metadata does not expose raw workbook cell payloads (FR-014). **Refs**: FR-014 | **Evidence**: fails until T230; may extend in US1 UI task

### Types and parser adapter

- [X] T222 [P] Define `ParsedWorkbook`, `ParsedSheet`, `ParsedCell`, `WorksheetName` in `src/import/parsing/types.ts` per `data-model.md`. **Refs**: data-model.md | **Evidence**: types compile — **completed early (Phase 0 pull-forward for T205); type contract only**
- [X] T223 [P] Define `WorkbookParserPort` in `src/import/parsing/WorkbookParserPort.ts` (`parse(bytes): Promise<ParsedWorkbook>`). **Refs**: contracts/import-functions.md | **Evidence**: interface exported — **completed early (Phase 0 pull-forward for T205); type contract only**
- [X] T224 Implement `mapSheetsToParsedWorkbook` in `src/import/parsing/mapSheetsToParsedWorkbook.ts` (single shared mapping source). **Refs**: workbook-contract.md | **Evidence**: exercised by T210 via production parser adapter
- [X] T225 Implement `createNodeReadExcelFileParser` in `src/import/parsing/createNodeReadExcelFileParser.ts` using `read-excel-file/node` + shared mapper. **Refs**: ADR-009 | **Evidence**: T210 passes
- [X] T226 Implement `createBrowserReadExcelFileParser` in `src/import/parsing/createBrowserReadExcelFileParser.ts` using `read-excel-file/browser` + shared mapper. **Refs**: ADR-009, FR-009 | **Evidence**: `npm run build` bundles browser entry; MV-008 manual smoke

### Validation and normalization

- [X] T227 [P] Implement `validationCategories.ts` and `validateWorkbookContract` in `src/import/validation/`. **Refs**: FR-005–FR-008, workbook-contract.md | **Evidence**: T211 passes
- [X] T228 Implement `validateImportedProject` in `src/import/validation/validateImportedProject.ts` (**import-only**; allows zero signals). **Refs**: ADR-011, FR-012 | **Evidence**: T213 passes; `validateProject` untouched
- [X] T229 [P] Implement `workbookColumnRegistry.ts` in `src/import/normalization/` per `contracts/workbook-contract.md`. **Refs**: BR-001, FR-013 | **Evidence**: registry covers all contract columns
- [X] T230 Implement `normalizeImportedWorkbook` in `src/import/normalization/normalizeImportedWorkbook.ts`. **Refs**: FR-009, FR-012, FR-013, BR-003, BR-004 | **Evidence**: T212, T216, T217 pass

### Acquisition and orchestration

- [X] T231 [P] Define acquisition types in `src/import/acquisition/types.ts` (`AcquiredWorkbook`, `RefreshWorkbookResult`, `ImportedWorkbookReference`). **Refs**: data-model.md, ADR-010 | **Evidence**: types compile — **completed early (Phase 0 pull-forward for T206); type contract only**
- [X] T232 Implement `createBrowserWorkbookAcquisition` in `src/import/acquisition/workbookAcquisition.ts` (File System Access + file-input; refresh rules per ADR-010). **Refs**: FR-003, FR-004, FR-016, ADR-010 | **Evidence**: T215 passes
- [X] T233 Implement `loadImportedProject` in `src/import/orchestration/loadImportedProject.ts` (parse → validate → normalize). **Refs**: FR-005, FR-009 | **Evidence**: T214, T220 pass

### Evaluation injection (domain — no `src/import` imports)

- [X] T234 Define `ProjectValidator` type in `src/domain/validation/projectValidator.ts` (or `evaluation.ts`) and add optional `projectValidator?: ProjectValidator` to `EvaluationInput`. **Refs**: ADR-011, OI-004 | **Evidence**: typecheck passes; default `validateProject` when omitted
- [X] T235 Update `runEvaluation` in `src/domain/evaluation/runEvaluation.ts` to call `input.projectValidator ?? validateProject` — **no import from `src/import/**`**. **Refs**: FR-010, ADR-011 | **Evidence**: 001 golden tests still pass

### Session core (pure reducer + async controller)

- [ ] T236 Extend `SessionState` with `projectMode`, `importContext`, `importRequestId` in `src/domain/model/session.ts`; add `import-loading` and `import-invalid` phases. **Refs**: FR-023, contracts/import-session-state.md | **Evidence**: types match contract
- [ ] T237 Add lifecycle actions in `src/session/sessionActions.ts` (`IMPORT_LOAD_STARTED`, `IMPORT_LOAD_SUCCEEDED`, `IMPORT_LOAD_FAILED`, `REFRESH_STARTED`, `REFRESH_SUCCEEDED`, `REFRESH_FAILED`, `RESELECT_REQUIRED`). **No `IMPORT_CANCELLED`** — picker cancel is no-dispatch. **Refs**: ADR-015, import-session-state.md | **Evidence**: actions exported
- [ ] T238 Implement `createSessionReducer({ importedProjectValidator })`, `createInitialSession`, and **synchronous** lifecycle handlers + sync `EVALUATE` in `src/session/sessionReducer.ts`. **`sessionReducer.ts` MUST NOT import `src/import/**`**; `AppProviders` supplies `validateImportedProject`. **Refs**: ADR-015, ADR-016, FR-010, FR-023, BR-005 | **Evidence**: T218 passes
- [ ] T239 Implement `createImportController` in `src/import/controller/importController.ts` — **must**: (1) `selectWorkbook` before `IMPORT_LOAD_STARTED`; (2) picker cancel → no lifecycle dispatch / no state change; (3) discard selection when active context changed during picker; (4) refresh fail-closed (`REFRESH_FAILED` → `import-invalid`, `RESELECT_REQUIRED` → no stale scores). Dispatches lifecycle actions with `requestId`. **Refs**: ADR-015, AS-024, AS-025, contracts/import-functions.md | **Evidence**: T219 passes
- [ ] T240 Wire `SessionProvider` / `AppProviders` to pass `validateImportedProject` into `createSessionReducer` and connect `importController` to dispatch/getState. **Refs**: ADR-015, ADR-016 | **Evidence**: controller testable from integration layer
- [ ] T241 Run Phase 1 checkpoint suite: `tests/import`, `tests/session/import-reducer.test.ts`, `tests/import/import-controller.test.ts`, `tests/golden/import-complete.test.ts`. **Refs**: SC-001 | **Evidence**: all pass; 001 goldens green

**Checkpoint Phase 1**: Full import pipeline + pure reducer + controller work in isolation; golden import-complete passes; no UI.

---

## Phase 2: User Story 1 — Import and Evaluate Complete Workbook (P1) 🎯 MVP

**Goal**: User imports `complete-v1.xlsx`, evaluates, sees four Measured dimensions, composite, and provenance banner (AS-001–AS-003).

**Independent Test**: `tests/golden/import-complete.test.ts` (already green) + `tests/integration/import-flow.test.tsx` pass.

### Tests (write first)

- [ ] T242 [P] [US1] Implement `tests/integration/import-flow.test.tsx` using configured `createSessionReducer` + `importController` with `FakeWorkbookAcquisition` + `FakeWorkbookParser` — after `IMPORT_LOAD_SUCCEEDED`, dispatch sync `EVALUATE` through reducer (not direct `runEvaluation`); assert provenance banner. **Refs**: AS-001, AS-002, AS-020, FR-010, FR-015, FR-026, OI-002 | **Evidence**: fails until T244–T250

### Implementation

- [ ] T243 [P] [US1] Create `src/features/import-snapshot/ImportSnapshotButton.tsx` + CSS module — calls `importController.requestImport()`, **not** async reducer. **Refs**: FR-002, FR-003 | **Evidence**: triggers controller
- [ ] T244 [P] [US1] Create `src/features/import-snapshot/ImportProvenanceBanner.tsx` + CSS module (filename, as-of, last modified, trust copy). **Refs**: FR-015, FR-026, AS-002, AS-019 | **Evidence**: renders when `projectMode === 'imported'`
- [ ] T245 [US1] Wire `ImportSnapshotButton` into project selection area in `src/app/App.tsx` (or `ProjectSelector` feature). **Refs**: FR-001, FR-002 | **Evidence**: import action visible alongside samples A–C
- [ ] T246 [US1] Render `ImportProvenanceBanner` and imported health dashboard when `phase === 'evaluated'` and `projectMode === 'imported'`. **Refs**: FR-015, SC-001 | **Evidence**: T242 passes
- [ ] T247 [US1] Hide `IntegrationChecklist` when `projectMode !== 'bundled'` in `src/app/App.tsx`. **Refs**: FR-023, AS-023, BR-005 | **Evidence**: checklist hidden on import
- [ ] T248 [US1] Extend `src/features/dimension-detail/EvidenceDrilldown.tsx` to show workbook provenance (worksheet, row 2, column) — **no raw cell payload** (FR-014). **Refs**: FR-013, FR-014 | **Evidence**: T221 + integration pass
- [ ] T249 [US1] Ensure `EvaluateButton` dispatches sync `EVALUATE` when `projectMode === 'imported'`. **Refs**: FR-010 | **Evidence**: golden + integration pass
- [ ] T250 [US1] Run `npm run test -- tests/golden/import-complete.test.ts tests/integration/import-flow.test.tsx`. **Refs**: SC-001 | **Evidence**: both pass

**Checkpoint Phase 2 (MVP)**: Complete workbook import and evaluation demo-ready.

---

## Phase 3: User Story 2 — Incomplete but Valid Workbook (P1)

**Goal**: Structurally valid workbooks with empty/absent dimension row 2 produce Unmeasured/Partial without fabricated values (AS-004–AS-006).

**Independent Test**: Golden tests only — no UI dependency.

### Tests (write first)

- [ ] T251 [P] [US2] Implement `tests/golden/import-incomplete-team.test.ts` using `incomplete-team-empty-row2.xlsx` → Team Unmeasured. **Refs**: AS-004, FR-012, SC-001 | **Evidence**: fails until normalization verified
- [ ] T252 [P] [US2] Implement `tests/golden/import-partial-schedule.test.ts` using `partial-schedule.xlsx` → Schedule Partial. **Refs**: AS-005, FR-012 | **Evidence**: fails until normalization verified

### Implementation

- [ ] T253 [US2] Verify `normalizeImportedWorkbook` skips empty canonical cells without imputation; fix edge cases if golden tests expose gaps. **Refs**: BR-002, AS-006 | **Evidence**: T251–T252 pass without scoring changes
- [ ] T254 [US2] Verify composite rules for import with Unmeasured/Partial dimensions match 001 policy in golden assertions. **Refs**: FR-012, BR-001 | **Evidence**: golden tests pass

**Checkpoint Phase 3**: Incomplete import semantics match Sample C-style behaviour.

---

## Phase 4: User Story 3 — Reject Invalid Workbook Structure (P1)

**Goal**: Structural failures block evaluation; recovery to samples; no fabricated scores (AS-007–AS-009, AS-021–AS-022).

**Independent Test**: `validateWorkbookContract.test.ts` (unit, no UI) + `ImportInvalidPanel` integration.

### Tests (write first)

- [ ] T255 [P] [US3] Extend `tests/import/validateWorkbookContract.test.ts` with fixtures: `invalid-template-version.xlsx`, `missing-project-row2.xlsx`, `extra-row3-data.xlsx`. **No UI dependency.** **Refs**: AS-008, AS-021, AS-022 | **Evidence**: passes independently of T257
- [ ] T256 [P] [US3] Implement `tests/integration/import-invalid.test.tsx` for blocked dashboard + recovery to Sample B (fake acquisition). **Refs**: AS-009, FR-008, SC-004 | **Evidence**: fails until T257–T259

### Implementation

- [ ] T257 [P] [US3] Create `src/features/import-snapshot/ImportInvalidPanel.tsx` + CSS module (category message, reselect, sample fallback). **Refs**: FR-008, AS-009 | **Evidence**: mirrors `InvalidSampleDataPanel` patterns
- [ ] T258 [US3] Ensure `IMPORT_LOAD_FAILED` sets `phase: 'import-invalid'`; suppress health dashboard scores. **Refs**: FR-008, SC-004 | **Evidence**: integration test passes
- [ ] T259 [US3] Wire recovery actions (select Sample A/B/C, reselect workbook via controller) in `ImportInvalidPanel`. **Refs**: AS-009, FR-020 | **Evidence**: Sample B evaluates after invalid import

**Checkpoint Phase 4**: Invalid imports fail closed with recovery.

---

## Phase 5: User Story 4 — Refresh Snapshot (P2)

**Goal**: File-handle refresh reads latest bytes; file-input tier prompts reselect (AS-010–AS-012, AS-024–AS-025, SC-008). Refresh side effects in **controller**, not reducer.

**Independent Test**: `tests/integration/import-refresh.test.tsx` with `FakeWorkbookAcquisition`.

### Tests (write first)

- [ ] T260 [P] [US4] Implement `tests/integration/import-refresh.test.tsx` for handle refresh (mock `getFile`), file-input `needs-reselect`, and **`REFRESH_FAILED` / `RESELECT_REQUIRED` fail-closed** (no composite/dimension/finding/recommendation scores; recovery via reselect or bundled sample) via controller. **Refs**: AS-010, AS-011, AS-012, AS-024, AS-025, FR-017, SC-008, OI-002 | **Evidence**: fails until T261–T263

### Implementation

- [ ] T261 [P] [US4] Create `src/features/import-snapshot/RefreshSnapshotButton.tsx` + CSS module — calls `importController.requestRefresh()`. **Refs**: FR-016 | **Evidence**: triggers controller
- [ ] T262 [P] [US4] Create `src/features/import-snapshot/ReselectWorkbookButton.tsx` + CSS module (visible when `refreshState === 'needs-reselect'`). **Refs**: AS-012, ADR-010 | **Evidence**: calls `importController.requestReselect()`
- [ ] T263 [US4] Wire refresh/reselect controls in `src/app/App.tsx` for imported mode only. **Refs**: FR-016, FR-017, SC-008 | **Evidence**: T260 passes; manual MV-004 paths work

**Checkpoint Phase 5**: Refresh semantics match ADR-010.

---

## Phase 6: User Story 5 — Deterministic Repeat and Persona Invariance (P2)

**Goal**: Repeat evaluation identical; persona changes presentation only (AS-013–AS-014, SC-002–SC-003).

**Independent Test**: Golden determinism (no UI) + persona integration.

### Tests (write first)

- [ ] T264 [P] [US5] Implement `tests/golden/import-determinism.test.ts` — evaluate same bytes twice → identical outputs. **Refs**: AS-013, FR-018, SC-002 | **Evidence**: fails until pipeline stable
- [ ] T265 [P] [US5] Implement `tests/integration/import-persona.test.tsx` — Novice/Intermediate/Expert same scores and recommendation set. **Refs**: AS-014, FR-021, SC-003 | **Evidence**: fails until persona wiring confirmed

### Implementation

- [ ] T266 [US5] Verify `SET_PERSONA` re-projects import evaluation without re-running `runEvaluation` in `src/session/sessionReducer.ts`. **Refs**: FR-021, Constitution V | **Evidence**: T265 passes
- [ ] T267 [US5] Run determinism golden test; fix any non-determinism in import normalization ordering if needed. **Refs**: FR-018 | **Evidence**: T264 passes

**Checkpoint Phase 6**: Import path persona-safe and deterministic.

---

## Phase 7: User Story 6 — Privacy, Reset, Mode Exclusion, Stale Async (P2)

**Goal**: Reset/reload clears import; bundled/imported mutual exclusion; late async completion cannot overwrite bundled selection (AS-015–AS-017, AS-023, BR-005, SC-005–SC-006).

**Independent Test**: `tests/integration/mode-switch.test.tsx`, `tests/session/import-stale-async.test.ts`, `tests/privacy/import-privacy.test.ts`.

### Tests (write first)

- [ ] T268 [P] [US6] Implement `tests/session/import-stale-async.test.ts` — in-flight import completes after `SELECT_PROJECT`; `IMPORT_LOAD_SUCCEEDED` with stale `requestId` is no-op; bundled selection preserved (BR-005). **Refs**: BR-005, BR-006, ADR-015 | **Evidence**: fails until T238
- [ ] T269 [P] [US6] Implement `tests/integration/mode-switch.test.tsx` (import → Sample B → checklist visible; import again → checklist hidden; bundled/imported never simultaneous). **Refs**: AS-023, FR-023, BR-005 | **Evidence**: fails until T271–T272
- [ ] T270 [P] [US6] Implement `tests/privacy/import-privacy.test.ts` (no storage APIs; reset clears import context; no fetch). **Refs**: AS-015, AS-017, AS-020, FR-019, FR-024–FR-025, SC-005 | **Evidence**: fails until T271

### Implementation

- [ ] T271 [US6] Extend `applyReset` and `INIT` in `src/session/initialSession.ts` / `sessionReducer.ts` to clear `importContext`, increment `importRequestId`, and drop workbook bytes. **Refs**: FR-019, SC-005 | **Evidence**: privacy test passes
- [ ] T272 [US6] Ensure `SELECT_PROJECT` increments `importRequestId`, clears import state, sets `projectMode: 'bundled'` (BR-005, BR-006). **Refs**: BR-005, BR-006, AS-016, FR-020 | **Evidence**: T268–T269 pass
- [ ] T273 [US6] Add integration assertion Sample B golden-compatible after import attempt in `tests/integration/mode-switch.test.tsx`. **Refs**: AS-016, SC-006 | **Evidence**: 001 Sample B evaluation succeeds

**Checkpoint Phase 7**: Privacy, mutual exclusion, and stale-async protection verified.

---

## Phase 8: User Story 7 — Keyboard-Accessible Import Flows (P3)

**Goal**: Import, invalid recovery, refresh/reselect operable by keyboard (AS-018, SC-007).

**Independent Test**: `tests/a11y/import-keyboard.test.tsx` + axe smoke pass.

### Tests (write first)

- [ ] T274 [P] [US7] Implement `tests/a11y/import-keyboard.test.tsx` (Tab to import, evaluate, invalid recovery without pointer). **Refs**: AS-018, FR-022, SC-007 | **Evidence**: fails until T275
- [ ] T275 [P] [US7] Extend axe smoke in `tests/a11y/` for import controls and `ImportInvalidPanel`. **Refs**: FR-022, Constitution VIII | **Evidence**: no serious violations

### Implementation

- [ ] T276 [US7] Ensure import/refresh/reselect buttons use native focusable elements and visible focus styles in `src/features/import-snapshot/*.module.css`. **Refs**: FR-022 | **Evidence**: keyboard test passes

**Checkpoint Phase 8**: Accessibility extension complete.

---

## Phase 9: Polish and Cross-Cutting Concerns

**Purpose**: Required perf gate, manual browser adapter smoke, full regression, quickstart validation.

- [ ] T277 Implement `tests/perf/import-bench.test.ts` — parse+validate+normalize **median &lt;500 ms** on committed `complete-v1.xlsx` (&lt;2 MB); **SC-009**, **G-009**. **Refs**: spec.md SC-009, plan.md Performance | **Evidence**: median under 500 ms or blocked pending plan amendment
- [ ] T278 Execute manual scenario **MV-008** from `quickstart.md` — Edge/Chrome production `createBrowserReadExcelFileParser` smoke on `complete-v1.xlsx`; confirm `npm run build` bundles browser parser. **Refs**: OI-003, ADR-009, G-006 | **Evidence**: session notes or PR checklist; **not** jsdom
- [ ] T279 Run full test suite: `npm run test -- --pool=threads --maxWorkers=2`. **Refs**: Constitution VII, CHK010 | **Evidence**: 001 + 002 green
- [ ] T280 Run `npm run test:golden` — confirm 001 goldens unchanged. **Refs**: CHK010 | **Evidence**: exit code 0
- [ ] T281 Run `npm run test:privacy` including import privacy cases. **Refs**: FR-024–FR-025 | **Evidence**: exit code 0
- [ ] T282 Run `npm run test:a11y`. **Refs**: FR-022 | **Evidence**: exit code 0
- [ ] T283 Run `npm run typecheck` and `npm run build`. **Refs**: quickstart G-001, G-006 | **Evidence**: exit code 0
- [ ] T284 Execute manual scenarios MV-001–MV-008 from `quickstart.md` and record pass (includes production browser parser smoke **MV-008** — see also T278). **Refs**: G-007, G-006, OI-003 | **Evidence**: checklist in PR or session notes
- [ ] T285 Verify `specs/002-sharepoint-snapshot-import/checklists/architecture-plan-readiness.md` CHK001–CHK030. **Refs**: plan.md | **Evidence**: all applicable items checked

**Checkpoint Phase 9**: Feature 002 release-ready; 001 baseline intact.

---

## Dependencies and Execution Order

### Phase Dependencies

```text
Phase 0 (Setup)
  → Phase 1 (Foundational pipeline + pure reducer + controller) — BLOCKS all user stories
    → Phase 2 (US1 MVP)
      → Phases 3–4 (US2–US3) can parallel after Phase 1; validation/golden independent of UI
      → Phases 5–8 (US4–US7) depend on US1 controller wiring; US6 depends on mode UI from US1/US4
    → Phase 9 (Polish) — after desired stories complete
```

### Critical path (sequential spine)

```text
T201–T209 (setup + fixtures; T222/T223/T231 type contracts pulled forward for T205/T206)
  → T210–T221 (tests first)
  → T224 mapSheetsToParsedWorkbook → T225 node parser → T210 green
  → T227–T230 validation/normalization → T211–T217 green
  → T232 acquisition impl (T231 types done) → T215 green
  → T233 loadImportedProject → T214, T220 green
  → T234–T235 ProjectValidator injection → 001 goldens green
  → T238 pure reducer (T218) → T239 controller (T219) → T241 checkpoint
  → T242–T250 US1 UI → MVP demo
  → T277 perf gate + T278 MV-008 → T285 release gate
```

**Phase 1 remaining (4)**: T236–T241 (session reducer/controller; T224–T235 pipeline green).

### User Story Dependencies

| Story | Depends on | Can parallel with |
|-------|------------|-------------------|
| US1 | Phase 1 | — (MVP) |
| US2 | Phase 1 | US3 after Phase 1 |
| US3 | Phase 1 | US2 |
| US4 | US1 (controller wiring) | US5 |
| US5 | Phase 1 | US4 |
| US6 | US1, US4 (refresh) | US7 |
| US7 | US1, US3 (invalid panel) | US6 |

### Parallel Examples

**Phase 1 tests (after T206)**:
```text
T210 readExcelFileParser.contract.test.ts
T211 validateWorkbookContract.test.ts
T212 normalizeImportedWorkbook.test.ts
T213 all-dimensions-unmeasured.test.ts
T214 loadImportedProject.test.ts
T215 acquisition.test.ts
T216 invalid-evidence-exclusion.test.ts
T217 snapshot-date-authority.test.ts
T218 import-reducer.test.ts
T219 import-controller.test.ts
T220 golden/import-complete.test.ts
T221 evidence-privacy.test.ts
```

**Phase 2 US1 (after Phase 1)**:
```text
T242 integration/import-flow.test.tsx
T243 ImportSnapshotButton.tsx
T244 ImportProvenanceBanner.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 0 (T201–T209)
2. Complete Phase 1 (**4 of 32 remaining**: T236–T241 session reducer/controller; T224–T235 pipeline green)
3. Complete Phase 2 (T242–T250)
4. **STOP and VALIDATE**: `import-complete` golden + import-flow integration
5. Demo complete workbook import

### Incremental Delivery

1. Setup + Foundational → pipeline + controller ready
2. US1 → complete import MVP
3. US2 + US3 → incomplete and invalid paths
4. US4 → refresh story (controller-side)
5. US5 → determinism and persona
6. US6 → privacy, mode exclusion, stale-async
7. US7 → keyboard/a11y
8. Phase 9 → perf gate + MV-008 + full regression

### 001 Regression Guard

After **every phase checkpoint**, run:

```bash
npm run test:golden
npm run test -- --pool=threads --maxWorkers=2
```

Do **not** modify `src/domain/scoring/**`, 001 contracts, `sample-project-*.json`, or 001 golden expectations.

---

## Requirement coverage (task evidence)

| Requirement | Primary tasks |
|-------------|---------------|
| BR-003 invalid evidence exclusion | T207, T216, T230 |
| BR-004 asOfDate authority (+ REC-002 timing) | T217, T230 |
| BR-005 mutual exclusion | T218, T247, T268, T269, T272 |
| FR-014 no raw payload in evidence | T221, T248 |
| AS-024 refresh fail-closed | T218, T219, T239, T260 |
| AS-025 reselect no stale scores | T218, T219, T260 |
| SC-009 import perf &lt;500 ms | T277 |
| Stale async / late import | T218, T219, T268, T272 |
| OI-002 acquisition fake | T206, T219, T242, T260 |
| OI-003 shared parser mapping | T210, T224, T225, T226, T278, T284 |
| Reducer EVALUATE integration path | T218, T238, T242 |
| Manual MV-008 | T278, T284 |

---

## Notes

- Parser library imports: **only** `createBrowserReadExcelFileParser.ts` may import `read-excel-file/browser`; contract tests use production `createNodeReadExcelFileParser`
- `src/domain/**` MUST NOT import `src/import/**`
- `validateProject` (001) MUST remain behavior-identical for bundled fixtures
- `sessionReducer` is synchronous (`createSessionReducer`); all async import/refresh in `importController`
- `sessionReducer.ts` must not import `src/import/**`
- Windows: use `--pool=threads --maxWorkers=2` for full suite stability
- Author workbook binaries in T207 before T210 contract tests can pass
- **Do not** claim jsdom verifies Web Worker behaviour — use MV-008 manual smoke + build verification
- T222, T223, T231: type-contract tasks completed early in Phase 0 for T205/T206 fakes; no Phase 1 behavior implemented yet
