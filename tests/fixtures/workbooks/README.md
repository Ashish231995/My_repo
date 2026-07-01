# Workbook Test Fixtures Manifest

**Feature**: `002-sharepoint-snapshot-import`  
**Location**: `tests/fixtures/workbooks/`  
**Contract**: `specs/002-sharepoint-snapshot-import/contracts/workbook-contract.md`

Committed minimal `.xlsx` binaries support parser contract tests, validation, normalization, and golden import scenarios. **No runtime workbook-writing dependency** — binaries are authored once (Excel, LibreOffice, or offline tooling) and committed; this manifest is the source of truth for cell content and expected outcomes.

## SHA-256 verification

After each binary is committed, compute and record its hash:

```powershell
Get-FileHash -Algorithm SHA256 tests/fixtures/workbooks/<filename>
```

CI or pre-commit MAY verify hashes against this manifest during implementation.

| File | SHA-256 | Status |
|------|---------|--------|
| `complete-v1.xlsx` | `pending` | Binary pending implementation commit |
| `incomplete-team-empty-row2.xlsx` | `pending` | Binary pending implementation commit |
| `partial-schedule.xlsx` | `pending` | Binary pending implementation commit |
| `all-dimensions-empty-row2.xlsx` | `pending` | Binary pending implementation commit |
| `invalid-template-version.xlsx` | `pending` | Binary pending implementation commit |
| `missing-project-row2.xlsx` | `pending` | Binary pending implementation commit |
| `extra-row3-data.xlsx` | `pending` | Binary pending implementation commit |
| `invalid-not-xlsx.bin` | `pending` | Non-xlsx bytes for MIME/extension guard |

---

## Shared conventions

- Row 1 = headers; row 2 = snapshot row (where populated).
- All valid structural workbooks include worksheets: `Project`, `Schedule`, `Delivery`, `Team`, `Risk` with contract header row 1.
- Dates as ISO `YYYY-MM-DD` text cells unless noted.
- `projectKey` for valid fixtures: `IMPORT-DEMO-001`.

---

## `complete-v1.xlsx`

**Purpose**: AS-001, AS-003 — complete import equivalent to approved canonical inputs.

### Project (row 2)

| Column | Value |
|--------|-------|
| templateVersion | `1.0` |
| projectKey | `IMPORT-DEMO-001` |
| projectName | `Import Demo Complete` |
| asOfDate | `2026-06-15` |

### Schedule (row 2)

| Column | Value |
|--------|-------|
| slipDays | `5` |
| onTimePercent | `85` |

### Delivery (row 2)

| Column | Value |
|--------|-------|
| blockerState | `advisory` |
| changeRatePercent | `12` |
| trendPercent | `-3` |

### Team (row 2)

| Column | Value |
|--------|-------|
| engagementScore | `72` |
| completionPercent | `90` |

### Risk (row 2)

| Column | Value |
|--------|-------|
| escalationPriority | `important` |
| gapPriority | `none` |

**Expected outcome**: Structural validation pass → normalize → evaluate → four **Measured** dimensions; composite eligible per Demonstration Policy v1.0.

---

## `incomplete-team-empty-row2.xlsx`

**Purpose**: AS-004 — structurally valid; Team Unmeasured.

Same as `complete-v1.xlsx` except **Team** worksheet has headers only (no row 2 data).

**Expected outcome**: Validation pass → Team **Unmeasured**; other dimensions Measured; composite per minimum-coverage rules.

---

## `partial-schedule.xlsx`

**Purpose**: AS-005 — Partial Schedule.

Same as `complete-v1.xlsx` except **Schedule** row 2 has only `slipDays` = `8` (`onTimePercent` empty).

**Expected outcome**: Schedule **Partial**; excluded from composite per 001 rules.

---

## `all-dimensions-empty-row2.xlsx`

**Purpose**: ADR-011 — zero `sourceSignals`; all dimensions Unmeasured.

**Project** row 2 populated (`templateVersion` `1.0`, `projectKey`, `asOfDate` `2026-06-15`).  
**Schedule**, **Delivery**, **Team**, **Risk**: headers only, no row 2.

**Expected outcome**: Structural validation pass → `sourceSignals.length === 0` → evaluate via import profile → all four dimensions **Unmeasured**; no fabricated scores.

---

## `invalid-template-version.xlsx`

**Purpose**: AS-022.

Same as `complete-v1.xlsx` except `templateVersion` = `2.0`.

**Expected outcome**: Structural failure `unsupported-template-version`; no evaluation.

---

## `missing-project-row2.xlsx`

**Purpose**: AS-008 — empty Project row 2.

All five worksheets present with headers; **Project** row 2 empty.

**Expected outcome**: Structural failure `missing-project-row`; no evaluation.

---

## `extra-row3-data.xlsx`

**Purpose**: AS-008 — rows 3+ contract data.

Same as `complete-v1.xlsx` plus **Schedule** row 3 cell `slipDays` = `99`.

**Expected outcome**: Structural failure `extra-data-rows`; no evaluation.

---

## `invalid-not-xlsx.bin`

**Purpose**: AS-007.

Arbitrary non-OOXML bytes (e.g. text `not an xlsx file`).

**Expected outcome**: Rejected before parse (`unsupported-file-type`).

---

## Parser contract test usage

| Test file | Fixtures read |
|-----------|---------------|
| `tests/import/readExcelFileParser.contract.test.ts` | All `.xlsx` files via `read-excel-file/node` |
| `tests/import/loadImportedProject.test.ts` | Injected `FakeWorkbookParser` + one integration path with real parser |
| `tests/browser/import-parser.smoke.test.ts` | `complete-v1.xlsx` via `read-excel-file/browser` (single smoke) |

See `specs/002-sharepoint-snapshot-import/plan.md` §Testing Strategy for layering rules.
