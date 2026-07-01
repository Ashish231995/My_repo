# Implementation Plan: SharePoint-Synced Project Snapshot Import

**Branch**: `002-sharepoint-snapshot-import` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

**Input**: Approved specification with UD-001–UD-003 resolved and Project vs dimension row-2 rules aligned (validation iteration 3).

**Planning scope**: Design artifacts and `tasks.md` — remediated for implementation readiness. No application source code until `/speckit-implement`.

**Baseline**: Extends completed `001-pm-copilot-demo` (Demonstration Rule Catalog v1.0 APPROVED, Phase 8A gates passed).

---

## Summary

Feature 002 adds a **browser-local `.xlsx` import path** for OneDrive-synchronized SharePoint workbooks. The implementation introduces four new boundaries — **acquisition**, **parsing**, **contract validation**, and **normalization** — then hands off to the **unchanged** `runEvaluation` pipeline from 001.

**Technical approach**: Extend the existing Vite + React 19 + TypeScript 6 SPA with `src/import/` pure modules, session mode orchestration (`bundled` | `imported`), and `read-excel-file@9.2.0` (MIT) behind async `WorkbookParserPort`. Reuse dashboard, persona projection, evidence drilldown, and reset flows. Test-first with dedicated import unit/golden/integration/a11y/privacy suites while **001 golden tests remain unmodified**.

**Remediation (2026-07-01)**: ADR-009 revised to `9.2.0`; OI-001/OI-003 resolved; ADR-010 refresh semantics clarified; ADR-011 import-only profile confirmed.

**Final remediation (2026-06-29)**: ADR-015 synchronous pure `sessionReducer` + async `importController`; `ProjectValidator` injection (no `src/domain` → `src/import` imports); OI-002 closed (`FakeWorkbookAcquisition`); parser contract tests use shared production mapper; perf gate required; tasks renumbered T201–T285.

---

## Technical Context

| Item | Value |
|------|-------|
| **Language** | TypeScript 6.0.3 |
| **UI** | React 19.2.7, React DOM 19.2.7 |
| **Build** | Vite 8.1.0, @vitejs/plugin-react 6.0.3 |
| **New dependency** | `read-excel-file@9.2.0` (MIT) — pinned at implementation; see [research.md](./research.md) ADR-009 |
| **Storage** | Browser memory only; no localStorage/IndexedDB/cookies for import data |
| **Testing** | Vitest 4.1.9, RTL, user-event, vitest-axe (existing) |
| **Target platform** | Microsoft Edge (primary), Chromium desktop |
| **Project type** | Local SPA extension — no backend, SharePoint API, or sync automation |
| **Performance** | Import parse+validate+normalize **&lt;500 ms median** for demo workbooks (&lt;2 MB) — **SC-009** required gate (`tests/perf/import-bench.test.ts`, G-009); evaluation still &lt;200 ms (001 target) |
| **Constraints** | Zero runtime network; zero project-data retention; Workbook Contract v1.0 only |
| **Scale** | Single user; one workbook per session; five worksheets; one snapshot row per sheet |

---

## Constitution Check

*GATE: Completed before Phase 0 and re-validated after Phase 1 design.*

Reference: `.specify/memory/constitution.md` v1.0.0

| Principle | Gate question | Design response | Status |
|-----------|---------------|-----------------|--------|
| **I. Specification-first** | Every capability maps to FR/AS? | `contracts/implementation-traceability.md` — FR-001–026, AS-001–025, SC-001–009 | ✅ PASS |
| **II. Local-only privacy** | No external runtime network, no persistence? | File picker only; bytes in memory; reset/reload clears import; parser bundled; no Graph/SharePoint | ✅ PASS |
| **III. Deterministic** | Scoring documented with evidence? | Reuses 001 Demonstration Rule Catalog; import adds normalization only; Unmeasured for empty dimension row 2 | ✅ PASS |
| **IV. Methodology-agnostic** | Normalized signals only? | Workbook columns → existing `mappingKey` / `CanonicalSignalType` | ✅ PASS |
| **V. Persona-safe** | Presentation only? | `SET_PERSONA` re-projects import evaluations; no evaluate on persona change | ✅ PASS |
| **VI. Simplicity** | Domain separated; deps justified? | `src/import/` pure functions; single parser dep in Complexity Tracking | ✅ PASS |
| **VII. Testability** | Automated tests planned? | Test-first matrix in §Testing Strategy; 001 regression guard | ✅ PASS |
| **VIII. UX & accessibility** | States designed? | `import-invalid`, provenance, refresh/reselect, keyboard flows in session contract | ✅ PASS |

