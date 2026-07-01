# Implementation Plan: SharePoint-Synced Project Snapshot Import

**Branch**: `002-sharepoint-snapshot-import` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

**Input**: Approved specification with UD-001–UD-003 resolved and Project vs dimension row-2 rules aligned (validation iteration 3).

**Planning scope**: Design artifacts only. No application implementation, no `tasks.md`, no `package.json` changes, no edits to `001-pm-copilot-demo` scoring contracts or completed task history.

**Baseline**: Extends completed `001-pm-copilot-demo` (Demonstration Rule Catalog v1.0 APPROVED, Phase 8A gates passed).

---

## Summary

Feature 002 adds a **browser-local `.xlsx` import path** for OneDrive-synchronized SharePoint workbooks. The implementation introduces four new boundaries — **acquisition**, **parsing**, **contract validation**, and **normalization** — then hands off to the **unchanged** `runEvaluation` pipeline from 001.

**Technical approach**: Extend the existing Vite + React 19 + TypeScript 6 SPA with `src/import/` pure modules, session mode orchestration (`bundled` | `imported`), and `read-excel-file@9.2.0` (MIT) behind async `WorkbookParserPort`. Reuse dashboard, persona projection, evidence drilldown, and reset flows. Test-first with dedicated import unit/golden/integration/a11y/privacy suites while **001 golden tests remain unmodified**.

**Remediation (2026-07-01)**: ADR-009 revised to `9.2.0`; OI-001/OI-003 resolved; ADR-010 refresh semantics clarified; ADR-011 import-only profile confirmed.

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
| **Performance** | Import parse+validate+normalize <500 ms for demo workbooks (<2 MB); evaluation still <200 ms (001 target) |
| **Constraints** | Zero runtime network; zero project-data retention; Workbook Contract v1.0 only |
| **Scale** | Single user; one workbook per session; five worksheets; one snapshot row per sheet |

---

## Constitution Check

*GATE: Completed before Phase 0 and re-validated after Phase 1 design.*

Reference: `.specify/memory/constitution.md` v1.0.0

| Principle | Gate question | Design response | Status |
|-----------|---------------|-----------------|--------|
| **I. Specification-first** | Every capability maps to FR/AS? | `contracts/implementation-traceability.md` — FR-001–026, AS-001–023, SC-001–008 | ✅ PASS |
| **II. Local-only privacy** | No external runtime network, no persistence? | File picker only; bytes in memory; reset/reload clears import; parser bundled; no Graph/SharePoint | ✅ PASS |
| **III. Deterministic** | Scoring documented with evidence? | Reuses 001 Demonstration Rule Catalog; import adds normalization only; Unmeasured for empty dimension row 2 | ✅ PASS |
| **IV. Methodology-agnostic** | Normalized signals only? | Workbook columns → existing `mappingKey` / `CanonicalSignalType` | ✅ PASS |
| **V. Persona-safe** | Presentation only? | `SET_PERSONA` re-projects import evaluations; no evaluate on persona change | ✅ PASS |
| **VI. Simplicity** | Domain separated; deps justified? | `src/import/` pure functions; single parser dep in Complexity Tracking | ✅ PASS |
| **VII. Testability** | Automated tests planned? | Test-first matrix in §Testing Strategy; 001 regression guard | ✅ PASS |
| **VIII. UX & accessibility** | States designed? | `import-invalid`, provenance, refresh/reselect, keyboard flows in session contract | ✅ PASS |

**Gate status**: ✅ **PASS** — proceed to architecture review and `/speckit-tasks` when approved.

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
| — | Import UI | `src/features/import-snapshot/` | **New** |

```text
┌─────────────────────────────────────────────────────────────────┐
│  React UI (project selector, import controls, dashboard reuse)   │
└────────────────────────────┬────────────────────────────────────┘
                             │ dispatch
┌────────────────────────────▼────────────────────────────────────┐
│  Session reducer (projectMode: none | bundled | imported)         │
└─────┬───────────────────────────────────────┬───────────────────┘
      │ bundled                                │ imported
      ▼                                        ▼
┌──────────────┐                    ┌──────────────────────────────┐
│ 001 fixtures │                    │ acquire → parse → validate   │
│ validateProject                  │ → normalizeImportedWorkbook    │
└──────┬───────┘                    └──────────────┬───────────────┘
       │                                           │
       └───────────────────┬───────────────────────┘
                           ▼
              ┌────────────────────────┐
              │ runEvaluation (001)    │
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
User selects .xlsx
  → AcquiredWorkbook { bytes, reference }
  → WorkbookParserPort.parse(bytes) → Promise<ParsedWorkbook>
  → validateWorkbookContract(workbook) → ok | WorkbookValidationResult
  → normalizeImportedWorkbook(workbook, meta) → ImportedSnapshotProject
  → validateImportedProject(project)
  → runEvaluation({ project, projectOrigin: 'imported', enabledSignalGroupIds: ['import-workbook'] })
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
│   │   ├── readExcelFileParser.ts      # only file importing read-excel-file/browser
│   │   └── types.ts                    # ParsedWorkbook, ParsedSheet
│   ├── validation/
│   │   ├── validateWorkbookContract.ts
│   │   └── validationCategories.ts
│   ├── normalization/
│   │   ├── normalizeImportedWorkbook.ts
│   │   ├── workbookColumnRegistry.ts
│   │   └── validateImportedProject.ts
│   └── orchestration/
│       └── loadImportedProject.ts
├── domain/                             # 001 — scoring/evaluation UNCHANGED
│   └── evaluation/runEvaluation.ts     # minimal projectOrigin branch only
├── session/                            # extended reducer + types
├── features/
│   └── import-snapshot/
│       ├── ImportSnapshotButton.tsx
│       ├── ImportProvenanceBanner.tsx
│       ├── ImportInvalidPanel.tsx
│       ├── RefreshSnapshotButton.tsx
│       └── ReselectWorkbookButton.tsx
└── data/fixtures/                      # 001 fixtures UNCHANGED

tests/
├── fixtures/workbooks/                 # committed .xlsx + README.md manifest (OI-001)
│   └── README.md                       # cell specs, expected outcomes, SHA-256
├── import/
│   ├── readExcelFileParser.contract.test.ts  # read-excel-file/node + real binaries
│   ├── loadImportedProject.test.ts     # injected FakeWorkbookParser
│   └── validateWorkbookContract.test.ts
├── browser/
│   └── import-parser.smoke.test.ts     # read-excel-file/browser smoke (one fixture)
├── golden/import-*.test.ts
├── integration/
│   ├── import-flow.test.tsx
│   ├── mode-switch.test.tsx
│   └── import-persona.test.tsx
├── privacy/                            # extended import privacy cases
└── a11y/                               # extended import keyboard/axe
```

