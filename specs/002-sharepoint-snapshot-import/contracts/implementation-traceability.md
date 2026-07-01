# Implementation Traceability: SharePoint-Synced Project Snapshot Import

**Feature**: `002-sharepoint-snapshot-import`  
**Date**: 2026-07-01  
**Baseline**: `001-pm-copilot-demo/contracts/implementation-traceability.md` (127 items — **unchanged**)

## Summary

| Artifact | Planned items | Notes |
|----------|---------------|-------|
| FR-001–FR-026 | 26 | All mapped |
| BR-001–BR-006 | 6 | Import extensions |
| AS-001–AS-023 | 23 | From spec index |
| SC-001–SC-008 | 8 | Success criteria |

**001 regression rule**: All existing golden, integration, privacy, perf, and a11y tests for `001-pm-copilot-demo` MUST remain unmodified and green after 002 implementation.

---

## Functional requirements

| ID | Requirement summary | Module(s) | Test layer |
|----|---------------------|-----------|------------|
| FR-001 | Sample A–C listed | `src/features/project-selector/` | integration (unchanged) |
| FR-002 | Import action | `src/features/import-snapshot/ImportSnapshotButton.tsx` | integration |
| FR-003 | `.xlsx` file selection | `src/import/acquisition/` | unit + integration |
| FR-004 | No URL/API/path entry | acquisition + UI review | privacy + integration |
| FR-005 | Contract structure validation | `src/import/validation/` | unit |
| FR-006 | Reject non-xlsx | acquisition | unit |
| FR-007 | Structural vs evidence separation | validation + normalization | unit |
| FR-008 | No fabricated scores on invalid | session + `ImportInvalidPanel` | integration |
| FR-009 | In-memory parse/normalize | import orchestration | unit |
| FR-010 | Reuse `runEvaluation` | session reducer | integration + golden import |
| FR-011 | Complete → 4 Measured | `tests/golden/import-complete.test.ts` | golden |
| FR-012 | Incomplete → Partial/Unmeasured | `tests/golden/import-incomplete.test.ts` | golden |
| FR-013 | Provenance on evidence | normalization + EvidenceDrilldown | unit + integration |
| FR-014 | No sensitive raw exposure | UI review | integration |
| FR-015 | Provenance banner | `ImportProvenanceBanner.tsx` | integration |
| FR-016 | Refresh snapshot | acquisition + session | integration |
| FR-017 | Replace on refresh | session | integration |
| FR-018 | Deterministic repeat | golden | golden |
| FR-019 | Reset clears import | session + privacy | privacy |
| FR-020 | Samples still work | integration regression | integration |
| FR-021 | Persona presentation only | persona tests | integration |
| FR-022 | Keyboard flows | a11y import tests | a11y |
| FR-023 | Checklist bundled-only | App + session | integration |
| FR-024 | Memory-only bytes | privacy audit | privacy |
| FR-025 | No upload/telemetry | privacy audit | privacy |
| FR-026 | Trust messaging | `ImportProvenanceBanner` | integration |

---

## Business rules

| ID | Rule | Enforced in |
|----|------|-------------|
| BR-001 | No import-only scoring | normalization keys → `MAPPING_REGISTRY` only |
| BR-002 | No imputation | normalization (skip empty cells) |
| BR-003 | Invalid cells → exclude | `validateSignal` (001) |
| BR-004 | `asOfDate` authoritative | normalization → snapshot |
| BR-005 | One context at a time | session mode |
| BR-006 | Mode switch clears state | session reducer |

---

## Acceptance scenarios

| ID | Theme | Primary test |
|----|-------|--------------|
| AS-001 | Complete import + evaluate | `import-complete.test.ts` |
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
| AS-012 | Reselect on permission loss | integration (mock) |
| AS-013 | Deterministic repeat | golden |
| AS-014 | Persona invariance | integration import-persona |
| AS-015 | Reset clears import | privacy |
| AS-016 | Sample B fallback | integration regression |
| AS-017 | No persistence | privacy |
| AS-018 | Keyboard import/recovery | a11y |
| AS-019 | Trust messaging | integration |
| AS-020 | No runtime network | privacy |
| AS-021 | Template 1.0 pass | validation unit |
| AS-022 | Unsupported template | validation unit |
| AS-023 | Mode switch + checklist | integration mode-switch |

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

---

## Module → test file map (new)

| Module | Unit tests | Integration |
|--------|------------|-------------|
| `import/parsing/` | `tests/import/readExcelFileParser.contract.test.ts` (`read-excel-file/node` + fixtures) | `tests/browser/import-parser.smoke.test.ts` (browser entry) |
| `import/acquisition/` | `tests/import/acquisition.test.ts` | `tests/integration/import-flow.test.tsx` |
| `import/validation/` | `tests/import/validateWorkbookContract.test.ts` | — |
| `import/normalization/` | `tests/import/normalizeImportedWorkbook.test.ts`, `tests/import/all-dimensions-unmeasured.test.ts` | — |
| `import/orchestration/` | `tests/import/loadImportedProject.test.ts` (**injected** `WorkbookParserPort`) | — |
| `session/` (extensions) | `tests/session/import-reducer.test.ts` | `tests/integration/mode-switch.test.tsx` |
| `features/import-snapshot/` | — | `tests/integration/import-ui.test.tsx` |
| Golden import | — | `tests/golden/import-*.test.ts` |

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

**Allowed minimal 001 touch**: `EvaluationInput` optional `projectOrigin`; **`validateImportedProject` as new function** (import-only); `runEvaluation` dispatches to `validateProject` (bundled, unchanged) or `validateImportedProject` (import). **Do not alter** bundled `validateProject` behaviour or 001 golden expectations.