**Gate status**: ✅ **PASS** — proceed to `/speckit-implement` after architecture-plan-readiness CHK001–CHK030.

### Post-design compliance evidence

| Area | Artifact |
|------|----------|
| Traceability | `contracts/implementation-traceability.md` |
| Parser ADR | `research.md` ADR-009 |
| Acquisition ADR | `research.md` ADR-010 |
| Import validation profile | `research.md` ADR-011 |
| Session modes | `contracts/import-session-state.md` |
| Workbook rules | `contracts/workbook-contract.md` |
| Quality gate | `checklists/architecture-plan-readiness.md` |

---

## Architecture Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| ADR-009 | `read-excel-file@9.2.0` behind async `WorkbookParserPort` | Current release; Vite bundler fix (9.2.0); `/node` for Vitest contract tests |
| ADR-010 | File System Access refresh + file-input **reselect** fallback | Handle: `getFile()` latest bytes; input: user must reselect |
| ADR-011 | Import-only `validateImportedProject` (zero signals allowed) | Bundled `validateProject` unchanged; 001 goldens untouched |
| ADR-012 | Four import stages before `runEvaluation` | Spec architectural separation |
| ADR-013 | Extend session with `projectMode` | Checklist visibility + mode switch clearing (FR-023, BR-006) |
| ADR-014 | Reuse 001 dashboard components | FR-015; no parallel health UI |
| ADR-015 | Synchronous pure `sessionReducer` + async `importController` | Lifecycle actions with `requestId`; acquisition/parse/load outside reducer; stale-result protection |
| ADR-016 | `ProjectValidator` via `createSessionReducer({ importedProjectValidator })` | `SessionProvider`/`AppProviders` supplies `validateImportedProject`; `sessionReducer.ts` must not import `src/import/**`; `SessionAction` payloads data-only |

001 ADRs (ADR-001–008) remain authoritative for baseline stack and evaluation.

---

## Extended Architecture (14 boundaries)

| # | Boundary | Location | Status |
|---|----------|----------|--------|
| 1–10 | 001 boundaries | `src/domain/`, `src/session/`, `src/features/` | **Unchanged** |
| 11 | File acquisition | `src/import/acquisition/` | **New** |
| 12 | Workbook parsing adapter | `src/import/parsing/` | **New** |
| 13 | Contract validation | `src/import/validation/` | **New** |
| 14 | Workbook normalization | `src/import/normalization/` | **New** |
| — | Import orchestration | `src/import/orchestration/` | **New** |
| — | Import controller (async) | `src/import/controller/` | **New** |
| — | Import UI | `src/features/import-snapshot/` | **New** |

```text
┌─────────────────────────────────────────────────────────────────┐
│  React UI (import buttons → importController, not async reducer) │
└────────────┬───────────────────────────────┬────────────────────┘
             │ controller dispatch            │ sync dispatch
┌────────────▼────────────┐    ┌─────────────▼────────────────────┐
│ importController (async) │    │ sessionReducer (sync, pure)       │
│ acquire→parse→load     │───►│ lifecycle actions + requestId     │
└────────────────────────┘    └─────────────┬────────────────────┘
      │ bundled                              │ imported (normalized in state)
      ▼                                      ▼
┌──────────────┐              ┌──────────────────────────────────┐
│ 001 fixtures │              │ runEvaluation (sync EVALUATE)     │
│ validateProject (default)    │ projectValidator: importedProjectValidator │
└──────┬───────┘              │ (from createSessionReducer closure)        │
       │                      └──────────────┬─────────────────────┘
       └───────────────────┬───────────────┘
                           ▼
              ┌────────────────────────┐
              │ scoring/findings/recs  │
              └────────────┬───────────┘
                           ▼
              ┌────────────────────────┐
              │ projectForPersona      │
              │ HealthDashboard (001)  │
              └────────────────────────┘
```

