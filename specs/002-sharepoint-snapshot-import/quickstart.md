# Quickstart: SharePoint-Synced Project Snapshot Import

**Feature**: `002-sharepoint-snapshot-import`  
**Date**: 2026-07-01  
**Prerequisite**: Completed `001-pm-copilot-demo` build green on branch

## Purpose

Validate import feature end-to-end after implementation (`/speckit-implement`). This guide defines **commands and expected outcomes** — not implementation code.

---

## Prerequisites

1. Node.js LTS compatible with Vite 8 / TypeScript 6.
2. `npm install` (includes pinned `read-excel-file@9.2.0` when implementation adds it).
3. Workbook test fixtures at `tests/fixtures/workbooks/` per manifest `tests/fixtures/workbooks/README.md`.
4. Baseline green before import work:

```bash
npm run typecheck
npm run test -- --pool=threads --maxWorkers=2
```

---

## Local run

```bash
npm run dev
```

Open `http://localhost:5173` (or Vite-reported port). Confirm Sample B still evaluates before testing import.

---

## Manual validation scenarios

### MV-001 — Complete workbook import

1. Click **Import SharePoint-synced snapshot**.
2. Select `tests/fixtures/workbooks/complete-v1.xlsx`.
3. Click **Evaluate**.
4. **Expect**: Provenance banner (filename, as-of date, last modified); four **Measured** dimensions; composite eligible; no network requests (DevTools Network tab empty of external calls).

### MV-002 — Incomplete Team (empty row 2)

1. Import `incomplete-team-empty-row2.xlsx`.
2. Evaluate.
3. **Expect**: Import succeeds; Team **Unmeasured**; no fabricated Team score.

### MV-003 — Invalid template version

1. Import `invalid-template-version.xlsx`.
2. **Expect**: Structural failure panel; no dashboard scores; recovery to Sample A works.

### MV-004 — Refresh after local edit

**File-picker tier** (File System Access):

1. Import complete workbook via native picker; evaluate.
2. Edit workbook locally; save.
3. Click **Refresh snapshot** — app calls `fileHandle.getFile()` and reads latest bytes.
4. Re-evaluate — Schedule (or changed dimension) reflects new values.

**File-input tier** (fallback):

1. Import via file input; evaluate.
2. Edit workbook locally; save.
3. Click **Refresh snapshot** — app prompts **Reselect workbook** (no automatic byte refresh).
4. Reselect the same synchronized file; evaluate — updated values appear.

### MV-005 — Mode switch

1. Import and evaluate workbook.
2. Select **Sample Project B**.
3. **Expect**: Import context cleared; checklist visible; Sample B evaluates with golden behaviour.
4. Import again.
5. **Expect**: Checklist hidden; prior bundled evaluation cleared.

### MV-006 — Reset privacy

1. Import and evaluate.
2. Reset session (confirm if prompted).
3. **Expect**: No import banner; no workbook metadata; Intermediate persona default.

### MV-007 — Keyboard

1. Tab to Import control; activate with Enter/Space.
2. Complete import + evaluate + reset using keyboard only.
3. **Expect**: All controls reachable without pointer.

### MV-008 — Production browser parser smoke (required)

1. Run `npm run build` then `npm run preview` (or `npm run dev`).
2. Open in **Microsoft Edge** or **Chrome** (not jsdom).
3. Import `tests/fixtures/workbooks/complete-v1.xlsx` via the app UI using the production `createBrowserReadExcelFileParser` path.
4. **Expect**: Parse succeeds; four Measured dimensions after evaluate; DevTools Network shows no external fetch for parser.
5. **Note**: Web Worker behaviour is **not** verified by Vitest/jsdom — this manual step is the production-adapter gate (OI-003).

---

## Automated validation (post-implementation)

```bash
# Full suite including 001 regression
npm run test -- --pool=threads --maxWorkers=2

# Import-focused (parser contract uses production createNodeReadExcelFileParser)
npm run test -- tests/import/readExcelFileParser.contract.test.ts
npm run test -- tests/import
npm run test -- tests/session/import-reducer.test.ts tests/session/import-stale-async.test.ts
npm run test -- tests/golden/import
npm run test -- tests/integration/import-flow.test.tsx
npm run test -- tests/integration/mode-switch.test.tsx
npm run test -- tests/perf/import-bench.test.ts

# Privacy + a11y extensions
npm run test:privacy
npm run test:a11y

# Build gate
npm run typecheck
npm run build
```

**Expect**: All pass; 001 golden tests unchanged.

---

## Quality gates (002 extension)

| Gate | Command / check | Pass criteria |
|------|-----------------|---------------|
| G-001 | `npm run typecheck` | Zero errors |
| G-002 | Full `npm run test` | 001 + 002 green |
| G-003 | `npm run test:golden` | 001 goldens unchanged; import goldens pass |
| G-004 | `npm run test:privacy` | No storage; no fetch; reset clears import |
| G-005 | `npm run test:a11y` | Import controls axe-clean |
| G-006 | `npm run build` | Bundle includes parser; no runtime CDN |
| G-007 | Manual MV-001–MV-008 | Demonstration script ready |
| G-008 | Traceability spot-check | `contracts/implementation-traceability.md` coverage |
| G-009 | `tests/perf/import-bench.test.ts` | Median parse+validate+normalize &lt;500 ms on committed `complete-v1.xlsx` (&lt;2 MB); **SC-009**; warm-cache optional discard; report median of ≥5 runs |

---

## Architecture review packet

Before `/speckit-implement`, reviewers should read:

1. `plan.md` — boundaries and constitution gate
2. `research.md` — ADR-009 parser choice
3. `contracts/workbook-contract.md` — validation rules
4. `contracts/import-session-state.md` — mode orchestration
5. `checklists/architecture-plan-readiness.md` — gate checklist

---

## References

- Spec: `spec.md`
- Data model: `data-model.md`
- Import functions: `contracts/import-functions.md`
- 001 evaluation pipeline: `../001-pm-copilot-demo/contracts/evaluation-pipeline.md`
