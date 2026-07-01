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
| `complete-v1.xlsx` | `434588AC9E8BDD9336592F7BA9A5242D27CA93E63E5377FFD23CF9DB723FE079` | Authored; hash verified |
| `incomplete-team-empty-row2.xlsx` | `A2779BDB0EAD9B7E75A44D13FC10756E18F58AC0C9EAC7DF5F74385D80DA4811` | Authored; hash verified |
| `partial-schedule.xlsx` | `C72AC08FAB65DC5EEDBAA7385C93196F503012D8DC78D94F4FF79334BFF74D38` | Authored; hash verified |
| `all-dimensions-empty-row2.xlsx` | `1FA93B436C7FD311BFA77C8A2A90F94B457ECDBC1C4284129C3BBAA19FC82F9B` | Authored; hash verified |
| `invalid-template-version.xlsx` | `C228902DF7C423473A35D1504131D398B77F5929F1A1759D46F1B5D8C95F01D9` | Authored; hash verified |
| `missing-project-row2.xlsx` | `5A12FD1F41702A25BD57BA8C88131BDD09AC11E92EA19FBC1862950737C686BA` | Authored; hash verified |
| `extra-row3-data.xlsx` | `75FC1B155AC17CF459E56E21B4CBEDE06045C74FB820E2FC13AEDD663EDD0CAE` | Authored; hash verified |
| `malformed-dimension-values.xlsx` | `8C02E36A2CC025FBFE11B4A5B40A4A56877F0EFD53B3D998A246B88F24D54E29` | Authored; hash verified |
| `invalid-not-xlsx.bin` | `7E1C398764B976E6AACF0F97B6BE4ED1875B28B5DD4EA33787183A4BE3E2FCAD` | Authored; hash verified |

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

## `malformed-dimension-values.xlsx`

**Purpose**: BR-003, AS-006 — structurally valid workbook with invalid dimension evidence on row 2.

Same as `complete-v1.xlsx` except:

### Team (row 2) — malformed numeric

| Column | Value | Issue |
|--------|-------|-------|
| engagementScore | `150` | Out of range (valid: 0–100) |
| completionPercent | `90` | Valid |

### Delivery (row 2) — malformed enum

| Column | Value | Issue |
|--------|-------|-------|
| blockerState | `not-a-valid-state` | Not in enum (`none`, `closed`, `advisory`, `important`, `urgent`) |
| changeRatePercent | `12` | Valid |
| trendPercent | `-3` | Valid |

**Expected outcome**:

- Structural validation **passes** (Project row 2 valid).
- Normalize produces signals where malformed cells map to excluded evidence per 001 Signal Validity policy.
- `engagement-score` and/or `blocker-open` signals excluded with visible `exclusionReason` in evidence metadata (BR-003).
- Team and/or Delivery dimensions may be **Partial** or **Unmeasured** — never fabricated scores for excluded cells.
- No structural `import-invalid` solely due to dimension malformed values.

---

## `invalid-not-xlsx.bin`

**Purpose**: AS-007.

Arbitrary non-OOXML bytes (e.g. text `not an xlsx file`).

**Expected outcome**: Rejected before parse (`unsupported-file-type`).

---

## Parser contract test usage

| Test / verification | Coverage |
|---------------------|----------|
| `tests/import/readExcelFileParser.contract.test.ts` | All `.xlsx` files via production `createNodeReadExcelFileParser()` + `read-excel-file/node` |
| `tests/import/loadImportedProject.test.ts` | Injected `FakeWorkbookParser`; optional integration path with real parser |
| Manual **MV-008** (`quickstart.md`) | `complete-v1.xlsx` via production `createBrowserReadExcelFileParser` in Edge/Chrome + `npm run build` bundle check |

Browser Web Worker behaviour is **not** verified by Vitest/jsdom — use MV-008 only.

See `specs/002-sharepoint-snapshot-import/plan.md` §Testing Strategy for layering rules.