---

## Data Flow (import path)

See [contracts/import-functions.md](./contracts/import-functions.md).

```text
User selects .xlsx (controller: selectWorkbook before IMPORT_LOAD_STARTED)
  → cancel or context change → no session mutation
  → AcquiredWorkbook { bytes, reference }
  → dispatch IMPORT_LOAD_STARTED { requestId }
  → WorkbookParserPort.parse(bytes) → Promise<ParsedWorkbook>
  → validateWorkbookContract(workbook) → ok | WorkbookValidationResult
  → normalizeImportedWorkbook(workbook, meta) → ImportedSnapshotProject
  → dispatch IMPORT_LOAD_SUCCEEDED { requestId, normalizedProject }
  → (user Evaluate) sync EVALUATE in createSessionReducer closure
  → runEvaluation({ project, projectValidator: importedProjectValidator, enabledSignalGroupIds: ['import-workbook'] })
  → EvaluationResult → projectForPersona → Dashboard + ImportProvenanceBanner
```

Bundled path unchanged: `SELECT_PROJECT` → fixture → `validateProject` → evaluate with checklist-filtered groups.

---

## Project Structure

### Documentation

```text
specs/002-sharepoint-snapshot-import/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── workbook-contract.md
│   ├── import-functions.md
│   ├── import-session-state.md
│   └── implementation-traceability.md
└── checklists/
    ├── requirements.md
    └── architecture-plan-readiness.md
```

### Source Code (planned additions)

```text
src/
├── import/
│   ├── acquisition/
│   │   ├── workbookAcquisition.ts      # port + browser impl
│   │   └── types.ts
│   ├── parsing/
│   │   ├── WorkbookParserPort.ts
│   │   ├── mapSheetsToParsedWorkbook.ts  # shared mapping (node + browser adapters)
│   │   ├── createNodeReadExcelFileParser.ts
│   │   ├── createBrowserReadExcelFileParser.ts  # only browser read-excel-file import
│   │   └── types.ts
│   ├── validation/
│   │   ├── validateWorkbookContract.ts
│   │   ├── validateImportedProject.ts  # import-only profile (ADR-011)
│   │   └── validationCategories.ts
│   ├── normalization/
│   │   ├── normalizeImportedWorkbook.ts
│   │   └── workbookColumnRegistry.ts
│   ├── orchestration/
│   │   └── loadImportedProject.ts
│   └── controller/
│       └── importController.ts         # async acquisition/parse/load; dispatches lifecycle actions
├── domain/                             # 001 — scoring UNCHANGED; no src/import imports
│   ├── evaluation/runEvaluation.ts     # ProjectValidator injection only (ADR-016)
│   └── validation/projectValidator.ts  # type + default validateProject re-export
├── session/                            # createSessionReducer({ importedProjectValidator }); sync lifecycle + EVALUATE
│   ├── sessionReducer.ts               # MUST NOT import src/import/**
│   └── sessionActions.ts               # data-only payloads
├── app/
│   └── AppProviders.tsx                # supplies validateImportedProject to createSessionReducer
├── features/
│   └── import-snapshot/
│       ├── ImportSnapshotButton.tsx
│       ├── ImportProvenanceBanner.tsx
│       ├── ImportInvalidPanel.tsx
│       ├── RefreshSnapshotButton.tsx
│       └── ReselectWorkbookButton.tsx
└── data/fixtures/                      # 001 fixtures UNCHANGED

tests/
├── fixtures/workbooks/                 # authored .xlsx + README.md manifest (OI-001)
│   └── README.md                       # cell specs, expected outcomes, SHA-256
├── import/
│   ├── readExcelFileParser.contract.test.ts  # production createNodeReadExcelFileParser + shared mapper
│   ├── import-controller.test.ts       # FakeWorkbookAcquisition + FakeWorkbookParser
│   ├── loadImportedProject.test.ts     # injected FakeWorkbookParser
│   ├── invalid-evidence-exclusion.test.ts  # BR-003
│   ├── snapshot-date-authority.test.ts     # BR-004
│   ├── evidence-privacy.test.ts            # FR-014
│   └── validateWorkbookContract.test.ts
├── session/
│   ├── import-reducer.test.ts          # pure lifecycle transitions only
│   └── import-stale-async.test.ts      # stale requestId / BR-005
├── golden/import-*.test.ts             # no UI dependency
├── perf/import-bench.test.ts           # required <500 ms gate
├── integration/
│   ├── import-flow.test.tsx
│   ├── mode-switch.test.tsx
│   └── import-persona.test.tsx
├── privacy/                            # extended import privacy cases
└── a11y/                               # extended import keyboard/axe
```

