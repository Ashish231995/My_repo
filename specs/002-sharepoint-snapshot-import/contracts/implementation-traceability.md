# Implementation Traceability: SharePoint-Synced Project Snapshot Import

**Feature**: `002-sharepoint-snapshot-import`  
**Date**: 2026-07-01 (reconciled 2026-06-29)  
**Baseline**: `001-pm-copilot-demo/contracts/implementation-traceability.md` (127 items — **unchanged**)

## Summary

| Artifact | Planned items | Notes |
|----------|---------------|-------|
| FR-001–FR-026 | 26 | All mapped |
| BR-001–BR-006 | 6 | Import extensions |
| AS-001–AS-025 | 25 | Spec index (incl. refresh fail-closed) |
| SC-001–SC-009 | 9 | Success criteria (SC-009 perf) |

**001 regression rule**: All existing golden, integration, privacy, perf, and a11y tests for `001-pm-copilot-demo` MUST remain unmodified and green after 002 implementation.

---

## Functional requirements

| ID | Requirement summary | Module(s) | Test layer |
|----|---------------------|-----------|------------|
| FR-001 | Sample A–C listed | `src/features/project-selector/` | integration (unchanged) |
| FR-002 | Import action | `src/features/import-snapshot/ImportSnapshotButton.tsx` → `importController` | integration |
| FR-003 | `.xlsx` file selection | `src/import/acquisition/` | unit + integration |
| FR-004 | No URL/API/path entry | acquisition + UI review | privacy + integration |
| FR-005 | Contract structure validation | `src/import/validation/` | unit (no UI) |
| FR-006 | Reject non-xlsx | acquisition | unit |
| FR-007 | Structural vs evidence separation | validation + normalization | unit |
| FR-008 | No fabricated scores on invalid | reducer lifecycle + `ImportInvalidPanel` | integration |
| FR-009 | In-memory parse/normalize | import orchestration + controller | unit |
| FR-010 | Reuse `runEvaluation` | `createSessionReducer` + sync `EVALUATE` | integration + golden import |
| FR-011 | Complete → 4 Measured | `tests/golden/import-complete.test.ts` | golden (no UI) |
| FR-012 | Incomplete → Partial/Unmeasured | `tests/golden/import-incomplete-*.test.ts` | golden (no UI) |
| FR-013 | Provenance on evidence | normalization + EvidenceDrilldown | unit + integration |
| FR-014 | No sensitive raw exposure | `evidence-privacy.test.ts` + drilldown | unit + integration |
| FR-015 | Provenance banner | `ImportProvenanceBanner.tsx` | integration |
| FR-016 | Refresh snapshot | `importController` + acquisition | integration |
| FR-017 | Replace on refresh | controller → lifecycle; fail-closed on `REFRESH_FAILED` (spec AS-024) | integration |
| FR-018 | Deterministic repeat | golden | golden |
| FR-019 | Reset clears import | session + privacy | privacy |
| FR-020 | Samples still work | integration regression | integration |
| FR-021 | Persona presentation only | persona tests | integration |
| FR-022 | Keyboard flows | a11y import tests | a11y |
| FR-023 | Checklist bundled-only | App + session `projectMode` | integration |
| FR-024 | Memory-only bytes | privacy audit | privacy |
| FR-025 | No upload/telemetry | privacy audit | privacy |
| FR-026 | Trust messaging | `ImportProvenanceBanner` | integration |

---

## Business rules

| ID | Rule | Enforced in | Primary test |
|----|------|-------------|--------------|
| BR-001 | No import-only scoring | normalization keys → `MAPPING_REGISTRY` only | `normalizeImportedWorkbook.test.ts` |
| BR-002 | No imputation | normalization (skip empty cells) | golden incomplete |
| BR-003 | Invalid cells → exclude | `validateSignal` (001) via normalized signals | `invalid-evidence-exclusion.test.ts` |
| BR-004 | `asOfDate` authoritative | normalization → snapshot + recommendation timing | `snapshot-date-authority.test.ts` |
| BR-005 | One context at a time | `projectMode` + `importRequestId` | `import-reducer.test.ts`, `import-stale-async.test.ts` |
| BR-006 | Mode switch clears state | reducer `SELECT_PROJECT` / reset | `mode-switch.test.tsx` |

---

## Acceptance scenarios