**Structure decision**: Import concerns live under `src/import/` to avoid polluting `src/domain/` scoring modules. UI is thin; session orchestrates mode and evaluation handoff.

---

## Complexity Tracking

| Addition | Why needed | Simpler alternative rejected |
|----------|------------|------------------------------|
| `read-excel-file@9.2.0` | Browser `.xlsx` parsing; `/node` for Vitest | Manual ZIP/XML — unmaintainable |
| `WorkbookParserPort` | Isolate third-party parser; test with fakes | Direct parser calls in validation — violates Principle VI |
| `projectMode` session field | Checklist visibility + state clearing per FR-023 | UI-only hiding — stale evaluation risk |
| `validateImportedProject` | Import-only: zero signals → all Unmeasured | Weakening bundled `validateProject` — rejected |
| `FileSystemFileHandle` (optional) | Refresh without re-pick when permitted | Path-based refresh — forbidden by FR-004 |

No constitution violations requiring amendment.

---

## Testing Strategy (test-first)

Implementation order: **tests → pure import modules → session → UI**.

### Parser test layering (OI-003 resolved)

| Layer | What runs real parser | What uses injected port |
|-------|----------------------|-------------------------|
| **Parser contract** | `tests/import/readExcelFileParser.contract.test.ts` reads committed binaries via `read-excel-file/node` | — |
| **Validation / normalization** | Optional: contract tests feed `ParsedWorkbook` from real parser output | Primary: `FakeWorkbookParser` for deterministic edge cases |
| **Orchestration** | — | `loadImportedProject.test.ts` always injects `WorkbookParserPort` |
| **Integration / session** | — | Mock acquisition + parser or pre-normalized projects |
| **Browser smoke** | `tests/browser/import-parser.smoke.test.ts` — one fixture via `read-excel-file/browser` | — |

Web Worker behaviour is **isolated** to browser adapter + single smoke test. Domain, validation, normalization, and orchestration tests MUST NOT depend on Web Workers.

Fixture manifest: `tests/fixtures/workbooks/README.md` (SHA-256 verified at commit).

| Layer | Scope | 001 regression |
|-------|-------|----------------|
| Unit | `validateWorkbookContract`, `normalizeImportedWorkbook`, parser adapter, acquisition MIME guard | N/A |
| Golden | Complete import ≈ canonical inputs; incomplete/partial; deterministic repeat | 001 goldens **unchanged** |
| Integration | Import flow, mode switch, checklist visibility, Sample B fallback | 001 integration **unchanged** |
| Privacy | No storage; reset clears bytes; no fetch during import | Extend suite |
| A11y | Import, invalid panel recovery, refresh keyboard | Extend suite |
| Perf | Optional: import bench <500 ms on complete fixture | 001 eval bench **unchanged** |

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
| Persona invariance | `integration/import-persona.test.tsx` |
| Reset/reload privacy | privacy |
| Keyboard/a11y | a11y |

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

See [quickstart.md](./quickstart.md) §Quality gates (G-001–G-008).

Additional gate before release: `checklists/architecture-plan-readiness.md` CHK001–CHK020 pass.

---

## Resolved / remaining open items

| ID | Status | Resolution |
|----|--------|------------|
| OI-001 | ✅ Resolved | `tests/fixtures/workbooks/README.md` manifest; binaries committed at implementation |
| OI-003 | ✅ Resolved | Node contract tests + injected port; browser smoke isolated |
| OI-002 | Open (non-blocking) | Mock `WorkbookAcquisitionPort` in integration tests |
| OI-004 | Open (non-blocking) | `EvaluationInput.projectOrigin` optional (default `bundled`) |

---

## Phase Completion

| Phase | Output | Status |
|-------|--------|--------|
| Phase 0 | `research.md` | ✅ Complete |
| Phase 1 | `data-model.md`, `contracts/*`, `quickstart.md` | ✅ Complete |
| Phase 2 | `tasks.md` | ⏸ Not in scope (await `/speckit-tasks`) |

---

## Suggested Next Command

`/speckit-tasks` — after architecture review sign-off on ADR-009 (parser) and ADR-011 (import validation profile).