**Structure decision**: Import concerns live under `src/import/` to avoid polluting `src/domain/` scoring modules. **`src/domain/**` and `sessionReducer.ts` MUST NOT import `src/import/**`**. `SessionProvider` / `AppProviders` wires `validateImportedProject` into `createSessionReducer`. UI calls `importController`; the **sync** reducer applies lifecycle results and synchronous `EVALUATE` only. Refresh failures are **fail-closed** (no stale scores).

---

## Complexity Tracking

| Addition | Why needed | Simpler alternative rejected |
|----------|------------|------------------------------|
| `read-excel-file@9.2.0` | Browser `.xlsx` parsing; `/node` for Vitest | Manual ZIP/XML — unmaintainable |
| `WorkbookParserPort` | Isolate third-party parser; test with fakes | Direct parser calls in validation — violates Principle VI |
| `projectMode` session field | Checklist visibility + state clearing per FR-023 | UI-only hiding — stale evaluation risk |
| `validateImportedProject` | Import-only: zero signals → all Unmeasured | Weakening bundled `validateProject` — rejected |
| `importController` + `importRequestId` | Async I/O outside pure reducer; stale-result protection | Async logic inside reducer — rejected |
| `FileSystemFileHandle` (optional) | Refresh without re-pick when permitted | Path-based refresh — forbidden by FR-004 |

No constitution violations requiring amendment.

---

## Testing Strategy (test-first)

Implementation order: **tests → pure import modules → session → UI**.

### Parser test layering (OI-003 resolved)

| Layer | What runs real parser | What uses injected port |
|-------|----------------------|-------------------------|
| **Parser contract** | `readExcelFileParser.contract.test.ts` uses production `createNodeReadExcelFileParser()` → shared `mapSheetsToParsedWorkbook` | — |
| **Validation / normalization** | Optional: contract output as input | Primary: `FakeWorkbookParser` for deterministic edge cases |
| **Orchestration** | — | `loadImportedProject.test.ts` injects `WorkbookParserPort` |
| **Controller** | — | `import-controller.test.ts` injects `FakeWorkbookAcquisition` + `FakeWorkbookParser` (OI-002) |
| **Reducer** | — | Pure lifecycle transition tests only — no I/O |
| **Browser production adapter** | Manual **MV-008** in Edge/Chrome + `npm run build` | **Not** jsdom/Vitest Web Worker claims |

Web Worker behaviour is verified by **manual MV-008** and build bundle inspection. Domain, validation, normalization, orchestration, reducer, and controller unit tests MUST NOT depend on Web Workers.

Fixture manifest: `tests/fixtures/workbooks/README.md` (SHA-256 verified when binaries authored).