| ID | Theme | Primary test |
|----|-------|--------------|
| AS-001 | Complete import + evaluate | `import-complete.test.ts` (pipeline); `import-flow.test.tsx` (UI + reducer EVALUATE) |
| AS-002 | Provenance banner | integration import |
| AS-003 | Four Measured | golden import complete |
| AS-004 | Unmeasured dimension | `import-incomplete-team.test.ts` |
| AS-005 | Partial dimension | `import-partial-schedule.test.ts` |
| AS-006 | No fabricated values | unit normalization + golden |
| AS-007 | Reject non-xlsx | `acquisition.test.ts` |
| AS-008 | Structural invalid | `validateWorkbookContract.test.ts` |
| AS-009 | Recovery to samples | integration |
| AS-010 | Refresh after change | integration refresh |
| AS-011 | Replace in-memory | integration |
| AS-012 | Reselect on permission loss | integration (FakeWorkbookAcquisition) |
| AS-013 | Deterministic repeat | golden |
| AS-014 | Persona invariance | integration import-persona |
| AS-015 | Reset clears import | privacy |
| AS-016 | Sample B fallback | integration regression |
| AS-017 | No persistence | privacy |
| AS-018 | Keyboard import/recovery | a11y |
| AS-019 | Trust messaging | integration |
| AS-020 | No runtime network | privacy |
| AS-021 | Template 1.0 pass | `validateWorkbookContract.test.ts` (T211, T255) |
| AS-022 | Unsupported template | `validateWorkbookContract.test.ts` |
| AS-023 | Mode switch + checklist | integration mode-switch |
| AS-024 | Refresh fail-closed (`REFRESH_FAILED`) | `import-reducer.test.ts`, `import-controller.test.ts`, `import-refresh.test.tsx` |
| AS-025 | Reselect required — no stale scores | `import-refresh.test.tsx`, `import-reducer.test.ts` |

---

## Success criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| SC-001 | Complete import session | AS-001 + privacy network check |
| SC-002 | Repeat identical | AS-013 |
| SC-003 | Persona invariance | AS-014 |
| SC-004 | Invalid blocked 100% | AS-007, AS-008, AS-022 suite |
| SC-005 | Reset clears | AS-015, AS-017 |
| SC-006 | Sample B after import | AS-016 |
| SC-007 | Keyboard flows | AS-018 |
| SC-008 | Refresh updates | AS-010, AS-011 |
| SC-009 | Import perf &lt;500 ms median | T277, G-009, `perf/import-bench.test.ts` |

---

## Module → test file map (new)

| Module | Unit tests | Integration |
|--------|------------|-------------|
| `import/parsing/` | `readExcelFileParser.contract.test.ts` (production `createNodeReadExcelFileParser` + shared mapper) | Manual MV-008 (browser adapter) |
| `import/acquisition/` | `acquisition.test.ts` | `import-flow.test.tsx`, `import-refresh.test.tsx` |
| `import/validation/` | `validateWorkbookContract.test.ts` | — |
| `import/normalization/` | `normalizeImportedWorkbook.test.ts`, `all-dimensions-unmeasured.test.ts`, `invalid-evidence-exclusion.test.ts`, `snapshot-date-authority.test.ts`, `evidence-privacy.test.ts` | — |
| `import/orchestration/` | `loadImportedProject.test.ts` (injected `FakeWorkbookParser`) | — |
| `import/controller/` | `import-controller.test.ts` (`FakeWorkbookAcquisition` + `FakeWorkbookParser`) | `import-flow.test.tsx`, `import-refresh.test.tsx` |
| `session/` (extensions) | `import-reducer.test.ts` (`createSessionReducer` + stub validator), `import-stale-async.test.ts` | `mode-switch.test.tsx` |
| `domain/evaluation/` | 001 goldens (bundled default validator) | — |
| `features/import-snapshot/` | — | `import-flow.test.tsx`, `import-invalid.test.tsx` |
| Golden import | — | `golden/import-*.test.ts` (no UI) |
| Perf | `perf/import-bench.test.ts` (required, SC-009) | — |

---

## 001 modules explicitly NOT modified

| Path | Constraint |
|------|------------|
| `src/domain/scoring/**` | No edits |
| `src/domain/recommendations/**` | No edits |
| `specs/001-pm-copilot-demo/contracts/scoring-rules.md` | No edits |
| `specs/001-pm-copilot-demo/contracts/signal-health-mapping.md` | No edits |
| `specs/001-pm-copilot-demo/contracts/recommendation-rules.md` | No edits |
| `tests/golden/*` (001 fixtures) | No expectation changes |
| `src/data/fixtures/sample-project-*.json` | No edits |

**Allowed minimal 001 touch**:

- `ProjectValidator` type + optional `projectValidator` on `EvaluationInput`
- `runEvaluation` calls `input.projectValidator ?? validateProject` — **no import from `src/import/**`**
- **`createSessionReducer({ importedProjectValidator })`** — `SessionProvider` / `AppProviders` passes `validateImportedProject`
- **`sessionReducer.ts` MUST NOT import `src/import/**`**; `SessionAction` payloads remain data-only
- **`validateImportedProject`** as new function under `src/import/validation/` (import-only)

**Do not alter** bundled `validateProject` behaviour or 001 golden expectations.

---

## Task coverage index (T201–T285)

| Requirement | Tasks |
|-------------|-------|
| BR-003 | T207, T216, T230 |
| BR-004 | T217, T230 |
| BR-005 | T218, T247, T268, T269, T272 |
| FR-014 | T221, T248 |
| AS-024 / AS-025 | T218, T219, T239, T260 |
| SC-009 | T277 |
| Stale async completion | T218, T219, T268, T272 |
| OI-002 | T206, T219, T242, T260 |
| OI-003 / shared mapper | T210, T224, T225, T226, T278 |
| Reducer EVALUATE path | T218, T238, T242 |
| Pure reducer + validator factory | T218, T238 |
| Controller async + picker-before-load | T219, T239, T240 |
| Refresh fail-closed | T218, T219, T239, T260 |
| Manual MV-008 | T278, T284 |
