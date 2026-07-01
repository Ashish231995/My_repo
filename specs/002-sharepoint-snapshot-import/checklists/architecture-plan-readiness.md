# Architecture & Plan-Readiness Checklist: SharePoint-Synced Project Snapshot Import

**Purpose**: Architecture quality gate for Feature 002 before `/speckit-tasks`.

**Created**: 2026-07-01  
**Remediated**: 2026-07-01 (pre-task remediation pass)  
**Feature**: `002-sharepoint-snapshot-import`

**Artifacts reviewed**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/*`, `tests/fixtures/workbooks/README.md`

---

## 1. Constitution Compliance

- [x] **CHK001** — Principle I: FR/AS traceability in `contracts/implementation-traceability.md`
- [x] **CHK002** — Principle II: Memory-only; no persistence; parser bundled; ADR-010 acquisition
- [x] **CHK003** — Principle III: 001 scoring reused; no new health mappings (BR-001)
- [x] **CHK004** — Principle IV: Workbook → `mappingKey` → existing canonical types
- [x] **CHK005** — Principle V: `SET_PERSONA` re-project only for import evaluations
- [x] **CHK006** — Principle VI: `src/import/` pure modules; parser port isolation
- [x] **CHK007** — Principle VII: Test-first strategy; parser contract + injected port layering
- [x] **CHK008** — Principle VIII: Import invalid/refresh/reselect states in session contract

**Gate**: ✅ PASS

---

## 2. Baseline Extension Safety

- [x] **CHK009** — 001 scoring contracts untouched
- [x] **CHK010** — 001 golden tests must remain green (explicit regression rule)
- [x] **CHK011** — Sample A–C fallback preserved (FR-020, AS-016)
- [x] **CHK012** — Integration checklist bundled-only (FR-023, ADR session contract)
- [x] **CHK012a** — ADR-011 import-only: `validateImportedProject` separate; bundled `validateProject` unchanged

---

## 3. Architectural Boundaries

- [x] **CHK013** — Acquisition isolated (`src/import/acquisition/`)
- [x] **CHK014** — Parser adapter isolated (async `WorkbookParserPort`; `read-excel-file/browser` only in adapter)
- [x] **CHK015** — Validation before normalization
- [x] **CHK016** — Normalization before `runEvaluation`
- [x] **CHK017** — Structural vs evidence failure separation (spec iteration 3)

---

## 4. Dependency & Security

- [x] **CHK018** — Parser dependency justified (ADR-009 revision; Complexity Tracking)
- [x] **CHK019** — MIT license pinned `read-excel-file@9.2.0` (5.8.8 superseded)
- [x] **CHK020** — No runtime network for parser or SharePoint

---

## 5. Pre-task remediation items

- [x] **CHK021** — OI-001 resolved: `tests/fixtures/workbooks/README.md` manifest (cells, outcomes, SHA-256 column)
- [x] **CHK022** — OI-003 resolved: Node contract tests + injected orchestration port + browser smoke isolated
- [x] **CHK023** — ADR-010 refresh: handle `getFile()` vs file-input reselect documented
- [ ] **CHK024** — SHA-256 hashes populated when `.xlsx` binaries committed (implementation task 1)

**Readiness**: ✅ **APPROVED for `/speckit-tasks`** — pending CHK024 at binary commit only.