| Layer | Scope | 001 regression |
|-------|-------|----------------|
| Unit | `validateWorkbookContract`, `normalizeImportedWorkbook`, parser adapter, acquisition MIME guard | N/A |
| Golden | Complete import ≈ canonical inputs; incomplete/partial; deterministic repeat | 001 goldens **unchanged** |
| Integration | Import flow, mode switch, checklist visibility, Sample B fallback | 001 integration **unchanged** |
| Privacy | No storage; reset clears bytes; no fetch during import | Extend suite |
| A11y | Import, invalid panel recovery, refresh keyboard | Extend suite |
| Perf | **Required**: `tests/perf/import-bench.test.ts` median &lt;500 ms on `complete-v1.xlsx` | 001 eval bench **unchanged** |

### Mandatory scenarios (from spec)

| Scenario | Test home |
|----------|-----------|
| Complete valid workbook | `golden/import-complete.test.ts` |
| Incomplete → Partial/Unmeasured | `golden/import-incomplete-*.test.ts` |
| All dimensions empty row 2 (ADR-011) | `import/all-dimensions-unmeasured.test.ts` |
| Invalid template, Project row 2, headers, rows 3+ | `import/validateWorkbookContract.test.ts` |
| Unsupported file type | `import/acquisition.test.ts` |
| Provenance | integration + normalization unit |
| Deterministic repeat | golden |
| Refresh changed workbook | integration |
| Mode switch + checklist | `integration/mode-switch.test.tsx` |
| Bundled/imported mutual exclusion (BR-005) | `session/import-reducer.test.ts`, `session/import-stale-async.test.ts` |
| Malformed dimension values (BR-003) | `import/invalid-evidence-exclusion.test.ts` |
| asOfDate authority (BR-004) | `import/snapshot-date-authority.test.ts` |
| Evidence privacy (FR-014) | `import/evidence-privacy.test.ts` + drilldown UI |
| Persona invariance | `integration/import-persona.test.tsx` |
| Reset/reload privacy | privacy |
| Keyboard/a11y | a11y |
| Refresh structural failure (fail-closed) | `import-reducer.test.ts`, `import-refresh.test.tsx` (AS-024) |
| Reselect required — no stale scores | `import-refresh.test.tsx` (AS-025) |
| Import perf (SC-009) | `perf/import-bench.test.ts` (required) |

**Windows note**: Continue `--pool=threads --maxWorkers=2` for full suite stability (001 documented).

---

## Imported Presentation (reuse 001)

| Element | Approach |
|---------|----------|
| Dashboard | Reuse `HealthDashboard`, `DimensionCard`, `RecommendationsList` |
| Evidence | Extend drilldown to show workbook provenance fields (FR-013) |
| Provenance banner | New `ImportProvenanceBanner` — filename, as-of, last modified, trust copy (FR-026) |
| Invalid state | New `ImportInvalidPanel` — mirrors `InvalidSampleDataPanel` patterns |
| Evaluate / Reset | Reuse 001 controls |
| Checklist | `IntegrationChecklist` rendered only when `projectMode === 'bundled'` |

---

## Quality Gates

See [quickstart.md](./quickstart.md) §Quality gates (G-001–G-009).

Additional gate before release: `checklists/architecture-plan-readiness.md` CHK001–CHK030 pass.

---

## Resolved / remaining open items

| ID | Status | Resolution |
|----|--------|------------|
| OI-001 | ✅ Resolved | `tests/fixtures/workbooks/README.md` manifest; binaries committed at implementation |
| OI-003 | ✅ Resolved | Node contract tests + injected port; browser smoke isolated |
| OI-002 | ✅ Resolved | `FakeWorkbookAcquisition` in `tests/import/`; used in controller + integration tests |
| OI-004 | ✅ Resolved | `ProjectValidator` optional on `EvaluationInput`; default `validateProject`; import wiring passes `validateImportedProject` |

---

## Phase Completion

| Phase | Output | Status |
|-------|--------|--------|
| Phase 0 | `research.md` | ✅ Complete |
| Phase 1 | `data-model.md`, `contracts/*`, `quickstart.md` | ✅ Complete |
| Phase 2 | `tasks.md` | ✅ Complete (final remediation T201–T285) |

---

## Suggested Next Command

`/speckit-implement` — after architecture-plan-readiness CHK001–CHK030 pass and reviewer sign-off on ADR-015/ADR-016.
